"use client"

import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { Download, Printer, RefreshCw } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"
import type { UserRole } from "@/types/roles"

export default function SupportStatisticsPage() {
  const searchParams = useSearchParams()
  const role = (searchParams.get("role") as UserRole) || "admin"
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [period, setPeriod] = useState("month3")
  const isMobile = useIsMobile()

  const supportData = [
    { name: "Социальная защита", value: 3450 },
    { name: "Образование", value: 2780 },
    { name: "Здравоохранение", value: 1560 },
    { name: "Полиция", value: 1152 },
  ]

  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"]

  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Данные обновлены",
        description: "Статистика по мерам поддержки успешно обновлена",
      })
    }, 1000)
  }

  const handlePrint = () => {
    toast({
      title: "Печать",
      description: "Отчет отправлен на печать",
    })
  }

  const handleDownload = () => {
    toast({
      title: "Скачивание",
      description: "Отчет скачивается в формате Excel",
    })
  }

  return (
    <DashboardLayout role={role}>
      <div className="flex-1 space-y-4 animate-fade-in">
        <Card className="enhanced-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-xl font-bold">Статистика по мерам поддержки</CardTitle>
              <CardDescription>Распределение мер поддержки по ведомствам</CardDescription>
            </div>
            <div className="flex items-center space-x-2 flex-wrap gap-2">
              <Label htmlFor="period" className="mr-2 hide-on-small">
                Период:
              </Label>
              <Select defaultValue={period} onValueChange={setPeriod}>
                <SelectTrigger id="period" className="w-[180px] max-w-full">
                  <SelectValue placeholder="Выберите период" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month1">Последний месяц</SelectItem>
                  <SelectItem value="month3">Последние 3 месяца</SelectItem>
                  <SelectItem value="month6">Последние 6 месяцев</SelectItem>
                  <SelectItem value="year1">Последний год</SelectItem>
                  <SelectItem value="all">Все время</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" onClick={refreshData} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
                <Button variant="outline" size="icon" onClick={handlePrint}>
                  <Printer className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isMobile ? (
              // Мобильная версия графика (горизонтальный бар-чарт)
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={supportData}
                    layout="vertical"
                    margin={{
                      top: 20,
                      right: 30,
                      left: 100,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                    <Tooltip />
                    <Bar dataKey="value" name="Количество" fill="hsl(var(--chart-1))">
                      {supportData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              // Десктопная версия графика (круговая диаграмма)
              <div className="h-[500px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={supportData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={180}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      animationDuration={1500}
                    >
                      {supportData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
