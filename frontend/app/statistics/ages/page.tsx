"use client"

import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { Download, Printer, RefreshCw } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import type { UserRole } from "@/types/roles"

export default function AgesStatisticsPage() {
  const searchParams = useSearchParams()
  const role = (searchParams.get("role") as UserRole) || "admin"
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [period, setPeriod] = useState("month3")

  const ageData = [
    { name: "0-3 года", value: 487 },
    { name: "4-6 лет", value: 612 },
    { name: "7-10 лет", value: 845 },
    { name: "11-14 лет", value: 768 },
    { name: "15-18 лет", value: 715 },
    { name: "18-23 года", value: 425 },
  ]

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Данные обновлены",
        description: "Статистика по возрастам успешно обновлена",
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
              <CardTitle className="text-xl font-bold">Статистика по возрастам</CardTitle>
              <CardDescription>Распределение детей в ТЖС по возрастным группам</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="period" className="mr-2">
                Период:
              </Label>
              <Select defaultValue={period} onValueChange={setPeriod}>
                <SelectTrigger id="period" className="w-[180px]">
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
          </CardHeader>
          <CardContent>
            <div className="h-[500px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ageData}
                  layout="vertical"
                  margin={{
                    top: 20,
                    right: 30,
                    left: 80,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 12 }}
                    tickLine={{ stroke: "var(--border)" }}
                    axisLine={{ stroke: "var(--border)" }}
                  />
                  <Tooltip />
                  <Legend wrapperStyle={{ paddingTop: 10 }} iconType="circle" />
                  <Bar dataKey="value" name="Количество детей" radius={[0, 4, 4, 0]} animationDuration={1500}>
                    {ageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
