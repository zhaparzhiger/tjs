"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, FileText, Edit, Trash2, Filter, Download, Search, MoreHorizontal } from "lucide-react"
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
import { getFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage-utils"
import type { Family } from "@/types/models"
import { Card, CardContent } from "@/components/ui/card"
import { useIsMobile } from "@/hooks/use-mobile"

interface FamilyDataTableProps {
  role: UserRole
  initialFamilies?: Family[]
}

export function FamilyDataTable({ role, initialFamilies = [] }: FamilyDataTableProps) {
  const { toast } = useToast()
  const [familyData, setFamilyData] = useState<Family[]>(initialFamilies)
  const [searchTerm, setSearchTerm] = useState("")
  const roleConfig = roleConfigs[role]
  const isMobile = useIsMobile()

  // Загружаем семьи из localStorage только при монтировании компонента
  useEffect(() => {
    if (initialFamilies.length === 0) {
      const storedFamilies = getFromStorage<Family[]>(STORAGE_KEYS.FAMILIES, [])
      setFamilyData(storedFamilies)
    }
  }, [initialFamilies.length]) // Зависимость только от длины initialFamilies

  const handleDelete = (id: number) => {
    const updatedFamilies = familyData.filter((family) => family.id !== id)
    setFamilyData(updatedFamilies)
    saveToStorage(STORAGE_KEYS.FAMILIES, updatedFamilies)

    toast({
      title: "Семья удалена",
      description: "Запись о семье успешно удалена из базы данных",
    })
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

  // Мобильная карточка для семьи
  const MobileFamilyCard = ({ family }: { family: Family }) => (
    <Card className="mb-3 enhanced-card">
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div className="font-medium">{family.name}</div>
          <div className="flex flex-wrap gap-1">
            {family.status?.includes("Н/Б") ? (
              <>
                <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 badge-enhanced">
                  ТЖС
                </Badge>
                <Badge variant="destructive" className="badge-enhanced">
                  Н/Б
                </Badge>
              </>
            ) : (
              <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 badge-enhanced">
                ТЖС
              </Badge>
            )}
          </div>
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
                <Link href={`/family/${family.id}?role=${role}`}>
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

          {isMobile ? (
            // Мобильный вид - карточки
            <div className="mt-4">
              {filteredData.length > 0 ? (
                filteredData.map((family) => <MobileFamilyCard key={family.id} family={family} />)
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
            // Десктопный вид - таблица
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
                    filteredData.map((family) => (
                      <TableRow key={family.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">{family.name}</TableCell>
                        <TableCell>{family.iin}</TableCell>
                        <TableCell className="hidden md:table-cell">{family.address}</TableCell>
                        <TableCell>
                          {family.status?.includes("Н/Б") ? (
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 badge-enhanced">
                                ТЖС
                              </Badge>
                              <Badge variant="destructive" className="badge-enhanced">
                                Н/Б
                              </Badge>
                            </div>
                          ) : (
                            <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 badge-enhanced">
                              ТЖС
                            </Badge>
                          )}
                        </TableCell>
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
                                    <Link href={`/family/${family.id}?role=${role}`}>
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
        </div>
      </CardContent>
    </Card>
  )
}
