"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/date-picker"
import { FileSpreadsheet, FileText, Download, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { type UserRole, roleConfigs } from "@/types/roles"
import { getFromStorage, STORAGE_KEYS } from "@/lib/storage-utils"
// Импортируем функции для скачивания
import { downloadEmptyExcel, downloadEmptyPdf } from "@/lib/export-utils"

export default function ExportPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const role = (searchParams.get("role") as UserRole) || "admin"
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [exportType, setExportType] = useState("families")
  const [exportFormat, setExportFormat] = useState("excel")
  const roleConfig = roleConfigs[role]

  // Redirect if user doesn't have permission to export data
  useEffect(() => {
    if (!roleConfig.permissions.canExportData) {
      router.push(`/dashboard?role=${role}`)
    }
  }, [role, roleConfig.permissions.canExportData, router])

  const handleExport = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)

      // Получаем данные в зависимости от типа экспорта
      let data = []
      let fileName = ""

      switch (exportType) {
        case "families":
          data = getFromStorage(STORAGE_KEYS.FAMILIES, [])
          fileName = "Семьи"
          break
        case "children":
          data = getFromStorage(STORAGE_KEYS.FAMILY_MEMBERS, [])
          fileName = "Дети"
          break
        case "support":
          data = getFromStorage(STORAGE_KEYS.FAMILY_SUPPORT, [])
          fileName = "Меры_поддержки"
          break
        case "documents":
          data = getFromStorage(STORAGE_KEYS.FAMILY_DOCUMENTS, [])
          fileName = "Документы"
          break
        case "all":
          data = {
            families: getFromStorage(STORAGE_KEYS.FAMILIES, []),
            members: getFromStorage(STORAGE_KEYS.FAMILY_MEMBERS, []),
            support: getFromStorage(STORAGE_KEYS.FAMILY_SUPPORT, []),
            documents: getFromStorage(STORAGE_KEYS.FAMILY_DOCUMENTS, []),
          }
          fileName = "Все_данные"
          break
        default:
          data = getFromStorage(STORAGE_KEYS.FAMILIES, [])
          fileName = "Данные"
      }

      // Добавляем запись в историю экспорта
      const exportHistory = getFromStorage(STORAGE_KEYS.EXPORT_HISTORY, [])
      const newExport = {
        id: exportHistory.length + 1,
        fileName: `${fileName}.${exportFormat}`,
        date: new Date().toLocaleString("ru-RU"),
        type: exportType,
        format: exportFormat,
        user: "Текущий пользователь",
      }

      // Сохраняем историю экспорта
      localStorage.setItem(STORAGE_KEYS.EXPORT_HISTORY, JSON.stringify([newExport, ...exportHistory]))

      toast({
        title: "Экспорт данных",
        description: `Данные успешно экспортированы в формате ${exportFormat.toUpperCase()}`,
      })
    }, 2000)
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
                  <Select defaultValue="families" onValueChange={(value) => setExportType(value)}>
                    <SelectTrigger id="exportType">
                      <SelectValue placeholder="Выберите тип экспорта" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="families">Данные о семьях</SelectItem>
                      <SelectItem value="children">Данные о детях</SelectItem>
                      <SelectItem value="support">Меры поддержки</SelectItem>
                      <SelectItem value="statistics">Статистические данные</SelectItem>
                      <SelectItem value="documents">Документы</SelectItem>
                      <SelectItem value="all">Все данные</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="exportFormat">Формат файла</Label>
                  <Select defaultValue="excel" onValueChange={(value) => setExportFormat(value)}>
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
                  <Select defaultValue="all">
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Период с</Label>
                    <DatePicker />
                  </div>
                  <div className="grid gap-2">
                    <Label>Период по</Label>
                    <DatePicker />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Дополнительные параметры</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="includePersonalData" />
                      <Label htmlFor="includePersonalData" className="font-normal">
                        Включить персональные данные
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="includeContacts" />
                      <Label htmlFor="includeContacts" className="font-normal">
                        Включить контактные данные
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="includeDocuments" />
                      <Label htmlFor="includeDocuments" className="font-normal">
                        Включить список документов
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="includeHistory" />
                      <Label htmlFor="includeHistory" className="font-normal">
                        Включить историю изменений
                      </Label>
                    </div>
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

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Последние экспорты</CardTitle>
                    <CardDescription>История экспорта данных</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <FileSpreadsheet className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm font-medium">Данные о семьях.xlsx</p>
                            <p className="text-xs text-muted-foreground">17.04.2025, 14:30</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            downloadEmptyExcel("Данные о семьях")
                            toast({
                              title: "Скачивание файла",
                              description: "Файл 'Данные о семьях.xlsx' скачивается",
                            })
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-red-500" />
                          <div>
                            <p className="text-sm font-medium">Статистика по районам.pdf</p>
                            <p className="text-xs text-muted-foreground">15.04.2025, 10:15</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            downloadEmptyPdf("Статистика по районам")
                            toast({
                              title: "Скачивание файла",
                              description: "Файл 'Статистика по районам.pdf' скачивается",
                            })
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <FileSpreadsheet className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm font-medium">Меры поддержки.xlsx</p>
                            <p className="text-xs text-muted-foreground">12.04.2025, 09:45</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            downloadEmptyExcel("Меры поддержки")
                            toast({
                              title: "Скачивание файла",
                              description: "Файл 'Меры поддержки.xlsx' скачивается",
                            })
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium">Данные о детях.csv</p>
                            <p className="text-xs text-muted-foreground">10.04.2025, 16:20</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            downloadEmptyExcel("Данные о детях")
                            toast({
                              title: "Скачивание файла",
                              description: "Файл 'Данные о детях.csv' скачивается",
                            })
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <FileSpreadsheet className="h-5 w-5 text-purple-500" />
                          <div>
                            <p className="text-sm font-medium">Полный экспорт.json</p>
                            <p className="text-xs text-muted-foreground">05.04.2025, 11:30</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            downloadEmptyExcel("Полный экспорт")
                            toast({
                              title: "Скачивание файла",
                              description: "Файл 'Полный экспорт.json' скачивается",
                            })
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Запланированные экспорты</CardTitle>
                    <CardDescription>Автоматический экспорт данных</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div>
                          <p className="text-sm font-medium">Еженедельный отчет</p>
                          <p className="text-xs text-muted-foreground">Каждый понедельник, 08:00</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Изменение расписания",
                                description: "Открыто окно редактирования расписания",
                              })
                            }}
                          >
                            Изменить
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => {
                              toast({
                                title: "Отмена экспорта",
                                description: "Запланированный экспорт отменен",
                              })
                            }}
                          >
                            Отменить
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div>
                          <p className="text-sm font-medium">Ежемесячный отчет</p>
                          <p className="text-xs text-muted-foreground">1-е число каждого месяца, 09:00</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Изменение расписания",
                                description: "Открыто окно редактирования расписания",
                              })
                            }}
                          >
                            Изменить
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => {
                              toast({
                                title: "Отмена экспорта",
                                description: "Запланированный экспорт отменен",
                              })
                            }}
                          >
                            Отменить
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => {
                        toast({
                          title: "Добавление экспорта",
                          description: "Открыто окно добавления запланированного экспорта",
                        })
                      }}
                    >
                      Добавить запланированный экспорт
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
