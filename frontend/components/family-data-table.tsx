"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Eye,
  FileText,
  Edit,
  Trash2,
  Filter,
  Download,
  Search,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { type UserRole, roleConfigs } from "@/types/roles"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import type { Family } from "@/types/models"
import { Card, CardContent } from "@/components/ui/card"
import { useIsMobile } from "@/hooks/use-mobile"

interface FamilyDataTableProps {
  role: UserRole
}

// Define status mapping for display text and badge styles
const statusConfig: Record<string, { label: string; variant: "default" | "destructive" | "secondary" }> = {
  Неблагополучная: { label: "Н/Б", variant: "destructive" },
  ТЖС: { label: "ТЖС", variant: "default" },
  // Add other possible statuses from the backend as needed
  // Example: "Стабильная": { label: "Стабильная", variant: "secondary" }
}

export function FamilyDataTable({ role }: FamilyDataTableProps) {
  const { toast } = useToast()
  const [familyData, setFamilyData] = useState<Family[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10 // Show 10 families per page
  const roleConfig = roleConfigs[role]
  const isMobile = useIsMobile()

  // Fetch families from the backend
  useEffect(() => {
    const fetchFamilies = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem("auth_token")
        console.log("FamilyDataTable: Fetching families with token:", token?.slice(0, 10), "...", "role:", role)

        if (!token) {
          throw new Error("Токен авторизации отсутствует")
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/families`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        console.log("FamilyDataTable: Response status:", response.status, "ok:", response.ok)

        if (!response.ok) {
          let errorMessage = `HTTP ошибка: ${response.status}`
          try {
            const errorData = await response.json()
            errorMessage = errorData.message || errorMessage
          } catch (e) {
            console.warn("FamilyDataTable: Не удалось разобрать тело ошибки")
          }
          throw new Error(errorMessage)
        }

        const data = await response.json()
        console.log("FamilyDataTable: Received data:", data)

        // Map backend data to frontend Family type
        const mappedData: Family[] = data.map((family: any) => {
          console.log("Mapping family:", family.id, "status:", family.status) // Debug status
          return {
            id: family.id,
            name: family.familyName,
            iin: family.caseNumber,
            address: family.address,
            status: family.status,
            children: family._count?.members || 0,
            lastUpdate: new Date(family.lastUpdate).toLocaleDateString(),
          }
        })

        setFamilyData(mappedData)
      } catch (error) {
        console.error("FamilyDataTable: Error fetching families:", error)
        setError(error instanceof Error ? error.message : "Не удалось загрузить данные о семьях")
        toast({
          title: "Ошибка",
          description: error instanceof Error ? error.message : "Не удалось загрузить данные о семьях",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchFamilies()
  }, [])

  // Delete family (unchanged)
  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        throw new Error("Токен авторизации отсутствует")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/families/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete family")
      }

      setFamilyData(familyData.filter((family) => family.id !== id))
      toast({
        title: "Семья удалена",
        description: "Запись о семье успешно удалена из базы данных",
      })
    } catch (error) {
      console.error("FamilyDataTable: Error deleting family:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось удалить семью",
        variant: "destructive",
      })
    }
  }

  const handleExport = () => {
    toast({
      title: "Экспорт данных",
      description: "Данные экспортированы в Excel",
    })
  }

  const filteredData = familyData.filter(
    (family) =>
      family.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      family.iin?.includes(searchTerm) ||
      family.address?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const paginatedData = filteredData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  // Pagination functions
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // Render status badges based on statusConfig
  const renderStatusBadges = (status: string | undefined) => {
    if (!status) {
      return (
        <Badge variant="secondary" className="badge-enhanced">
          Не указано
        </Badge>
      )
    }

    const config = statusConfig[status]
    if (!config) {
      // Fallback for unknown statuses
      return (
        <Badge variant="secondary" className="badge-enhanced">
          {status}
        </Badge>
      )
    }

    return (
      <Badge
        variant={config.variant}
        className={`badge-enhanced ${config.variant === "default" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
      >
        {config.label}
      </Badge>
    )
  }

  // MobileFamilyCard component (updated status rendering)
  const MobileFamilyCard = ({ family }: { family: Family }) => (
    <Card className="mb-3 enhanced-card">
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div className="font-medium">{family.name}</div>
          <div className="flex flex-wrap gap-1">{renderStatusBadges(family.status)}</div>
        </div>

        <div className="grid grid-cols-2 gap-1 text-sm mb-3">
          <div className="text-muted-foreground">ИИН:</div>
          <div>{family.iin}</div>

          <div className="text-muted-foreground">Детей:</div>
          <div>{family.children}</div>

          <div className="text-muted-foreground">Адрес:</div>
          <div className="truncate">{family.address}</div>
        </div>

        <div className="flex justify-between">
          <Link href={`/family/${family.id}?role=${role}`}>
            <Button size="sm" variant="outline" className="h-8">
              <Eye className="h-3.5 w-3.5 mr-1" />
              Просмотр
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {roleConfig.permissions.canEditFamily && (
                <Link href={`/family/${family.id}/edit?role=${role}`}>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Редактировать
                  </DropdownMenuItem>
                </Link>
              )}
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Документы
              </DropdownMenuItem>
              {roleConfig.permissions.canDeleteFamily && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Удалить
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Это действие нельзя отменить. Запись о семье будет удалена из базы данных.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Отмена</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(family.id)}>Удалить</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )

  if (error) {
    return (
      <Card className="enhanced-card">
        <CardContent className="p-6 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Попробовать снова
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="enhanced-card">
      <CardContent className="p-2 sm:p-4 md:p-6">
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="relative w-full sm:w-auto">
              <Input
                placeholder="Поиск по ФИО, ИИН, адресу..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full sm:w-64 transition-all focus:w-full sm:focus:w-80"
              />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="transition-all hover:bg-secondary">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Фильтры</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleExport}
                      className="transition-all hover:bg-secondary"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Экспорт</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-lg font-medium">Загрузка...</p>
            </div>
          ) : isMobile ? (
            // Mobile view - cards
            <div className="mt-4">
              {filteredData.length > 0 ? (
                paginatedData.map((family) => <MobileFamilyCard key={family.id} family={family} />)
              ) : (
                <div className="text-center py-8">
                  <Search className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-lg font-medium">Семьи не найдены</p>
                  <p className="text-sm text-muted-foreground">Попробуйте изменить параметры поиска</p>
                  <Button variant="outline" className="mt-4">
                    <Link href={`/family/new?role=${role}`}>Добавить новую семью</Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // Desktop view - table
            <div className="rounded-md border overflow-hidden">
              <Table className="enhanced-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>ФИО</TableHead>
                    <TableHead>ИИН</TableHead>
                    <TableHead className="hidden md:table-cell">Адрес</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="hidden md:table-cell">Кол-во детей</TableHead>
                    <TableHead className="hidden md:table-cell">Последнее обновление</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length > 0 ? (
                    paginatedData.map((family) => (
                      <TableRow key={family.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">{family.name}</TableCell>
                        <TableCell>{family.iin}</TableCell>
                        <TableCell className="hidden md:table-cell">{family.address}</TableCell>
                        <TableCell>{renderStatusBadges(family.status)}</TableCell>
                        <TableCell className="hidden md:table-cell">{family.children}</TableCell>
                        <TableCell className="hidden md:table-cell">{family.lastUpdate}</TableCell>
                        <TableCell>
                          <div className="flex justify-end space-x-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Link href={`/family/${family.id}?role=${role}`}>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 transition-all hover:bg-primary/10"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Просмотр</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            {roleConfig.permissions.canEditFamily && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link href={`/family/${family.id}/edit?role=${role}`}>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 transition-all hover:bg-blue-500/10"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Редактировать</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 transition-all hover:bg-secondary"
                                  >
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Документы</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            {roleConfig.permissions.canDeleteFamily && (
                              <AlertDialog>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 transition-all hover:bg-destructive/10"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Удалить</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Это действие нельзя отменить. Запись о семье будет удалена из базы данных.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(family.id)}>
                                      Удалить
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="text-muted-foreground">
                            <Search className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            <p className="text-lg font-medium">Семьи не найдены</p>
                            <p className="text-sm">Попробуйте изменить параметры поиска</p>
                          </div>
                          <Button variant="outline" className="mt-4">
                            <Link href={`/family/new?role=${role}`}>Добавить новую семью</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          {filteredData.length > 0 && (
            <div className="flex items-center justify-between border-t pt-4 mt-4">
              <div className="text-sm text-muted-foreground">
                Показано {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} из{" "}
                {filteredData.length} семей
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Предыдущая страница</span>
                </Button>
                <div className="text-sm">
                  {currentPage} из {totalPages || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Следующая страница</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
