"use client"

import type React from "react"

import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { type UserRole, roleConfigs } from "@/types/roles"
import { getFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage-utils"
import type { Family } from "@/types/models"

export default function NewFamilyPage() {
  const searchParams = useSearchParams()
  const role = (searchParams.get("role") as UserRole) || "admin"
  const router = useRouter()
  const { toast } = useToast()
  const roleConfig = roleConfigs[role]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Получаем данные из формы
    const form = e.target as HTMLFormElement
    const parentName = (form.querySelector("#parentName") as HTMLInputElement).value
    const iin = (form.querySelector("#iin") as HTMLInputElement).value
    const address = (form.querySelector("#address") as HTMLTextAreaElement).value
    const status = (form.querySelector("#status") as HTMLSelectElement)?.value || "tzhs"
    const familyType = (form.querySelector("#familyType") as HTMLSelectElement)?.value || "full"
    const childrenCount = Number.parseInt((form.querySelector("#childrenCount") as HTMLInputElement).value || "0")
    const employment = (form.querySelector("#employment") as HTMLSelectElement)?.value || "unemployed"
    const workplace = (form.querySelector("#workplace") as HTMLInputElement).value
    const needsSupport = (form.querySelector("#needsSupport") as HTMLInputElement)?.checked || false
    const needsEducation = (form.querySelector("#needsEducation") as HTMLInputElement)?.checked || false
    const needsHealth = (form.querySelector("#needsHealth") as HTMLInputElement)?.checked || false
    const needsPolice = (form.querySelector("#needsPolice") as HTMLInputElement)?.checked || false
    const notes = (form.querySelector("#notes") as HTMLTextAreaElement).value

    // Получаем существующие семьи
    const families = getFromStorage<Family[]>(STORAGE_KEYS.FAMILIES, [])

    // Генерируем новый ID
    const newId = families.length > 0 ? Math.max(...families.map((f) => f.id)) + 1 : 1

    // Текущая дата
    const now = new Date().toLocaleDateString("ru-RU")

    // Создаем объект семьи
    const newFamily: Family = {
      id: newId,
      name: parentName,
      iin,
      address,
      status: status === "tzhs" ? "ТЖС" : status === "nb" ? "Неблагополучная" : "ТЖС, Н/Б",
      familyType,
      children: childrenCount,
      employment,
      workplace,
      needsSupport,
      needsEducation,
      needsHealth,
      needsPolice,
      notes,
      createdBy: "Текущий пользователь",
      createdAt: now,
      lastUpdate: now,
    }

    // Сохраняем семью в localStorage
    saveToStorage(STORAGE_KEYS.FAMILIES, [...families, newFamily])

    toast({
      title: "Семья добавлена",
      description: "Новая семья успешно добавлена в базу данных",
    })

    router.push(`/families?role=${role}`)
  }

  // Redirect if user doesn't have permission to add families
  if (!roleConfig.permissions.canAddFamily) {
    router.push(`/dashboard?role=${role}`)
    return null
  }

  return (
    <DashboardLayout role={role}>
      <div className="flex-1 space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">Добавление новой семьи</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <Card className="enhanced-card">
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
                <CardDescription>Введите основные данные о семье</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="parentName">ФИО родителя</Label>
                    <Input id="parentName" defaultValue="Иванов Иван Иванович" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="iin">ИИН</Label>
                    <Input id="iin" defaultValue="123456789012" required />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Адрес проживания</Label>
                  <Textarea id="address" defaultValue="г. Павлодар, ул. Ленина, д. 10, кв. 5" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="status">Статус</Label>
                    <Select defaultValue="tzhs">
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Выберите статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tzhs">ТЖС</SelectItem>
                        <SelectItem value="nb">Неблагополучная</SelectItem>
                        <SelectItem value="both">ТЖС и Неблагополучная</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="familyType">Тип семьи</Label>
                    <Select defaultValue="full">
                      <SelectTrigger id="familyType">
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Полная</SelectItem>
                        <SelectItem value="single-mother">Одинокая мать</SelectItem>
                        <SelectItem value="single-father">Одинокий отец</SelectItem>
                        <SelectItem value="divorced">В разводе</SelectItem>
                        <SelectItem value="stepparent">С отчимом/мачехой</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="childrenCount">Количество детей</Label>
                    <Input id="childrenCount" type="number" min="1" defaultValue="2" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="employment">Занятость родителей</Label>
                    <Select defaultValue="employed">
                      <SelectTrigger id="employment">
                        <SelectValue placeholder="Выберите статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employed">Работает</SelectItem>
                        <SelectItem value="unemployed">Безработный</SelectItem>
                        <SelectItem value="part-time">Частичная занятость</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="workplace">Место работы и должность</Label>
                    <Input id="workplace" defaultValue="ТОО 'Компания', менеджер" />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Дополнительные параметры</Label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="needsSupport" defaultChecked />
                      <Label htmlFor="needsSupport" className="font-normal">
                        Требуется социальная поддержка
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="needsEducation" />
                      <Label htmlFor="needsEducation" className="font-normal">
                        Требуется поддержка в сфере образования
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="needsHealth" />
                      <Label htmlFor="needsHealth" className="font-normal">
                        Требуется медицинская помощь
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="needsPolice" />
                      <Label htmlFor="needsPolice" className="font-normal">
                        Требуется внимание правоохранительных органов
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Примечания</Label>
                  <Textarea id="notes" defaultValue="Семья нуждается в социальной поддержке" />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => router.back()}>
                Отмена
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Сохранить
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
