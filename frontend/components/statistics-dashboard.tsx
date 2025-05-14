"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
  Line,
  LineChart,
} from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import type { UserRole } from "@/types/roles"
import { Button } from "@/components/ui/button"
import { Download, Printer, RefreshCw, MapPin } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface StatisticsDashboardProps {
  role: UserRole
}

export function StatisticsDashboard({ role }: StatisticsDashboardProps) {
  const [period, setPeriod] = useState("month3")
  const [isLoading, setIsLoading] = useState(false)
  const isMobile = useIsMobile()

  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  // Заменить данные о районах
  const districtData = [
    { name: "Иртышский", families: 245, children: 612 },
    { name: "Теренкольский", families: 312, children: 780 },
    { name: "Аккулинский", families: 187, children: 468 },
    { name: "Майский", families: 156, children: 390 },
    { name: "Качирский", families: 98, children: 245 },
    { name: "Успенский", families: 125, children: 312 },
    { name: "Щербактинский", families: 125, children: 620 },
  ]

  const monthlyData = [
    { month: "Янв", families: 1150, newCases: 45, resolved: 15 },
    { month: "Фев", families: 1180, newCases: 30, resolved: 20 },
    { month: "Мар", families: 1210, newCases: 35, resolved: 25 },
    { month: "Апр", families: 1248, newCases: 38, resolved: 18 },
    { month: "Май", families: 1268, newCases: 42, resolved: 22 },
    { month: "Июн", families: 1288, newCases: 36, resolved: 16 },
  ]

  const supportData = [
    { name: "Социальная защита", value: 3450 },
    { name: "Образование", value: 2780 },
    { name: "Здравоохранение", value: 1560 },
    { name: "Полиция", value: 1152 },
  ]

  const familyTypeData = [
    { name: "Полная семья", value: 520 },
    { name: "Одинокая мать", value: 380 },
    { name: "Вдова", value: 85 },
    { name: "В разводе", value: 195 },
    { name: "С отчимом/мачехой", value: 68 },
    { name: "С бабушкой и дедушкой", value: 45 },
    { name: "Опекун", value: 35 },
  ]

  const ageData = [
    { name: "0-3 года", value: 487 },
    { name: "4-6 лет", value: 612 },
    { name: "7-10 лет", value: 845 },
    { name: "11-14 лет", value: 768 },
    { name: "15-17 лет", value: 715 },
    { name: "18-23 года", value: 425 },
  ]

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--chart-6))",
    "hsl(var(--chart-7))",
    "hsl(var(--chart-8))",
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border border-border rounded-md shadow-lg">
          <p className="font-medium text-sm">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="text-xs" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      )
    }

    return null
  }

  return (
    <div className="grid gap-4 animate-fade-in">
      <Card className="enhanced-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 statistics-header">
          <div>
            <CardTitle className="text-xl font-bold">Статистика и аналитика</CardTitle>
            <CardDescription>Визуализация данных о семьях в ТЖС</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2 statistics-actions">
            <div className="flex items-center gap-2">
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
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={refreshData} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <Button variant="outline" size="icon">
                <Printer className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 dashboard-stats">
        <Card className="col-span-4 enhanced-card animate-slide-in-right dashboard-card">
          <CardHeader className="dashboard-card-header">
            <CardTitle>Распределение семей по районам</CardTitle>
            <CardDescription>Количество семей в ТЖС и детей по районам города</CardDescription>
          </CardHeader>
          <CardContent className="pl-2 dashboard-card-content">
            <div className="statistics-chart-container">
              {isMobile ? (
                <div className="h-[300px] mobile-simple-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={districtData.slice(0, 5)} // Показываем только первые 5 районов на мобильном
                      margin={{ top: 5, right: 10, left: 10, bottom: 30 }}
                      barSize={20}
                    >
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={50}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis hide={true} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="families" fill="hsl(var(--chart-1))" name="Семьи" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <ChartContainer
                  config={{
                    families: {
                      label: "Семьи",
                      color: "hsl(var(--chart-1))",
                    },
                    children: {
                      label: "Дети",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px] dashboard-chart"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={districtData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 20,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: "var(--border)" }}
                        axisLine={{ stroke: "var(--border)" }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: "var(--border)" }}
                        axisLine={{ stroke: "var(--border)" }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ paddingTop: 10 }} iconType="circle" />
                      <Bar
                        dataKey="families"
                        fill="hsl(var(--chart-1))"
                        name="Семьи"
                        radius={[4, 4, 0, 0]}
                        animationDuration={1500}
                      />
                      <Bar
                        dataKey="children"
                        fill="hsl(var(--chart-2))"
                        name="Дети"
                        radius={[4, 4, 0, 0]}
                        animationDuration={1500}
                        animationBegin={300}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          className="col-span-3 enhanced-card animate-slide-in-right dashboard-card"
          style={{ animationDelay: "0.1s" }}
        >
          <CardHeader className="dashboard-card-header">
            <CardTitle>Динамика изменения</CardTitle>
            <CardDescription>Изменение количества семей в ТЖС по месяцам</CardDescription>
          </CardHeader>
          <CardContent className="pl-2 dashboard-card-content">
            <div className="statistics-chart-container">
              {isMobile ? (
                <div className="h-[300px] mobile-simple-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis
                        type="number"
                        domain={[0, 1400]}
                        ticks={[0, 350, 700, 1050, 1400]}
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="families"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        dot={false}
                        name="Всего семей"
                      />
                      <Line
                        type="monotone"
                        dataKey="newCases"
                        stroke="hsl(var(--chart-3))"
                        strokeWidth={2}
                        dot={false}
                        name="Новые случаи"
                      />
                      <Line
                        type="monotone"
                        dataKey="resolved"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        dot={false}
                        name="Решенные случаи"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <ChartContainer
                  config={{
                    families: {
                      label: "Всего семей",
                      color: "hsl(var(--chart-1))",
                    },
                    newCases: {
                      label: "Новые случаи",
                      color: "hsl(var(--chart-3))",
                    },
                    resolved: {
                      label: "Решенные случаи",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px] dashboard-chart"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={monthlyData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: "var(--border)" }}
                        axisLine={{ stroke: "var(--border)" }}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: "var(--border)" }}
                        axisLine={{ stroke: "var(--border)" }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ paddingTop: 10 }} iconType="circle" />
                      <Area
                        type="monotone"
                        dataKey="families"
                        stroke="hsl(var(--chart-1))"
                        fill="hsl(var(--chart-1) / 0.2)"
                        name="Всего семей"
                        animationDuration={1500}
                      />
                      <Area
                        type="monotone"
                        dataKey="newCases"
                        stroke="hsl(var(--chart-3))"
                        fill="hsl(var(--chart-3) / 0.2)"
                        name="Новые случаи"
                        animationDuration={1500}
                        animationBegin={300}
                      />
                      <Area
                        type="monotone"
                        dataKey="resolved"
                        stroke="hsl(var(--chart-2))"
                        fill="hsl(var(--chart-2) / 0.2)"
                        name="Решенные случаи"
                        animationDuration={1500}
                        animationBegin={600}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          className="col-span-4 enhanced-card animate-slide-in-right dashboard-card"
          style={{ animationDelay: "0.2s" }}
        >
          <CardHeader className="dashboard-card-header">
            <CardTitle>Оказанные меры поддержки</CardTitle>
            <CardDescription>Распределение мер поддержки по ведомствам</CardDescription>
          </CardHeader>
          <CardContent className="dashboard-card-content">
            <div className="h-[300px] flex items-center justify-center dashboard-chart">
              {isMobile ? (
                <div className="mobile-simple-chart w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={supportData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {supportData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={supportData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
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
                    <Tooltip content={<CustomTooltip />} />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          className="col-span-3 enhanced-card animate-slide-in-right dashboard-card"
          style={{ animationDelay: "0.3s" }}
        >
          <CardHeader className="dashboard-card-header">
            <CardTitle>Типы семей</CardTitle>
            <CardDescription>Распределение семей по типам</CardDescription>
          </CardHeader>
          <CardContent className="dashboard-card-content">
            <div className="h-[300px] flex items-center justify-center dashboard-chart">
              {isMobile ? (
                <div className="mobile-simple-chart w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={familyTypeData.slice(0, 4)} // Показываем только первые 4 типа на мобильном
                      layout="vertical"
                      margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                      barSize={15}
                    >
                      <XAxis type="number" hide={true} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: 10 }}
                        width={100}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Количество" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="20%"
                    outerRadius="90%"
                    data={familyTypeData}
                    startAngle={180}
                    endAngle={0}
                  >
                    <RadialBar
                      minAngle={15}
                      background
                      clockWise={true}
                      dataKey="value"
                      nameKey="name"
                      cornerRadius={10}
                      label={{ fill: "var(--foreground)", position: "insideStart", fontSize: 12 }}
                      animationDuration={1500}
                    >
                      {familyTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </RadialBar>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" iconType="circle" />
                  </RadialBarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          className="col-span-7 enhanced-card animate-slide-in-right dashboard-card"
          style={{ animationDelay: "0.4s" }}
        >
          <CardHeader className="dashboard-card-header">
            <CardTitle>Возрастное распределение детей</CardTitle>
            <CardDescription>Распределение детей в ТЖС по возрастным группам</CardDescription>
          </CardHeader>
          <CardContent className="dashboard-card-content">
            <div className="h-[300px] flex items-center justify-center dashboard-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ageData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12 }}
                    tickLine={{ stroke: "var(--border)" }}
                    axisLine={{ stroke: "var(--border)" }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 12 }}
                    tickLine={{ stroke: "var(--border)" }}
                    axisLine={{ stroke: "var(--border)" }}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
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
        <Card
          className="col-span-7 enhanced-card animate-slide-in-right dashboard-card"
          style={{ animationDelay: "0.5s" }}
        >
          <CardHeader className="dashboard-card-header">
            <CardTitle>Интерактивная карта</CardTitle>
            <CardDescription>Географическое распределение семей в ТЖС</CardDescription>
          </CardHeader>
          <CardContent className="dashboard-card-content">
            <div className="text-center">
              <MapPin className="h-16 w-16 mx-auto mb-4 text-primary" />
              <p className="text-lg font-medium">Карта Павлодарской области</p>
              <p className="text-sm text-muted-foreground">
                Здесь будет интерактивная карта с отображением семей в ТЖС
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Для полной функциональности требуется интеграция с ГИС
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
