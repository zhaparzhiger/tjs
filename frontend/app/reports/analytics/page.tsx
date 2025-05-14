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

export default function AnalyticsReportsPage() {
  const searchParams = useSearchParams()
  const role = (searchParams.get("role") as UserRole) || "admin"
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const reports = [
    {
      id: 1,
      name: "Динамика изменений",
      description: "Изменение количества семей в ТЖС по месяцам",
      date: "14.04.2025",
      author: "Иванов П.С.",
      type: "Аналитический",
    },
    {
      id: 2,
      name: "Эффективность мер поддержки",
      description: "Анализ эффективности оказанных мер поддержки",
      date: "12.04.2025",
      author: "Петрова А.В.",
      type: "Аналитический",
    },
    {
      id: 3,
      name: "Прогноз на следующий квартал",
      description: "Прогнозирование количества семей в ТЖС",
      date: "09.04.2025",
      author: "Сидоров К.Н.",
      type: "Аналитический",
    },
    {
      id: 4,
      name: "Сравнительный анализ по районам",
      description: "Сравнение показателей по районам Павлодарской области",
      date: "07.04.2025",
      author: "Ким Е.С.",
      type: "Аналитический",
    },
    {
      id: 5,
      name: "Корреляционный анализ",
      description: "Анализ взаимосвязи различных факторов",
      date: "02.04.2025",
      author: "Ахметов С.Б.",
      type: "Аналитический",
    },
  ]

  const filteredReports = reports.filter(
    (report) =>
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.author.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handlePrint = (id: number) => {
    toast({
      title: "Печать отчета",
      description: "Отчет отправлен на печать",
    })
  }

  const handleDownload = (id: number) => {
    toast({
      title: "Скачивание отчета",
      description: "Отчет скачивается в формате Excel",
    })
  }

  const handleCreateReport = () => {
    toast({
      title: "Создание отчета",
      description: "Открыта форма создания нового отчета",
    })
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

  return (
    <DashboardLayout role={role}>
      <div className="flex-1 space-y-4 animate-fade-in">
        <Card className="enhanced-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-xl font-bold">Аналитические отчеты</CardTitle>
              <CardDescription>Управление аналитическими отчетами системы</CardDescription>
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
                  <Label htmlFor="period" className="sr-only">
                    Период
                  </Label>
                  <Select>
                    <SelectTrigger id="period" className="w-[180px]">
                      <SelectValue placeholder="Все периоды" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все периоды</SelectItem>
                      <SelectItem value="month">Последний месяц</SelectItem>
                      <SelectItem value="quarter">Последний квартал</SelectItem>
                      <SelectItem value="year">Последний год</SelectItem>
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
    </DashboardLayout>
  )
}
