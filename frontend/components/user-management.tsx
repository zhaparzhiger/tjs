"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";
import { UserPlus, Edit, Trash2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  iin: string;
  fullName: string;
  role: string;
  region: string;
  district: string;
  city: string;
  status: string;
}

const regions = [
  "Акмолинская",
  "Актюбинская",
  "Алматинская",
  "Атырауская",
  "Восточно-Казахстанская",
  "Жамбылская",
  "Западно-Казахстанская",
  "Карагандинская",
  "Костанайская",
  "Кзыл-Ординская",
  "Мангистауская",
  "Павлодарская",
  "Северо-Казахстанская",
  "Южно-Казахстанская",
];

const roleMap = {
  "Администратор": "admin",
  "Образование": "school",
  "Социальная сфера": "social",
  "Полиция": "police",
  "Здравоохранение": "health",
};

const roleDisplayMap = {
  admin: "Администратор",
  school: "Образование",
  social: "Социальная сфера",
  police: "Полиция",
  health: "Здравоохранение",
};

export function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({
    iin: "",
    password: "",
    fullName: "",
    role: "Администратор",
    region: "",
    district: "",
    city: "",
    position: "",
  });
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5555/api/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(
          data.map((user: any) => ({
            id: user.id,
            iin: user.iin,
            fullName: user.fullName,
            role: roleDisplayMap[user.role as keyof typeof roleDisplayMap] || user.role,
            region: user.region,
            district: user.district,
            city: user.city,
            status: user.isActive ? "active" : "inactive",
          }))
        );
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить пользователей",
          variant: "destructive",
        });
      }
    };

    fetchUsers();
  }, []);

  const validateIIN = (iin: string) => {
    return /^\d{12}$/.test(iin);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate IIN
    if (!validateIIN(newUser.iin)) {
      toast({
        title: "Ошибка",
        description: "ИИН должен состоять из 12 цифр",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:5555/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          iin: newUser.iin,
          password: newUser.password,
          fullName: newUser.fullName,
          role: newUser.role,
          region: newUser.region,
          district: newUser.district,
          city: newUser.city,
          position: newUser.position,
          isActive: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create user");
      }

      const data = await response.json();
      setUsers([
        ...users,
        {
          id: data.user.id,
          iin: data.user.iin,
          fullName: data.user.fullName,
          role: roleDisplayMap[data.user.role as keyof typeof roleDisplayMap] || data.user.role,
          region: data.user.region,
          district: data.user.district,
          city: data.user.city,
          status: "active",
        },
      ]);

      setIsAddUserOpen(false);
      setNewUser({ iin: "", password: "", fullName: "", role: "Администратор", region: "", district: "", city: "", position: "" });

      toast({
        title: "Пользователь добавлен",
        description: "Новый пользователь успешно добавлен в систему",
      });
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать пользователя",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    // Validate IIN
    if (!validateIIN(newUser.iin)) {
      toast({
        title: "Ошибка",
        description: "ИИН должен состоять из 12 цифр",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:5555/api/users/${editUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          fullName: newUser.fullName,
          role: newUser.role,
          region: newUser.region,
          district: newUser.district,
          city: newUser.city,
          position: newUser.position,
          isActive: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user");
      }

      const data = await response.json();
      setUsers(
        users.map((user) =>
          user.id === editUser.id
            ? {
                ...user,
                iin: newUser.iin,
                fullName: newUser.fullName,
                role: roleDisplayMap[data.user.role as keyof typeof roleDisplayMap] || data.user.role,
                region: newUser.region,
                district: newUser.district,
                city: newUser.city,
              }
            : user
        )
      );

      setIsEditUserOpen(false);
      setNewUser({ iin: "", password: "", fullName: "", role: "Администратор", region: "", district: "", city: "", position: "" });
      setEditUser(null);

      toast({
        title: "Пользователь обновлен",
        description: "Данные пользователя успешно обновлены",
      });
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить пользователя",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:5555/api/users/${userId}/reset-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ newPassword: "temporaryPassword" }),
      });

      if (!response.ok) {
        throw new Error("Failed to reset password");
      }

      toast({
        title: "Пароль сброшен",
        description: "Временный пароль отправлен пользователю",
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сбросить пароль",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:5555/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      setUsers(users.filter((user) => user.id !== userId));

      toast({
        title: "Пользователь удален",
        description: "Пользователь успешно удален из системы",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить пользователя",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Администратор":
        return <Badge className="bg-red-600">Администратор</Badge>;
      case "Образование":
        return <Badge className="bg-green-600">Образование</Badge>;
      case "Социальная сфера":
        return <Badge className="bg-blue-600">Соц. защита</Badge>;
      case "Полиция":
        return <Badge className="bg-yellow-600">Полиция</Badge>;
      case "Здравоохранение":
        return <Badge className="bg-orange-400">Здравоохранение</Badge>;
      default:
        return <Badge>Неизвестно</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        Активен
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
        Неактивен
      </Badge>
    );
  };

  const openEditUser = (user: User) => {
    setEditUser(user);
    setNewUser({
      iin: user.iin,
      password: "",
      fullName: user.fullName,
      role: user.role,
      region: user.region,
      district: user.district,
      city: user.city,
      position: "",
    });
    setIsEditUserOpen(true);
  };

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
                    <Label htmlFor="iin">ИИН</Label>
                    <Input
                      id="iin"
                      value={newUser.iin}
                      onChange={(e) => setNewUser({ ...newUser, iin: e.target.value })}
                      required
                      placeholder="Введите 12 цифр"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Пароль</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">ФИО</Label>
                    <Input
                      id="fullName"
                      value={newUser.fullName}
                      onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
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
                        <SelectItem value="Администратор">Администратор</SelectItem>
                        <SelectItem value="Образование">Образование</SelectItem>
                        <SelectItem value="Социальная сфера">Социальная сфера</SelectItem>
                        <SelectItem value="Полиция">Полиция</SelectItem>
                        <SelectItem value="Здравоохранение">Здравоохранение</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="region">Область</Label>
                    <Select value={newUser.region} onValueChange={(value) => setNewUser({ ...newUser, region: value })}>
                      <SelectTrigger id="region">
                        <SelectValue placeholder="Выберите область" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="district">Район</Label>
                    <Input
                      id="district"
                      value={newUser.district}
                      onChange={(e) => setNewUser({ ...newUser, district: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="city">Город</Label>
                    <Input
                      id="city"
                      value={newUser.city}
                      onChange={(e) => setNewUser({ ...newUser, city: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="position">Должность</Label>
                    <Input
                      id="position"
                      value={newUser.position}
                      onChange={(e) => setNewUser({ ...newUser, position: e.target.value })}
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
          <div className="users-table-container desktop-user-table">
            <Table className="enhanced-table">
              <TableHeader>
                <TableRow>
                  <TableHead>ФИО</TableHead>
                  <TableHead>ИИН</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Область</TableHead>
                  <TableHead>Район</TableHead>
                  <TableHead>Город</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>{user.iin}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{user.region}</TableCell>
                    <TableCell>{user.district}</TableCell>
                    <TableCell>{user.city}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      <div className="user-actions-container">
                        <Button variant="outline" size="sm" onClick={() => handleResetPassword(user.id)}>
                          Сброс пароля
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEditUser(user)}>
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
          <div className="mobile-user-cards">
            {users.map((user) => (
              <div key={user.id} className="user-card">
                <div className="user-card-header">
                  <div className="user-card-title">{user.fullName}</div>
                  {getStatusBadge(user.status)}
                </div>
                <div className="user-card-content">
                  <div className="user-card-label">ИИН:</div>
                  <div className="user-card-value">{user.iin}</div>
                  <div className="user-card-label">Роль:</div>
                  <div className="user-card-value">{getRoleBadge(user.role)}</div>
                  <div className="user-card-label">Область:</div>
                  <div className="user-card-value">{user.region}</div>
                  <div className="user-card-label">Район:</div>
                  <div className="user-card-value">{user.district}</div>
                  <div className="user-card-label">Город:</div>
                  <div className="user-card-value">{user.city}</div>
                </div>
                <div className="user-card-actions">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                    <Button variant="outline" size="sm" onClick={() => handleResetPassword(user.id)}>
                      <Lock className="mr-1 h-3 w-3" />
                      Сброс пароля
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEditUser(user)}>
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

      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать пользователя</DialogTitle>
            <DialogDescription>Обновите данные пользователя</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="iin">ИИН</Label>
                <Input
                  id="iin"
                  value={newUser.iin}
                  onChange={(e) => setNewUser({ ...newUser, iin: e.target.value })}
                  required
                  placeholder="Введите 12 цифр"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fullName">ФИО</Label>
                <Input
                  id="fullName"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
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
                    <SelectItem value="Администратор">Администратор</SelectItem>
                    <SelectItem value="Образование">Образование</SelectItem>
                    <SelectItem value="Социальная сфера">Социальная сфера</SelectItem>
                    <SelectItem value="Полиция">Полиция</SelectItem>
                    <SelectItem value="Здравоохранение">Здравоохранение</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="region">Область</Label>
                <Select value={newUser.region} onValueChange={(value) => setNewUser({ ...newUser, region: value })}>
                  <SelectTrigger id="region">
                    <SelectValue placeholder="Выберите область" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="district">Район</Label>
                <Input
                  id="district"
                  value={newUser.district}
                  onChange={(e) => setNewUser({ ...newUser, district: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">Город</Label>
                <Input
                  id="city"
                  value={newUser.city}
                  onChange={(e) => setNewUser({ ...newUser, city: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="position">Должность</Label>
                <Input
                  id="position"
                  value={newUser.position}
                  onChange={(e) => setNewUser({ ...newUser, position: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Сохранить</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}