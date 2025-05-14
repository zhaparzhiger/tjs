"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { UserPlus, Edit, Trash2, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage-utils"
import type { User } from "@/types/models"

export function UserManagement() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>(() => {
    // Получаем пользователей из localStorage или используем демо-данные
    return getFromStorage<User[]>(STORAGE_KEYS.USERS, [
      {
        id: 1,
        name: "Иванов Петр",
        email: "p.ivanov@example.com",
        role: "admin",
        organization: "Областной акимат Павлодарской области",
        status: "active",
      },
      {
        id: 2,
        name: "Петрова Анна",
        email: "a.petrova@example.com",
        role: "school",
        organization: "Школа №45",
        status: "active",
      },
      {
        id: 3,
        name: "Сидоров Алексей",
        email: "a.sidorov@example.com",
        role: "social",
        organization: "Отдел социальной защиты",
        status: "active",
      },
      {
        id: 4,
        name: "Ким Елена",
        email: "e.kim@example.com",
        role: "police",
        organization: "Отдел полиции №2",
        status: "active",
      },
      {
        id: 5,
        name: "Ахметов Серик",
        email: "s.akhmetov@example.com",
        role: "health",
        organization: "Поликлиника №5",
        status: "inactive",
      },
    ])
  })

  // Добавим состояние для формы добавления пользователя
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "admin",
    organization: "",
  })

  const [isAddUserOpen, setIsAddUserOpen] = useState(false)

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()

    // Создаем нового пользователя
    const user: User = {
      id: Math.max(0, ...users.map((u) => u.id)) + 1,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      organization: newUser.organization,
      status: "active",
    }

    // Обновляем состояние
    const updatedUsers = [...users, user]
    setUsers(updatedUsers)

    // Сохраняем в localStorage
    saveToStorage(STORAGE_KEYS.USERS, updatedUsers)

    // Закрываем диалог и показываем уведомление
    setIsAddUserOpen(false)
    setNewUser({ name: "", email: "", role: "admin", organization: "" })

    toast({
      title: "Пользователь добавлен",
      description: "Новый пользователь успешно добавлен в систему",
    })
  }

  const handleResetPassword = (userId: number) => {
    // Имитация сброса пароля
    toast({
      title: "Пароль сброшен",
      description: "Временный пароль отправлен на email пользователя",
    })
  }

  const handleDeleteUser = (userId: number) => {
    // Удаляем пользователя из состояния
    const updatedUsers = users.filter((user) => user.id !== userId)
    setUsers(updatedUsers)

    // Сохраняем в localStorage
    saveToStorage(STORAGE_KEYS.USERS, updatedUsers)

    toast({
      title: "Пользователь удален",
      description: "Пользователь успешно удален из системы",
    })
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-600">Администратор</Badge>
      case "school":
        return <Badge className="bg-green-600">Школа</Badge>
      case "social":
        return <Badge className="bg-blue-600">Соц. защита</Badge>
      case "police":
        return <Badge className="bg-yellow-600">Полиция</Badge>
      case "health":
        return <Badge className="bg-orange-400">Здравоохранение</Badge>
      case "district":
        return <Badge className="bg-purple-600">Район</Badge>
      case "mobile":
        return <Badge className="bg-sky-500">Мобильная группа</Badge>
      default:
        return <Badge>Неизвестно</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        Активен
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
        Неактивен
      </Badge>
    )
  }

  const handleEditUser = (user: User) => {
    // TODO: Implement edit user functionality
    alert(`Редактирование пользователя ${user.name}`)
  }

  return (
    <div className="grid gap-4 w-full max-w-full overflow-hidden">
      <Card className="enhanced-card">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2">
          <div>
            <CardTitle>Управление пользователями</CardTitle>
            <CardDescription>Добавление, редактирование и удаление пользователей системы</CardDescription>
          </div>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                <span className="hide-on-small">Добавить пользователя</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить нового пользователя</DialogTitle>
                <DialogDescription>Заполните форму для создания нового пользователя системы</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddUser}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">ФИО</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Роль</Label>
                    <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Выберите роль" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Администратор</SelectItem>
                        <SelectItem value="school">Школа</SelectItem>
                        <SelectItem value="social">Социальная защита</SelectItem>
                        <SelectItem value="police">Полиция</SelectItem>
                        <SelectItem value="health">Здравоохранение</SelectItem>
                        <SelectItem value="district">Районный администратор</SelectItem>
                        <SelectItem value="mobile">Мобильная группа</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="organization">Организация</Label>
                    <Input
                      id="organization"
                      value={newUser.organization}
                      onChange={(e) => setNewUser({ ...newUser, organization: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Добавить</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0 sm:p-2 md:p-4">
          {/* Десктопная версия таблицы */}
          <div className="users-table-container desktop-user-table">
            <Table className="enhanced-table">
              <TableHeader>
                <TableRow>
                  <TableHead>ФИО</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead className="hide-on-small">Организация</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="hide-on-small">{user.organization}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      <div className="user-actions-container">
                        <Button variant="outline" size="sm" onClick={() => handleResetPassword(user.id)}>
                          Сброс пароля
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                          Изменить
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user.id)}>
                          Удалить
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Мобильная версия в виде карточек */}
          <div className="mobile-user-cards">
            {users.map((user) => (
              <div key={user.id} className="user-card">
                <div className="user-card-header">
                  <div className="user-card-title">{user.name}</div>
                  {getStatusBadge(user.status)}
                </div>
                <div className="user-card-content">
                  <div className="user-card-label">Email:</div>
                  <div className="user-card-value">{user.email}</div>

                  <div className="user-card-label">Роль:</div>
                  <div className="user-card-value">{getRoleBadge(user.role)}</div>

                  <div className="user-card-label">Организация:</div>
                  <div className="user-card-value">{user.organization}</div>
                </div>
                <div className="user-card-actions">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                    <Button variant="outline" size="sm" onClick={() => handleResetPassword(user.id)}>
                      <Lock className="mr-1 h-3 w-3" />
                      Сброс пароля
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-1 h-3 w-3" />
                      Изменить
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="mr-1 h-3 w-3" />
                          Удалить
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Это действие нельзя отменить. Пользователь будет удален из системы.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Удалить</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
