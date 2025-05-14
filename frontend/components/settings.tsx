"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

interface SettingsProps {
  role: "admin" | "school" | "social" | "police" | "health" | "district" | "mobile"
}

export function Settings({ role }: SettingsProps) {
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: "Настройки сохранены",
      description: "Ваши настройки успешно сохранены",
    })
  }

  return (
    <div className="grid gap-4">
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="notifications">Уведомления</TabsTrigger>
          <TabsTrigger value="security">Безопасность</TabsTrigger>
          {role === "admin" && <TabsTrigger value="system">Системные настройки</TabsTrigger>}
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Профиль</CardTitle>
              <CardDescription>Управление информацией вашего профиля</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">ФИО</Label>
                  <Input id="name" defaultValue="Иванов Петр Сергеевич" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="p.ivanov@example.com" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input id="phone" defaultValue="+7 (701) 123-45-67" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="position">Должность</Label>
                  <Input id="position" defaultValue="Специалист" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="organization">Организация</Label>
                <Input id="organization" defaultValue="Областной акимат Павлодарской области" />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave}>Сохранить</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Уведомления</CardTitle>
              <CardDescription>Настройка уведомлений системы</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email уведомления</Label>
                    <p className="text-sm text-muted-foreground">Получать уведомления по электронной почте</p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="new-family">Новые семьи</Label>
                    <p className="text-sm text-muted-foreground">Уведомления о добавлении новых семей</p>
                  </div>
                  <Switch id="new-family" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="status-change">Изменение статуса</Label>
                    <p className="text-sm text-muted-foreground">Уведомления об изменении статуса семей</p>
                  </div>
                  <Switch id="status-change" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reports">Отчеты</Label>
                    <p className="text-sm text-muted-foreground">Уведомления о формировании отчетов</p>
                  </div>
                  <Switch id="reports" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="system">Системные уведомления</Label>
                    <p className="text-sm text-muted-foreground">Уведомления о системных событиях</p>
                  </div>
                  <Switch id="system" defaultChecked />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave}>Сохранить</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Безопасность</CardTitle>
              <CardDescription>Управление настройками безопасности</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-password">Текущий пароль</Label>
                  <Input id="current-password" type="password" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="new-password">Новый пароль</Label>
                  <Input id="new-password" type="password" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Подтверждение пароля</Label>
                  <Input id="confirm-password" type="password" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor">Двухфакторная аутентификация</Label>
                    <p className="text-sm text-muted-foreground">Повышенная защита вашей учетной записи</p>
                  </div>
                  <Switch id="two-factor" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave}>Сохранить</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {role === "admin" && (
          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Системные настройки</CardTitle>
                <CardDescription>Управление настройками системы</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="system-name">Название системы</Label>
                    <Input id="system-name" defaultValue="Единая база данных семей в ТЖС" />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="backup-frequency">Частота резервного копирования</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                      <option value="daily">Ежедневно</option>
                      <option value="weekly">Еженедельно</option>
                      <option value="monthly">Ежемесячно</option>
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="session-timeout">Тайм-аут сессии (минуты)</Label>
                    <Input id="session-timeout" type="number" defaultValue="30" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenance-mode">Режим обслуживания</Label>
                      <p className="text-sm text-muted-foreground">Временно отключить доступ к системе</p>
                    </div>
                    <Switch id="maintenance-mode" />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="maintenance-message">Сообщение о техническом обслуживании</Label>
                    <Textarea
                      id="maintenance-message"
                      defaultValue="Система находится на техническом обслуживании. Пожалуйста, попробуйте позже."
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave}>Сохранить</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
