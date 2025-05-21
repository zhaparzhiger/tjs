"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
import { Button } from "@/components/ui/button"
import { Download, Printer, RefreshCw, AlertCircle } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5555/api"

// Add this translation map for family types after the API_URL constant
const familyTypeTranslations: Record<string, string> = {
  widower: "Вдовец",
  widow: "Вдова",
  divorced: "В разводе",
  single_mother: "Одинокая мать",
  single_father: "Одинокий отец",
  complete_family: "Полная семья",
  stepfather: "С отчимом",
  stepmother: "С мачехой",
  grandparents: "С бабушкой и дедушкой",
  guardian: "С опекуном",
  other: "Другое",
}

// Add translation map for support measures
const supportTypeTranslations: Record<string, string> = {
  treatment: "Лечение",
  material: "Материальная помощь",
  psychological: "Психологическая помощь",
  legal: "Юридическая помощь",
  educational: "Образовательная поддержка",
  housing: "Жилищная помощь",
  food: "Продовольственная помощь",
  clothing: "Одежда",
  employment: "Трудоустройство",
  rehabilitation: "Реабилитация",
  other: "Другое",
  registration: "Регистрация",
}

// Add this helper function after the familyTypeTranslations object
const translateFamilyType = (type: string): string => {
  return familyTypeTranslations[type] || type
}

// Add helper function for support type translation
const translateSupportType = (type: string): string => {
  return supportTypeTranslations[type] || type
}

// Types for statistics data
interface RegionStat {
  region: string
  count: number
  children?: number
}

interface DistrictStat {
  district: string
  count: number
  children: number // Now this will come directly from the API
}

interface RiskLevelStat {
  riskLevel: string
  count: number
}

interface StatusStat {
  status: string
  count: number
}

interface SupportTypeStat {
  type: string
  count: number
}

interface SupportStatusStat {
  status: string
  count: number
}

interface AgeStat {
  ageGroup: string
  count: number
}

interface DashboardStats {
  totalFamilies: number
  familiesByRiskLevel: { riskLevel: string; _count: number }[]
  familiesByStatus: { status: string; _count: number }[]
  totalFamilyMembers: number
  totalSupportMeasures: number
  supportMeasuresByStatus: { status: string; _count: number }[]
  supportMeasuresByType: { type: string; _count: number }[]
  recentFamilies: any[]
  recentSupportMeasures: any[]
}

interface UserRole {
  role: string
}

// Generic fetch function with error handling and authentication
async function fetchFromAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    // Get the authentication token from localStorage
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null

    // Set up headers with authentication
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include", // Include cookies for authentication
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error)
    throw error
  }
}

// Statistics API service functions
const statisticsService = {
  // Get dashboard overview statistics
  getDashboardStats: () => fetchFromAPI<DashboardStats>("/statistics/dashboard"),

  // Get family statistics by region
  getFamilyStatsByRegion: () => fetchFromAPI<RegionStat[]>("/statistics/families/region"),

  // Get family statistics by district
  getFamilyStatsByDistrict: () => fetchFromAPI<DistrictStat[]>("/statistics/families/district"),

  // Get family statistics by risk level
  getFamilyStatsByRiskLevel: () => fetchFromAPI<RiskLevelStat[]>("/statistics/families/risk"),

  // Get family statistics by status
  getFamilyStatsByStatus: () => fetchFromAPI<StatusStat[]>("/statistics/families/status"),

  // Get support statistics by type
  getSupportStatsByType: () => fetchFromAPI<SupportTypeStat[]>("/statistics/support/type"),

  // Get support statistics by status
  getSupportStatsByStatus: () => fetchFromAPI<SupportStatusStat[]>("/statistics/support/status"),

  // Get family member statistics by age
  getFamilyMemberStatsByAge: () => fetchFromAPI<AgeStat[]>("/statistics/members/age"),

  // Add this to the statisticsService object
  getFamilyTypeStats: () => fetchFromAPI<{ type: string; count: number }[]>("/statistics/families/type"),
}

