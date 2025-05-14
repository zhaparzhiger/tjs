"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Bell, Check, RefreshCw, Settings, AlertTriangle, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Notification } from "@/types/models"
import { getFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage-utils"

interface NotificationsDashboardProps {
  role: string
}

export function NotificationsDashboard({ role }: NotificationsDashboardProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Загрузка уведомлений из localStorage
    const storedNotifications = getFromStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, [])

    // Если нет данных, используем демо-данные
    if (storedNotifications.length === 0) {
      const demoNotifications: Notification[] = [
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
      ]

      setNotifications(demoNotifications)
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, demoNotifications)
    } else {
      setNotifications(storedNotifications)
    }
  }, [])

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
    const updatedNotifications = notifications.map((n) => ({ ...n, read: true }))
    setNotifications(updatedNotifications)
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updatedNotifications)

    toast({
      title: "Уведомления прочитаны",
      description: "Все уведомления отмечены как прочитанные",
    })
  }

  const markAsRead = (id: number) => {
    const updatedNotifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    setNotifications(updatedNotifications)
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updatedNotifications)
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
      case "support":
        return <div className="w-2 h-2 rounded-full bg-orange-500"></div>
      case "health":
        return <div className="w-2 h-2 rounded-full bg-pink-500"></div>
      case "education":
        return <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
      default:
        return <div className="w-2 h-2 rounded-full bg-gray-500"></div>
    }
  }

  const getPriorityBadge = (priority?: "low" | "medium" | "high") => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-500">Высокий</Badge>
      case "medium":
        return <Badge className="bg-yellow-500">Средний</Badge>
      case "low":
        return <Badge className="bg-green-500">Низкий</Badge>
      default:
        return null
    }
  }

  // Фильтрация уведомлений
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

  const unreadCount = filteredNotifications.filter((n) => !n.read).length

  return (
    <div className="space-y-4 animate-fade-in">
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
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск уведомлений..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="all">
                  Все
                  <Badge className="ml-2 bg-primary/20 text-primary hover:bg-primary/20">{notifications.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="support">Соц. поддержка</TabsTrigger>
                <TabsTrigger value="health">Здравоохранение</TabsTrigger>
                <TabsTrigger value="education">Образование</TabsTrigger>
                <TabsTrigger value="system">Система</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-2">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    notification.read ? "bg-background" : "bg-primary/5 border-primary/20"
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">{getNotificationTypeIcon(notification.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <span className="text-xs text-muted-foreground">{notification.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                      {notification.priority && getPriorityBadge(notification.priority)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground">
                <AlertTriangle className="inline-block h-6 w-6 mb-2" />
                <p>Нет уведомлений</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
