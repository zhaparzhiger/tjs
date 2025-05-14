"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { FamilyDataTable } from "@/components/family-data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus } from "lucide-react"
import { type UserRole, roleConfigs } from "@/types/roles"
import { getFromStorage, STORAGE_KEYS } from "@/lib/storage-utils"
import type { Family } from "@/types/models"

export default function FamiliesPage() {
  const searchParams = useSearchParams()
  const role = (searchParams.get("role") as UserRole) || "admin"
  const filter = searchParams.get("filter")
  const roleConfig = roleConfigs[role]
  const [families, setFamilies] = useState<Family[]>([])

  // Загружаем семьи из localStorage при монтировании компонента
  useEffect(() => {
    const storedFamilies = getFromStorage<Family[]>(STORAGE_KEYS.FAMILIES, [])

    // Применяем фильтр, если он указан
    if (filter) {
      if (filter === "tzhs") {
        setFamilies(storedFamilies.filter((family) => family.status?.includes("ТЖС")))
      } else if (filter === "nb") {
        setFamilies(storedFamilies.filter((family) => family.status?.includes("Н/Б")))
      }
    } else {
      setFamilies(storedFamilies)
    }
  }, [filter]) // Зависимость только от filter

  return (
    <DashboardLayout role={role}>
      <div className="flex-1 space-y-4 animate-fade-in w-full max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 w-full max-w-full">
          <h2 className="text-3xl font-bold tracking-tight">
            {filter === "tzhs"
              ? "Семьи в трудной жизненной ситуации"
              : filter === "nb"
                ? "Неблагополучные семьи"
                : "Все семьи"}
          </h2>
          {roleConfig.permissions.canAddFamily && (
            <Link href={`/family/new?role=${role}`} className="sm:flex-shrink-0">
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                <span>Добавить семью</span>
              </Button>
            </Link>
          )}
        </div>

        <Card className="enhanced-card w-full max-w-full overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle>Список семей</CardTitle>
            <CardDescription>Всего записей: {families.length}</CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-2 md:p-4">
            <div className="table-container">
              <FamilyDataTable role={role} initialFamilies={families} />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