export function StatisticsDashboard() {
  const [period, setPeriod] = useState("month3")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const isMobile = useIsMobile()
  const router = useRouter()

  // State for different chart data
  const [districtData, setDistrictData] = useState<any[]>([])
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [supportData, setSupportData] = useState<any[]>([])
  const [familyTypeData, setFamilyTypeData] = useState<any[]>([])
  const [ageData, setAgeData] = useState<any[]>([])

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    setIsAuthenticated(!!token)

    if (!token) {
      setError("Вы не авторизованы. Пожалуйста, войдите в систему.")
      setIsLoading(false)
    } else {
      fetchAllStatistics()
    }
  }, [])

  // Fetch all statistics data
  const fetchAllStatistics = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Check if user is authenticated
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setError("Вы не авторизованы. Пожалуйста, войдите в систему.")
        setIsLoading(false)
        setIsAuthenticated(false)
        return
      }

      // Fetch district statistics - now with accurate children count from API
      const districtStats = await statisticsService.getFamilyStatsByDistrict()

      // Transform district data - now we use the children count directly from the API
      const transformedDistrictData = districtStats.map((stat) => ({
        name: stat.district,
        families: stat.count,
        children: stat.children, // Use the actual children count from the API
      }))

      setDistrictData(transformedDistrictData)

      // Fetch dashboard stats for overview
      const dashboardStats = await statisticsService.getDashboardStats()

      // Create monthly data (this would ideally come from a time-series endpoint)
      // For now, we'll create mock data based on the total families
      const totalFamilies = dashboardStats.totalFamilies
      const mockMonthlyData = [
        { month: "Янв", families: Math.round(totalFamilies * 0.9), newCases: 45, resolved: 15 },
        { month: "Фев", families: Math.round(totalFamilies * 0.92), newCases: 30, resolved: 20 },
        { month: "Мар", families: Math.round(totalFamilies * 0.94), newCases: 35, resolved: 25 },
        { month: "Апр", families: Math.round(totalFamilies * 0.96), newCases: 38, resolved: 18 },
        { month: "Май", families: Math.round(totalFamilies * 0.98), newCases: 42, resolved: 22 },
        { month: "Июн", families: totalFamilies, newCases: 36, resolved: 16 },
      ]
      setMonthlyData(mockMonthlyData)

      // Fetch support type statistics
      const supportTypeStats = await statisticsService.getSupportStatsByType()
      // Transform support type data with translations
      const transformedSupportData = supportTypeStats.map((stat) => ({
        name: translateSupportType(stat.type),
        value: stat.count,
      }))
      setSupportData(transformedSupportData)

      // Try to fetch family type statistics, but handle 404 gracefully
      try {
        const familyTypeStats = await statisticsService.getFamilyTypeStats()
        // Transform family type data with translations
        const transformedFamilyTypeData = familyTypeStats.map((stat) => ({
          name: translateFamilyType(stat.type),
          value: stat.count,
        }))
        setFamilyTypeData(transformedFamilyTypeData)
      } catch (err) {
        console.log("Family type endpoint not available, using fallback data")
        // Use fallback data from familiesByStatus in dashboard stats
        if (dashboardStats.familiesByStatus && dashboardStats.familiesByStatus.length > 0) {
          const statusData = dashboardStats.familiesByStatus.map((item) => ({
            name: translateFamilyType(item.status),
            value: item._count,
          }))
          setFamilyTypeData(statusData)
        } else {
          // If no status data is available, use generic fallback
          setFamilyTypeData([
            { name: "В разводе", value: Math.round(totalFamilies * 0.35) },
            { name: "Одинокая мать", value: Math.round(totalFamilies * 0.25) },
            { name: "Полная семья", value: Math.round(totalFamilies * 0.2) },
            { name: "Вдова", value: Math.round(totalFamilies * 0.1) },
            { name: "С отчимом/мачехой", value: Math.round(totalFamilies * 0.07) },
            { name: "С бабушкой и дедушкой", value: Math.round(totalFamilies * 0.03) },
          ])
        }
      }

      // Fetch age statistics
      const ageStats = await statisticsService.getFamilyMemberStatsByAge()
      // Transform age data
      const transformedAgeData = ageStats.map((stat) => ({
        name: stat.ageGroup,
        value: stat.count,
      }))
      setAgeData(
        transformedAgeData.length
          ? transformedAgeData
          : [
              { name: "0-6", value: 487 },
              { name: "7-14", value: 612 },
              { name: "15-18", value: 845 },
              { name: "19-35", value: 768 },
              { name: "36-60", value: 715 },
              { name: "60+", value: 425 },
            ],
      )

      setIsAuthenticated(true)
    } catch (err: any) {
      console.error("Error fetching statistics:", err)

      // Handle authentication errors
      if (err.message.includes("401") || err.message.includes("auth_token") || err.message.includes("unauthorized")) {
        setError("Ошибка авторизации. Пожалуйста, войдите в систему заново.")
        setIsAuthenticated(false)
        localStorage.removeItem("auth_token") // Clear invalid token
      } else {
        setError("Не удалось загрузить статистические данные. Пожалуйста, попробуйте позже.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh data handler
  const refreshData = () => {
    fetchAllStatistics()
  }

  // Period change handler
  const handlePeriodChange = (value: string) => {
    setPeriod(value)
    // In a real app, we would refetch data with the new period
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  // Handle login redirect
  const handleLoginRedirect = () => {
    router.push("/login")
  }

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

  // Show authentication error with login button
  if (error && !isAuthenticated) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка авторизации</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={handleLoginRedirect}>Войти в систему</Button>
        </div>
      </div>
    )
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
              <Select value={period} onValueChange={handlePeriodChange}>
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

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className={`col-span-${i <= 2 ? 4 : 3} enhanced-card animate-pulse`}>
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] bg-muted/50 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
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
                          domain={[0, "dataMax"]}
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
                        label={({ name, percent }) => {
                          // Make label text shorter if needed
                          const shortName = name.length > 10 ? name.substring(0, 10) + "..." : name
                          return `${shortName}: ${(percent * 100).toFixed(0)}%`
                        }}
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
        </div>
      )}
    </div>
  )
}
