"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash2, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import type { UserRole } from "@/types/roles"
import type { Family } from "@/types/models"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useIsMobile } from "@/hooks/use-mobile"

interface FamilyCardProps {
  family: Family
  role: UserRole
  onDelete?: (id: number) => void
}

export function FamilyCard({ family, role, onDelete }: FamilyCardProps) {
  const isMobile = useIsMobile()

  const handleDelete = () => {
    if (onDelete) {
      onDelete(family.id)
    }
  }

  return (
    <Card className="enhanced-card transition-all hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-1">{family.name}</CardTitle>
          <div className="flex space-x-1">
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
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">ИИН:</span>
            <span className="font-medium">{family.iin}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Детей:</span>
            <span className="font-medium">{family.children}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Адрес:</span>
            <span className="font-medium truncate max-w-[180px]" title={family.address}>
              {family.address}
            </span>
          </div>
          {family.inspectionStatus && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Обследование:</span>
              {family.inspectionStatus === "inspected" ? (
                <Badge className="bg-green-600 badge-enhanced">Обследовано</Badge>
              ) : family.inspectionStatus === "scheduled" ? (
                <Badge className="bg-yellow-600 badge-enhanced">Запланировано</Badge>
              ) : (
                <Badge className="bg-gray-400 badge-enhanced">Не обследовано</Badge>
              )}
            </div>
          )}
          {!family.isActive && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Статус:</span>
              <Badge variant="destructive" className="badge-enhanced">
                Выбыла
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        {isMobile ? (
          // Мобильный вид
          <div className="flex justify-between w-full">
            <Link href={`/family/${family.id}?role=${role}`}>
              <Button variant="outline" size="sm" className="transition-all hover:bg-primary hover:text-white">
                <Eye className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Просмотр</span>
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link href={`/family/${family.id}?role=${role}`}>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Редактировать
                  </DropdownMenuItem>
                </Link>
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
                      <AlertDialogAction onClick={handleDelete}>Удалить</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          // Десктопный вид
          <div className="flex justify-between w-full">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={`/family/${family.id}?role=${role}`}>
                    <Button variant="outline" size="sm" className="transition-all hover:bg-primary hover:text-white">
                      <Eye className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Просмотр</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Просмотреть семью</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={`/family/${family.id}?role=${role}`}>
                      <Button variant="outline" size="sm" className="transition-all hover:bg-blue-500 hover:text-white">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Редактировать</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <AlertDialog>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="transition-all hover:bg-destructive hover:text-white"
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
                    <AlertDialogAction onClick={handleDelete}>Удалить</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
