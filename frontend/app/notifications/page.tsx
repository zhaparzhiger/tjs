"use client"

import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, RefreshCw, Settings } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import type { UserRole } from "@/types/roles"

export default function NotificationsPage() {
  const searchParams = useSearchParams()
  const role = (searchParams.get("role") as UserRole) || "admin"
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Новая семья добавлена",
      description: "Ахметова Г.С. добавила новую семью в базу данных",
      time: "15 минут назад",
      read: false,
      type: "family",
    },
    {
      id: 2,
      title: "Обновление статуса",
      description: "Статус семьи Сергеевых изменен на 'ТЖС, Н/Б'",
      time: "2 часа назад",
      read: false,
      type: "status",
    },
    {
      id: 3,
      title: "Новый отчет доступен",
      description: "Сформирован ежемесячный отчет по району",
      time: "Вчера, 15:30",
      read: false,
      type: "report",
    },
    {
      id: 4,
      title: "Запрос на доступ",
      description: "Пользователь Иванов П.С. запросил доступ к документам",
      time: "2 дня назад",
      read: true,
      type: "access",
    },
    {
      id: 5,
      title: "Обновление системы",
      description: "Система обновлена до версии 2.5.0",
      time: "3 дня назад",
      read: true,
      type: "system",
    },
    {
      id: 6,
      title: "Требуется социальная поддержка",
      description: "Семья Ивановых нуждается в социальной поддержке",
      time: "1 день назад",
      read: false,
      type: "support",
      priority: "high",
      targetRole: "social",
      familyId: 1,
    },
    {
      id: 7,
      title: "Требуется медицинская помощь",
      description: "Семья Петровых нуждается в медицинской помощи",
      time: "2 дня назад",
      read: false,
      type: "health",
      priority: "medium",
      targetRole: "health",
      familyId: 2,
    },
    {
      id: 8,
      title: "Требуется поддержка в образовании",
      description: "Семья Сидоровых нуждается в поддержке в сфере образования",
      time: "3 дня назад",
      read: true,
      type: "education",
      priority: "low",
      targetRole: "school",
      familyId: 3,
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Уведомления обновлены",
        description: "Список уведомлений успешно обновлен",
      })
    }, 1000)
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
    toast({
      title: "Уведомления прочитаны",
      description: "Все уведомления отмечены как прочитанные",
    })
  }

  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case "family":
        return <div className="w-2 h-2 rounded-full bg-blue-500"></div>
      case "status":
        return <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
      case "report":
        return <div className="w-2 h-2 rounded-full bg-green-500"></div>
      case "access":
        return <div className="w-2 h-2 rounded-full bg-purple-500"></div>
      case "system":
        return <div className="w-2 h-2 rounded-full bg-red-500"></div>
      default:
        return <div className="w-2 h-2 rounded-full bg-gray-500"></div>
    }
  }

  const getPriorityBadge = (priority?: "low" | "medium" | "high") => {
    switch (priority) {
      case "high":
        return <Badge className="ml-2 bg-red-500">Высокий</Badge>
      case "medium":
        return <Badge className="ml-2 bg-yellow-500">Средний</Badge>
      case "low":
        return <Badge className="ml-2 bg-green-500">Низкий</Badge>
      default:
        return null
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    // Фильтр по вкладке
    if (activeTab !== "all" && notification.type !== activeTab) {
      return false
    }

    // Фильтр по роли (для уведомлений о помощи)
    if (notification.targetRole && notification.targetRole !== role && role !== "admin" && role !== "district") {
      return false
    }

    // Фильтр по поиску
    if (searchTerm) {
      return (
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return true
  })

  return (
    <DashboardLayout role={role}>
      <div className="flex-1 space-y-4 animate-fade-in">
        <Card className="enhanced-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center">
              <Bell className="mr-2 h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-xl font-bold">Уведомления</CardTitle>
                <CardDescription>Управление уведомлениями системы</CardDescription>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Обновить
              </Button>
              <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
                <Check className="mr-2 h-4 w-4" />
                Отметить все как прочитанные
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="notifications-tabs-container">
              <Tabs defaultValue="all" className="w-full">
                <div className="notifications-tabs-list">
                  <TabsList className="w-full">
                    <TabsTrigger value="all" className="notification-tab">
                      Все
                    </TabsTrigger>
                    <TabsTrigger value="unread" className="notification-tab">
                      Непрочитанные
                    </TabsTrigger>
                    <TabsTrigger value="important" className="notification-tab">
                      Важные
                    </TabsTrigger>
                    <TabsTrigger value="system" className="notification-tab">
                      Системные
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="all">{/* Содержимое вкладки */}</TabsContent>

                {/* Остальные TabsContent */}
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
