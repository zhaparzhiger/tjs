"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input" // Add Input component
import { FileSpreadsheet, FileText, Download, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { type UserRole, roleConfigs } from "@/types/roles"
import { getFromStorage, STORAGE_KEYS } from "@/lib/storage-utils"
import axios from "axios"
import { DatePicker } from "@/components/date-picker"

export default function ExportPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const role = (searchParams.get("role") as UserRole) || "admin"
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [exportType, setExportType] = useState("families")
  const [exportFormat, setExportFormat] = useState("excel")
  const [district, setDistrict] = useState("all")
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [searchQuery, setSearchQuery] = useState("") // New state for search
  const [exportHistory, setExportHistory] = useState<any[]>([])
  const roleConfig = roleConfigs[role]

  useEffect(() => {
    if (!roleConfig.permissions.canExportData) {
      router.push(`/dashboard?role=${role}`)
    }
    const history = getFromStorage(STORAGE_KEYS.EXPORT_HISTORY, [])
    setExportHistory(history)
  }, [role, roleConfig.permissions.canExportData, router])

  const handleExport = async () => {
    setIsLoading(true)
    try {
      const endpointMap: { [key: string]: string } = {
        families: "http://localhost:5555/api/reports/families",
        children: "http://localhost:5555/api/reports/members",
        support: "http://localhost:5555/api/reports/support",
        statistics: "http://localhost:5555/api/reports/analytics",
      }

      const endpoint = endpointMap[exportType]
      if (!endpoint) {
        throw new Error("Invalid export type")
      }

      const params = new URLSearchParams()
      if (district !== "all") params.append("district", district)
      if (startDate) params.append("startDate", startDate.toISOString())
      if (endDate) params.append("endDate", endDate.toISOString())
      if (searchQuery) params.append("search", searchQuery)
      params.append("format", exportFormat)

      console.log(`Exporting with search: "${searchQuery || "none"}"`)

      try {
        const response = await axios.get(`${endpoint}?${params.toString()}`, {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        })

        // Check if the response is an error message (small JSON response instead of a file)
        if (response.data.size < 1000 && response.headers["content-type"].includes("application/json")) {
          const reader = new FileReader()
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result as string)
              throw new Error(errorData.message || "Export failed")
            } catch (e) {
              throw new Error("Export failed: No data found")
            }
          }
          reader.readAsText(response.data)
          return
        }

        const url = window.URL.createObjectURL(new Blob([response.data]))
        const fileName = `${exportType}-report-${new Date().toISOString().split("T")[0]}.${
          exportFormat === "excel" ? "xlsx" : exportFormat
        }`
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", fileName)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        const newExport = {
          id: exportHistory.length + 1,
          fileName,
          date: new Date().toLocaleString("ru-RU"),
          type: exportType,
          format: exportFormat,
          user: "Текущий пользователь",
          params: {
            district: district !== "all" ? district : undefined,
            startDate: startDate?.toISOString(),
            endDate: endDate?.toISOString(),
            search: searchQuery || undefined,
          },
        }

        const updatedHistory = [newExport, ...exportHistory]
        localStorage.setItem(STORAGE_KEYS.EXPORT_HISTORY, JSON.stringify(updatedHistory))
        setExportHistory(updatedHistory)

        toast({
          title: "Экспорт данных",
          description: `Данные успешно экспортированы в формате ${exportFormat.toUpperCase()}`,
        })
      } catch (error) {
        console.error("Export request error:", error)
        throw error
      }
    } catch (error) {
      console.error("Export error:", error)
      const message =
        error.response?.status === 404
          ? "Семья не найдена по указанному запросу. Попробуйте другой ФИО или ИИН."
          : "Не удалось экспортировать данные. Пожалуйста, попробуйте снова."
      toast({
        title: "Ошибка экспорта",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!roleConfig.permissions.canExportData) {
    return null
  }

  return (
    <DashboardLayout role={role}>
      <div className="flex-1 space-y-4 animate-fade-in">
        <Card className="enhanced-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center">
              <FileSpreadsheet className="mr-2 h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-xl font-bold">Экспорт данных</CardTitle>
                <CardDescription>Выгрузка данных из системы в различных форматах</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="exportType">Тип экспорта</Label>
                  <Select value={exportType} onValueChange={setExportType}>
                    <SelectTrigger id="exportType">
                      <SelectValue placeholder="Выберите тип экспорта" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="families">Данные о семьях</SelectItem>
                      <SelectItem value="children">Данные о детях</SelectItem>
                      <SelectItem value="support">Меры поддержки</SelectItem>
                      <SelectItem value="statistics">Статистические данные</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="exportFormat">Формат файла</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger id="exportFormat">
                      <SelectValue placeholder="Выберите формат файла" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                      <SelectItem value="csv">CSV (.csv)</SelectItem>
                      <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                      <SelectItem value="json">JSON (.json)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="district">Район</Label>
                  <Select value={district} onValueChange={setDistrict}>
                    <SelectTrigger id="district">
                      <SelectValue placeholder="Выберите район" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все районы</SelectItem>
                      <SelectItem value="irtysh">Иртышский</SelectItem>
                      <SelectItem value="terenkol">Теренкольский</SelectItem>
                      <SelectItem value="akkuli">Аккулинский</SelectItem>
                      <SelectItem value="mayskiy">Майский</SelectItem>
                      <SelectItem value="kachiry">Качирский</SelectItem>
                      <SelectItem value="uspenka">Успенский</SelectItem>
                      <SelectItem value="sherbakty">Щербактинский</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="searchQuery">Поиск семьи (ФИО или ИИН)</Label>
                  <Input
                    id="searchQuery"
                    placeholder="Введите ФИО семьи или ИИН члена семьи"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Период с</Label>
                    <DatePicker date={startDate} setDate={setStartDate} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Период по</Label>
                    <DatePicker date={endDate} setDate={setEndDate} />
                  </div>
                </div>

                <Button className="w-full" onClick={handleExport} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Экспорт данных...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Экспортировать данные
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Последние экспорты</h3>
                  {exportHistory.length > 7 && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() =>
                        toast({
                          title: "История экспортов",
                          description: "Полная история экспортов будет доступна в следующем обновлении",
                        })
                      }
                    >
                      Показать все
                    </Button>
                  )}
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {exportHistory.slice(0, 7).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {item.format === "pdf" ? (
                          <FileText className="h-5 w-5 text-red-500" />
                        ) : (
                          <FileSpreadsheet className="h-5 w-5 text-green-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{item.fileName}</p>
                          <p className="text-xs text-muted-foreground">{item.date}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          setIsLoading(true)
                          try {
                            const response = await axios.post(
                              "http://localhost:5555/api/reports/regenerate",
                              {
                                type: item.type,
                                format: item.format,
                                params: item.params,
                              },
                              {
                                responseType: "blob",
                                headers: {
                                  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                                },
                              },
                            )

                            const url = window.URL.createObjectURL(new Blob([response.data]))
                            const link = document.createElement("a")
                            link.href = url
                            link.setAttribute("download", item.fileName)
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                            window.URL.revokeObjectURL(url)

                            toast({
                              title: "Файл скачан",
                              description: `Файл '${item.fileName}' успешно скачан`,
                            })
                          } catch (error) {
                            console.error("Re-download error:", error)
                            toast({
                              title: "Ошибка скачивания",
                              description: "Не удалось скачать файл. Пожалуйста, попробуйте снова.",
                              variant: "destructive",
                            })
                          } finally {
                            setIsLoading(false)
                          }
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {exportHistory.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileSpreadsheet className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>История экспортов пуста</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
