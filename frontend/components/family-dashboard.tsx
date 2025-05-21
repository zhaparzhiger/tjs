"use client"

import React from "react"
import Link from "next/link"
import { Search, UserPlus, Filter, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FamilyDataTable } from "@/components/family-data-table"
import { StatisticsCards } from "@/components/statistics-cards"
import { type UserRole, roleConfigs } from "@/types/roles"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FamilyDashboardProps {
  role: UserRole
}

export function FamilyDashboard({ role }: FamilyDashboardProps) {
  const [families, setFamilies] = React.useState([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage] = React.useState(10)
  const { toast } = useToast()

  const roleConfig = roleConfigs[role]

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("auth_token")
        if (!token) {
          toast({
            title: "Ошибка",
            description: "Токен авторизации отсутствует",
            variant: "destructive",
          })
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/families`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`)
        }

        const responseJson = await response.json()
        if (!Array.isArray(responseJson)) {
          throw new Error("Unexpected data format: expected an array")
        }

        setFamilies(responseJson)
      } catch (error) {
        console.error("Error fetching families:", error)
        toast({
          title: "Ошибка",
          description: error.message || "Не удалось загрузить данные",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  // Filter families based on search query
  const filteredFamilies = React.useMemo(() => {
    if (!searchQuery.trim()) return families

    return families.filter((family) =>
      Object.values(family).some((value) => String(value).toLowerCase().includes(searchQuery.toLowerCase())),
    )
  }, [families, searchQuery])

  // Get current page data
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentFamilies = filteredFamilies.slice(indexOfFirstItem, indexOfLastItem)

  // Calculate total pages
  const totalPages = Math.ceil(filteredFamilies.length / itemsPerPage)

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  return (
    <div className="grid gap-4 animate-fade-in w-full">
      <Card className="w-full shadow-sm border border-border overflow-hidden">
        <CardHeader className="px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="max-w-full">
                <CardTitle className="text-xl font-bold truncate">Дашборд</CardTitle>
                <CardDescription className="text-sm mt-1 max-w-full">
                  Обзор ключевых показателей и последних обновлений
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2 self-start shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshData}
                  disabled={isLoading}
                  className="h-9 whitespace-nowrap"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  Обновить
                </Button>
                {roleConfig?.permissions?.canAddFamily && (
                  <Link href={`/family/new?role=${role}`}>
                    <Button size="sm" className="h-9 whitespace-nowrap">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Добавить семью
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 min-w-0 max-w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Быстрый поиск семей..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 w-full"
                />
              </div>
              <Button variant="outline" size="sm" className="h-9 whitespace-nowrap shrink-0">
                <Filter className="h-4 w-4 mr-2" />
                Фильтры
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <StatisticsCards />

      <Card className="w-full shadow-sm border border-border overflow-hidden">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
            <div className="max-w-full">
              <CardTitle className="text-lg">Последние обновления</CardTitle>
              <CardDescription className="text-sm">Недавно добавленные и обновленные записи</CardDescription>
            </div>
            <Badge variant="outline" className="font-normal text-xs self-start lg:self-auto shrink-0">
              {filteredFamilies.length > 0 ? (
                <>
                  Показано {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredFamilies.length)} из{" "}
                  {filteredFamilies.length} семей
                </>
              ) : (
                "Нет данных"
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-1 sm:px-6">
          <FamilyDataTable role={role} families={currentFamilies} />
        </CardContent>
 
      </Card>
    </div>
  )
}
