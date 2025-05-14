"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FamilyDataTable } from "@/components/family-data-table"
import { UserPlus, Download, Filter, RefreshCw } from "lucide-react"
import { type UserRole, roleConfigs } from "@/types/roles"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FamilyListProps {
  role: UserRole
}

export function FamilyList({ role }: FamilyListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const roleConfig = roleConfigs[role]

  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="grid gap-4 animate-fade-in">
      <Card className="enhanced-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl font-bold">Список семей</CardTitle>
            <CardDescription>Управление данными о семьях в ТЖС</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Обновить
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Экспорт
            </Button>
            {roleConfig.permissions.canAddFamily && (
              <Link href={`/family/new?role=${role}`}>
                <Button size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Добавить семью
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="all">
                  Все семьи
                  <Badge className="ml-2 bg-primary/20 text-primary hover:bg-primary/20">1248</Badge>
                </TabsTrigger>
                <TabsTrigger value="tzhs">
                  ТЖС
                  <Badge className="ml-2 bg-blue-500/20 text-blue-500 hover:bg-blue-500/20">1007</Badge>
                </TabsTrigger>
                <TabsTrigger value="nb">
                  Неблагополучные
                  <Badge className="ml-2 bg-red-500/20 text-red-500 hover:bg-red-500/20">241</Badge>
                </TabsTrigger>
                <TabsTrigger value="recent">
                  Недавние
                  <Badge className="ml-2 bg-green-500/20 text-green-500 hover:bg-green-500/20">38</Badge>
                </TabsTrigger>
              </TabsList>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Фильтры
              </Button>
            </div>

            <TabsContent value="all" className="space-y-4">
              <FamilyDataTable role={role} />
            </TabsContent>

            <TabsContent value="tzhs" className="space-y-4">
              <FamilyDataTable role={role} />
            </TabsContent>

            <TabsContent value="nb" className="space-y-4">
              <FamilyDataTable role={role} />
            </TabsContent>

            <TabsContent value="recent" className="space-y-4">
              <FamilyDataTable role={role} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
