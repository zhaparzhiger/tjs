"use client"

import React from "react"
import Link from "next/link"
import { Search, UserPlus, Filter, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FamilyDataTable } from "@/components/family-data-table"
import { StatisticsCards } from "@/components/statistics-cards"
import { type UserRole, roleConfigs } from "@/types/roles"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast";

interface FamilyDashboardProps {
  role: UserRole
}

export function FamilyDashboard({ role }: FamilyDashboardProps) {
  const [families, setFamilies] = React.useState([])
    const [searchQuery, setSearchQuery] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
    const { toast } = useToast();
  
  const roleConfig = roleConfigs[role]

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("auth_token");
        if (!token) {
          toast({
            title: "Ошибка",
            description: "Токен авторизации отсутствует",
            variant: "destructive",
          });
          return;
        }

        const response = await fetch("http://localhost:5555/api/families", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const responseJson = await response.json();
        if (!Array.isArray(responseJson)) {
          throw new Error("Unexpected data format: expected an array");
        }

        setFamilies(responseJson);
      } catch (error) {
        console.error("Error fetching families:", error);
        toast({
          title: "Ошибка",
          description: error.message || "Не удалось загрузить данные",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);
  
  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="grid gap-4 animate-fade-in w-full">
      <Card className="w-full shadow-sm border border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl font-bold">Дашборд</CardTitle>
            <CardDescription>Обзор ключевых показателей и последних обновлений</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Обновить
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
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Быстрый поиск семей..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full max-w-md"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <StatisticsCards />

      <Card className="w-full shadow-sm border border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Последние обновления</CardTitle>
              <CardDescription>Недавно добавленные и обновленные записи</CardDescription>
            </div>
            <Badge variant="outline" className="font-normal">
              Всего: {families.length} семей
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <FamilyDataTable role={role} />
        </CardContent>
      </Card>
    </div>
  )
}
