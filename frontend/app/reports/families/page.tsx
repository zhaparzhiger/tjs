"use client"

import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { FileText, Download, Printer, Filter, Search, RefreshCw } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import type { UserRole } from "@/types/roles"
import { exportToExcel } from "@/lib/export-utils"
import { getFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage-utils"
import type { Report } from "@/types/models"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export default function FamilyReportsPage() {
  const searchParams = useSearchParams()
  const role = (searchParams.get("role") as UserRole) || "admin"
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [reports, setReports] = useState<Report[]>(() => {
    // Получаем отчеты из localStorage или используем демо-данные
    const storedReports = getFromStorage<Report[]>(STORAGE_KEYS.REPORTS, [])
    const familyReports = storedReports.filter((r) => r.type.includes("Семьи") || r.type === "Аналитический")

    return familyReports.length > 0
      ? familyReports
      : [
          {
            id: 1,
            name: "Семьи в ТЖС по районам",
            description: "Распределение семей в ТЖС по районам Павлодарской области",
            date: "17.04.2025",
            author: "Иванов П.С.",
            type: "Аналитический",
          },
          {
            id: 2,
            name: "Неблагополучные семьи",
            description: "Список неблагополучных семей с детьми",
            date: "15.04.2025",
            author: "Петрова А.В.",
            type: "Статистический",
          },
          {
            id: 3,
            name: "Многодетные семьи",
            description: "Список многодетных семей в ТЖС",
            date: "12.04.2025",
            author: "Сидоров К.Н.",
            type: "Статистический",
          },
          {
            id: 4,
            name: "Динамика изменений",
            description: "Изменение количества семей в ТЖС по месяцам",
            date: "10.04.2025",
            author: "Ким Е.С.",
            type: "Аналитический",
          },
          {
            id: 5,
            name: "Семьи с детьми-инвалидами",
            description: "Список семей с детьми-инвалидами",
            date: "05.04.2025",
            author: "Ахметов С.Б.",
            type: "Статистический",
          },
        ]
  })

  // Добавим состояние для диалога создания отчета
  const [isCreateReportOpen, setIsCreateReportOpen] = useState(false)
  const [newReport, setNewReport] = useState({
    name: "",
    description: "",
    type: "Статистический",
  })

  const filteredReports = reports.filter(
    (report) =>
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.author.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handlePrint = (id: number) => {
    const report = reports.find((r) => r.id === id)
    if (!report) return

    // Имитация печати
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
      <html>
        <head>
          <title>${report.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            p { margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <h1>${report.name}</h1>
          <p><strong>Описание:</strong> ${report.description}</p>
          <p><strong>Тип:</strong> ${report.type}</p>
          <p><strong>Дата:</strong> ${report.date}</p>
          <p><strong>Автор:</strong> ${report.author}</p>
          <hr>
          <p>Содержимое отчета...</p>
        </body>
      </html>
    `)
      printWindow.document.close()
      printWindow.print()
    }

    toast({
      title: "Печать отчета",
      description: "Отчет отправлен на печать",
    })
  }

  const handleDownload = (id: number) => {
    const report = reports.find((r) => r.id === id)
    if (!report) return

    // Имитация скачивания Excel
    exportToExcel(
      [
        {
          name: report.name,
          description: report.description,
          type: report.type,
          date: report.date,
          author: report.author,
        },
      ],
      report.name,
    )

    toast({
      title: "Скачивание отчета",
      description: "Отчет скачивается в формате Excel",
    })
  }

  const handleCreateReport = () => {
    setIsCreateReportOpen(true)
  }

  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Данные обновлены",
        description: "Список отчетов успешно обновлен",
      })
    }, 1000)
  }

  const saveNewReport = () => {
    // Создаем новый отчет
    const report: Report = {
      id: Math.max(0, ...reports.map((r) => r.id)) + 1,
      name: newReport.name,
      description: newReport.description,
      type: newReport.type,
      date: new Date().toLocaleDateString("ru-RU"),
      author: "Текущий пользователь",
    }

    // Обновляем состояние
    const updatedReports = [...reports, report]
    setReports(updatedReports)

    // Сохраняем в localStorage
    const allReports = getFromStorage<Report[]>(STORAGE_KEYS.REPORTS, [])
    saveToStorage(STORAGE_KEYS.REPORTS, [...allReports, report])

    // Закрываем диалог и показываем уведомление
    setIsCreateReportOpen(false)
    setNewReport({ name: "", description: "", type: "Статистический" })

    toast({
      title: "Отчет создан",
      description: "Новый отчет успешно создан",
    })
  }

  return (
    <DashboardLayout role={role}>
      <div className="flex-1 space-y-4 animate-fade-in">
        <Card className="enhanced-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-xl font-bold">Отчеты по семьям</CardTitle>
              <CardDescription>Управление отчетами о семьях в ТЖС</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Обновить
              </Button>
              <Button size="sm" onClick={handleCreateReport}>
                <FileText className="mr-2 h-4 w-4" />
                Создать отчет
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск отчетов..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full sm:w-64"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="grid gap-2">
                  <Label htmlFor="reportType" className="sr-only">
                    Тип отчета
                  </Label>
                  <Select>
                    <SelectTrigger id="reportType" className="w-[180px]">
                      <SelectValue placeholder="Все типы" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все типы</SelectItem>
                      <SelectItem value="analytical">Аналитические</SelectItem>
                      <SelectItem value="statistical">Статистические</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table className="enhanced-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Название отчета</TableHead>
                    <TableHead>Описание</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Автор</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                      <TableRow key={report.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">{report.name}</TableCell>
                        <TableCell>{report.description}</TableCell>
                        <TableCell>{report.type}</TableCell>
                        <TableCell>{report.date}</TableCell>
                        <TableCell>{report.author}</TableCell>
                        <TableCell>
                          <div className="flex justify-end space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => handlePrint(report.id)}>
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDownload(report.id)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Отчеты не найдены
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <Dialog open={isCreateReportOpen} onOpenChange={setIsCreateReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать новый отчет</DialogTitle>
            <DialogDescription>Заполните информацию для создания нового отчета</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reportName">Название отчета</Label>
              <Input
                id="reportName"
                value={newReport.name}
                onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reportDescription">Описание</Label>
              <Textarea
                id="reportDescription"
                value={newReport.description}
                onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reportType">Тип отчета</Label>
              <Select value={newReport.type} onValueChange={(value) => setNewReport({ ...newReport, type: value })}>
                <SelectTrigger id="reportType">
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Аналитический">Аналитический</SelectItem>
                  <SelectItem value="Статистический">Статистический</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateReportOpen(false)}>
              Отмена
            </Button>
            <Button onClick={saveNewReport}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
