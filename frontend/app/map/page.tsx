"use client"

import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Filter, MapPin, Home, School, Hospital, BadgeIcon as Police } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import type { UserRole } from "@/types/roles"

export default function MapPage() {
  const searchParams = useSearchParams()
  const role = (searchParams.get("role") as UserRole) || "admin"
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const handleFilterChange = () => {
    toast({
      title: "Фильтры применены",
      description: "Карта обновлена с учетом выбранных фильтров",
    })
  }

  return (
    <DashboardLayout role={role}>
      <div className="flex-1 space-y-4 animate-fade-in">
        <Card className="enhanced-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-xl font-bold">Карта семей</CardTitle>
              <CardDescription>Географическое распределение семей в ТЖС</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <MapPin className="mr-2 h-4 w-4" />
                Моё местоположение
              </Button>
              <Button size="sm" onClick={handleFilterChange}>
                <Filter className="mr-2 h-4 w-4" />
                Применить фильтры
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="w-full md:w-1/4 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="district">Район</Label>
                  <Select>
                    <SelectTrigger id="district">
                      <SelectValue placeholder="Все районы" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все районы</SelectItem>
                      <SelectItem value="irtysh">Иртышский</SelectItem>
                      <SelectItem value="terenkol">Теренкольский</SelectItem>
                      <SelectItem value="akkuli">Аккулинский</SelectItem>
                      <SelectItem value="mayskiy">Майский</SelectItem>
                      <SelectItem value="kachiry">Качирский</SelectItem>
                      <SelectItem value="uspenka">Успенский</SelectItem>
                      <SelectItem value="sherbakty">Щербактинский</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Статус семьи</Label>
                  <Select>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Все статусы" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все статусы</SelectItem>
                      <SelectItem value="tzhs">ТЖС</SelectItem>
                      <SelectItem value="nb">Неблагополучная</SelectItem>
                      <SelectItem value="both">ТЖС и Неблагополучная</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Показать на карте</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="show-families" defaultChecked />
                      <Label htmlFor="show-families" className="font-normal">
                        <div className="flex items-center">
                          <Home className="h-4 w-4 mr-2 text-blue-500" />
                          Семьи в ТЖС
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="show-schools" defaultChecked />
                      <Label htmlFor="show-schools" className="font-normal">
                        <div className="flex items-center">
                          <School className="h-4 w-4 mr-2 text-green-500" />
                          Школы
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="show-hospitals" defaultChecked />
                      <Label htmlFor="show-hospitals" className="font-normal">
                        <div className="flex items-center">
                          <Hospital className="h-4 w-4 mr-2 text-red-500" />
                          Медучреждения
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="show-police" defaultChecked />
                      <Label htmlFor="show-police" className="font-normal">
                        <div className="flex items-center">
                          <Police className="h-4 w-4 mr-2 text-yellow-500" />
                          Отделения полиции
                        </div>
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-3/4 bg-muted rounded-lg overflow-hidden relative" style={{ height: "600px" }}>
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
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
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
