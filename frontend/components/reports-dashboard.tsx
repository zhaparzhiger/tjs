"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/date-picker"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Plus, Search, FileSpreadsheet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ReportService } from "@/services/report-service"
import type { Report } from "@/types/models"
import type { UserRole } from "@/types/roles"
import { downloadEmptyExcel } from "@/lib/export-utils"

interface ReportsDashboardProps {
  role: UserRole
}

export function ReportsDashboard({ role }: ReportsDashboardProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [reports, setReports] = useState<Report[]>([])
  const [isCreatingReport, setIsCreatingReport] = useState(false)
  const [newReportName, setNewReportName] = useState("")
  const [newReportType, setNewReportType] = useState("families")
  const [newReportDescription, setNewReportDescription] = useState("")

  useEffect(() => {
    // Загрузка отчетов из localStorage
    const loadedReports = ReportService.getReports()
    setReports(loadedReports)
  }, [])

  const handleCreateReport = () => {
    if (!newReportName.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название отчета",
        variant: "destructive",
      })
      return
    }

    const newReport = ReportService.createReport({
      name: newReportName,
      description: newReportDescription,
      type: newReportType,
      date: new Date().toLocaleDateString("ru-RU"),
      author: "Текущий пользователь",
    })

    setReports([newReport, ...reports])
    setIsCreatingReport(false)
    setNewReportName("")
    setNewReportType("families")
    setNewReportDescription("")

    toast({
      title: "Отчет создан",
      description: "Новый отчет успешно создан",
    })
  }

  const handleDownloadReport = (report: Report) => {
    downloadEmptyExcel(report.name)

    toast({
      title: "Отчет скачан",
      description: `Отчет "${report.name}" успешно скачан`,
    })
  }

  const filteredReports = reports.filter((report) => {
    if (activeTab !== "all" && report.type !== activeTab) {
      return false
    }

    if (searchQuery) {
      return (
        report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return true
  })

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case "families":
        return "Семьи"
      case "children":
        return "Дети"
      case "support":
        return "Меры поддержки"
      case "analytics":
        return "Аналитика"
      default:
        return type
    }
  }

  const getReportTypeBadge = (type: string) => {
    switch (type) {
      case "families":
        return <Badge className="bg-blue-600">Семьи</Badge>
      case "children":
        return <Badge className="bg-green-600">Дети</Badge>
      case "support":
        return <Badge className="bg-purple-600">Меры поддержки</Badge>
      case "analytics":
        return <Badge className="bg-amber-600">Аналитика</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Отчеты</h2>
        <Button onClick={() => setIsCreatingReport(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Создать отчет
        </Button>
      </div>

      {isCreatingReport ? (
        <Card>
          <CardHeader>
            <CardTitle>Создание нового отчета</CardTitle>
            <CardDescription>Заполните информацию для создания нового отчета</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="report-name">Название отчета</Label>
              <Input
                id="report-name"
                value={newReportName}
                onChange={(e) => setNewReportName(e.target.value)}
                placeholder="Введите название отчета"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="report-type">Тип отчета</Label>
              <Select value={newReportType} onValueChange={setNewReportType}>
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Выберите тип отчета" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="families">Семьи</SelectItem>
                  <SelectItem value="children">Дети</SelectItem>
                  <SelectItem value="support">Меры поддержки</SelectItem>
                  <SelectItem value="analytics">Аналитика</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="report-description">Описание</Label>
              <Input
                id="report-description"
                value={newReportDescription}
                onChange={(e) => setNewReportDescription(e.target.value)}
                placeholder="Введите описание отчета"
              />
            </div>
            <div className="grid gap-2">
              <Label>Дата создания</Label>
              <DatePicker />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setIsCreatingReport(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreateReport}>Создать отчет</Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск отчетов..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="reports-tabs-container">
              <Tabs defaultValue="all" className="w-full md:w-auto" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="reports-tabs">
                  <TabsTrigger value="all" className="tabs-trigger">
                    Все
                  </TabsTrigger>
                  <TabsTrigger value="families" className="tabs-trigger">
                    Семьи
                  </TabsTrigger>
                  <TabsTrigger value="children" className="tabs-trigger">
                    Дети
                  </TabsTrigger>
                  <TabsTrigger value="support" className="tabs-trigger">
                    Меры поддержки
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="tabs-trigger">
                    Аналитика
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <Card key={report.id} className="overflow-hidden transition-all hover:shadow-md">
                  <CardHeader className="pb-2 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{report.name}</CardTitle>
                        <CardDescription className="mt-1 text-xs">
                          Создан: {report.date} • Автор: {report.author}
                        </CardDescription>
                      </div>
                      {getReportTypeBadge(report.type)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-600 line-clamp-2">{report.description || "Нет описания"}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between bg-gray-50 border-t">
                    <Button variant="ghost" size="sm" className="text-xs">
                      <FileText className="mr-1 h-3 w-3" />
                      Просмотр
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleDownloadReport(report)}>
                      <Download className="mr-1 h-3 w-3" />
                      Скачать
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
                <FileSpreadsheet className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium">Отчеты не найдены</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {searchQuery
                    ? "Попробуйте изменить параметры поиска"
                    : "Создайте новый отчет, нажав на кнопку «Создать отчет»"}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
