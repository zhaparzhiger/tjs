"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { UserRole } from "@/types/roles"
import type { Family } from "@/types/models"
import { FamilyService } from "@/services/family-service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FamilyDetailsExtendedProps {
  family: Family
  role: UserRole
  onUpdate?: (updatedFamily: Family) => void
}

export function FamilyDetailsExtended({ family, role, onUpdate }: FamilyDetailsExtendedProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Family>>({
    name: family.name,
    iin: family.iin,
    address: family.address,
    registrationAddress: family.registrationAddress || family.address,
    status: family.status,
    statusReason: family.statusReason || "",
    tzhsReason: family.tzhsReason || "",
    nbReason: family.nbReason || "",
    inspectionStatus: family.inspectionStatus || "not-inspected",
    familyType: family.familyType || "full",
    children: family.children,
    housingType: family.housingType || "apartment",
    employment: family.employment || "employed-official",
    workplace: family.workplace || "",
    familyIncome: family.familyIncome || "",
    needsSupport: family.needsSupport || false,
    needsEducation: family.needsEducation || false,
    needsHealth: family.needsHealth || false,
    needsPolice: family.needsPolice || false,
    hasDisability: family.hasDisability || false,
    isActive: family.isActive !== false, // По умолчанию активна
    inactiveReason: family.inactiveReason || "",
    notes: family.notes || "",
  })

  // Обновление формы при изменении семьи
  useEffect(() => {
    setFormData({
      name: family.name,
      iin: family.iin,
      address: family.address,
      registrationAddress: family.registrationAddress || family.address,
      status: family.status,
      statusReason: family.statusReason || "",
      tzhsReason: family.tzhsReason || "",
      nbReason: family.nbReason || "",
      inspectionStatus: family.inspectionStatus || "not-inspected",
      familyType: family.familyType || "full",
      children: family.children,
      housingType: family.housingType || "apartment",
      employment: family.employment || "employed-official",
      workplace: family.workplace || "",
      familyIncome: family.familyIncome || "",
      needsSupport: family.needsSupport || false,
      needsEducation: family.needsEducation || false,
      needsHealth: family.needsHealth || false,
      needsPolice: family.needsPolice || false,
      hasDisability: family.hasDisability || false,
      isActive: family.isActive !== false, // По умолчанию активна
      inactiveReason: family.inactiveReason || "",
      notes: family.notes || "",
    })
  }, [family])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: Number.parseInt(value) || 0 }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [id]: checked }))
  }

  const handleSave = () => {
    // Обновление семьи в localStorage
    const updatedFamily = FamilyService.updateFamily(
      family.id,
      formData,
      "Иванов Петр", // В реальном приложении здесь был бы текущий пользователь
    )

    if (updatedFamily) {
      setIsEditing(false)
      toast({
        title: "Изменения сохранены",
        description: "Данные семьи успешно обновлены",
      })

      // Вызов колбэка для обновления родительского компонента
      if (onUpdate) {
        onUpdate(updatedFamily)
      }
    } else {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить изменения",
        variant: "destructive",
      })
    }
  }

  // Проверка доступа к функциям в зависимости от роли
  const canEditFamily = ["admin", "district", "social", "school", "police", "health"].includes(role)

  const getInspectionStatusBadge = (status: string) => {
    switch (status) {
      case "inspected":
        return <Badge className="bg-green-600">Обследовано</Badge>
      case "scheduled":
        return <Badge className="bg-yellow-600">Запланировано</Badge>
      case "not-inspected":
        return <Badge className="bg-gray-400">Не обследовано</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="family-tabs-container">
          <Tabs defaultValue="basic" className="w-full">
            <div className="family-tabs-list">
              <TabsList className="w-full">
                <TabsTrigger value="basic" className="family-tab">
                  Основная информация
                </TabsTrigger>
                <TabsTrigger value="address" className="family-tab">
                  Адрес
                </TabsTrigger>
                <TabsTrigger value="housing" className="family-tab">
                  Жилищные условия
                </TabsTrigger>
                <TabsTrigger value="income" className="family-tab">
                  Доход
                </TabsTrigger>
                <TabsTrigger value="status" className="family-tab">
                  Статус
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="basic">
              <div className="grid gap-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {formData.isActive ? (
                      <Badge className="bg-green-600">Активна</Badge>
                    ) : (
                      <Badge className="bg-red-600">Выбыла</Badge>
                    )}
                    {formData.inspectionStatus && getInspectionStatusBadge(formData.inspectionStatus)}
                  </div>
                  {!isEditing ? (
                    <Button variant="outline" onClick={() => setIsEditing(true)} disabled={!canEditFamily}>
                      Редактировать
                    </Button>
                  ) : (
                    <Button onClick={handleSave}>Сохранить</Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">ФИО родителя</Label>
                    <Input id="name" value={formData.name} onChange={handleInputChange} readOnly={!isEditing} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="iin">ИИН</Label>
                    <Input id="iin" value={formData.iin} onChange={handleInputChange} readOnly={!isEditing} />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="address">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="address">Адрес проживания</Label>
                  <Textarea id="address" value={formData.address} onChange={handleInputChange} readOnly={!isEditing} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="registrationAddress">Адрес прописки</Label>
                  <Textarea
                    id="registrationAddress"
                    value={formData.registrationAddress}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="status">
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="status">Статус</Label>
                    {isEditing ? (
                      <Select
                        value={formData.status?.includes("Н/Б") ? "both" : "tzhs"}
                        onValueChange={(value) => handleSelectChange("status", value === "both" ? "ТЖС, Н/Б" : "ТЖС")}
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Выберите статус" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tzhs">ТЖС</SelectItem>
                          <SelectItem value="nb">Неблагополучная</SelectItem>
                          <SelectItem value="both">ТЖС и Неблагополучная</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input value={formData.status} readOnly />
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="statusReason">Причина постановки</Label>
                    <Input
                      id="statusReason"
                      value={formData.statusReason}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      placeholder="Укажите причину постановки на учет"
                    />
                  </div>
                </div>

                {formData.status?.includes("ТЖС") && (
                  <div className="grid gap-2">
                    <Label htmlFor="tzhsReason">Причина ТЖС</Label>
                    {isEditing ? (
                      <Select
                        value={formData.tzhsReason || "low-income"}
                        onValueChange={(value) => handleSelectChange("tzhsReason", value)}
                      >
                        <SelectTrigger id="tzhsReason">
                          <SelectValue placeholder="Выберите причину" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low-income">Малообеспеченность</SelectItem>
                          <SelectItem value="many-children">Многодетность</SelectItem>
                          <SelectItem value="single-parent">Неполная семья</SelectItem>
                          <SelectItem value="disability">Инвалидность</SelectItem>
                          <SelectItem value="orphan">Сироты</SelectItem>
                          <SelectItem value="other">Другое</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={
                          formData.tzhsReason === "low-income"
                            ? "Малообеспеченность"
                            : formData.tzhsReason === "many-children"
                              ? "Многодетность"
                              : formData.tzhsReason === "single-parent"
                                ? "Неполная семья"
                                : formData.tzhsReason === "disability"
                                  ? "Инвалидность"
                                  : formData.tzhsReason === "orphan"
                                    ? "Сироты"
                                    : formData.tzhsReason === "other"
                                      ? "Другое"
                                      : formData.tzhsReason || ""
                        }
                        readOnly
                      />
                    )}
                  </div>
                )}

                {formData.status?.includes("Н/Б") && (
                  <div className="grid gap-2">
                    <Label htmlFor="nbReason">Причина неблагополучия</Label>
                    {isEditing ? (
                      <Select
                        value={formData.nbReason || "alcohol"}
                        onValueChange={(value) => handleSelectChange("nbReason", value)}
                      >
                        <SelectTrigger id="nbReason">
                          <SelectValue placeholder="Выберите причину" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alcohol">Алкоголизм</SelectItem>
                          <SelectItem value="drugs">Наркомания</SelectItem>
                          <SelectItem value="violence">Насилие в семье</SelectItem>
                          <SelectItem value="neglect">Пренебрежение нуждами детей</SelectItem>
                          <SelectItem value="criminal">Криминальное поведение</SelectItem>
                          <SelectItem value="other">Другое</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={
                          formData.nbReason === "alcohol"
                            ? "Алкоголизм"
                            : formData.nbReason === "drugs"
                              ? "Наркомания"
                              : formData.nbReason === "violence"
                                ? "Насилие в семье"
                                : formData.nbReason === "neglect"
                                  ? "Пренебрежение нуждами детей"
                                  : formData.nbReason === "criminal"
                                    ? "Криминальное поведение"
                                    : formData.nbReason === "other"
                                      ? "Другое"
                                      : formData.nbReason || ""
                        }
                        readOnly
                      />
                    )}
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="inspectionStatus">Статус обследования</Label>
                  {isEditing ? (
                    <Select
                      value={formData.inspectionStatus || "not-inspected"}
                      onValueChange={(value) => handleSelectChange("inspectionStatus", value)}
                    >
                      <SelectTrigger id="inspectionStatus">
                        <SelectValue placeholder="Выберите статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-inspected">Не обследовано</SelectItem>
                        <SelectItem value="scheduled">Запланировано</SelectItem>
                        <SelectItem value="inspected">Обследовано</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="h-10 px-3 py-2 rounded-md border border-input bg-background flex items-center">
                      {getInspectionStatusBadge(formData.inspectionStatus || "not-inspected")}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="housing">
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="familyType">Тип семьи</Label>
                    {isEditing ? (
                      <Select
                        value={formData.familyType}
                        onValueChange={(value) => handleSelectChange("familyType", value)}
                      >
                        <SelectTrigger id="familyType">
                          <SelectValue placeholder="Выберите тип" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Полная</SelectItem>
                          <SelectItem value="single-mother">Одинокая мать (форма 4)</SelectItem>
                          <SelectItem value="widow">Вдова</SelectItem>
                          <SelectItem value="widower">Вдовец</SelectItem>
                          <SelectItem value="divorced">В разводе</SelectItem>
                          <SelectItem value="stepparent">С отчимом/мачехой</SelectItem>
                          <SelectItem value="with-cohabitant">С сожителем/сожительницей</SelectItem>
                          <SelectItem value="with-grandparents">С бабушкой и дедушкой</SelectItem>
                          <SelectItem value="guardian">Опекун</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={
                          formData.familyType === "full"
                            ? "Полная"
                            : formData.familyType === "single-mother"
                              ? "Одинокая мать (форма 4)"
                              : formData.familyType === "widow"
                                ? "Вдова"
                                : formData.familyType === "widower"
                                  ? "Вдовец"
                                  : formData.familyType === "divorced"
                                    ? "В разводе"
                                    : formData.familyType === "stepparent"
                                      ? "С отчимом/мачехой"
                                      : formData.familyType === "with-cohabitant"
                                        ? "С сожителем/сожительницей"
                                        : formData.familyType === "with-grandparents"
                                          ? "С бабушкой и дедушкой"
                                          : formData.familyType === "guardian"
                                            ? "Опекун"
                                            : "Полная"
                        }
                        readOnly
                      />
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="children">Количество детей</Label>
                    <Input
                      id="children"
                      type="number"
                      value={formData.children}
                      onChange={handleNumberChange}
                      readOnly={!isEditing}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="housingType">Вид жилья</Label>
                    {isEditing ? (
                      <Select
                        value={formData.housingType || "apartment"}
                        onValueChange={(value) => handleSelectChange("housingType", value)}
                      >
                        <SelectTrigger id="housingType">
                          <SelectValue placeholder="Выберите тип жилья" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apartment">Квартира</SelectItem>
                          <SelectItem value="house">Частный дом</SelectItem>
                          <SelectItem value="dormitory">Общежитие</SelectItem>
                          <SelectItem value="rental">Арендное жилье</SelectItem>
                          <SelectItem value="relatives">У родственников</SelectItem>
                          <SelectItem value="social">Социальное жилье</SelectItem>
                          <SelectItem value="other">Другое</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={
                          formData.housingType === "apartment"
                            ? "Квартира"
                            : formData.housingType === "house"
                              ? "Частный дом"
                              : formData.housingType === "dormitory"
                                ? "Общежитие"
                                : formData.housingType === "rental"
                                  ? "Арендное жилье"
                                  : formData.housingType === "relatives"
                                    ? "У родственников"
                                    : formData.housingType === "social"
                                      ? "Социальное жилье"
                                      : formData.housingType === "other"
                                        ? "Другое"
                                        : formData.housingType || ""
                        }
                        readOnly
                      />
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="income">
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="employment">Занятость родителей</Label>
                    {isEditing ? (
                      <Select
                        value={formData.employment}
                        onValueChange={(value) => handleSelectChange("employment", value)}
                      >
                        <SelectTrigger id="employment">
                          <SelectValue placeholder="Выберите статус" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employed-official">Работает официально</SelectItem>
                          <SelectItem value="employed-unofficial">Работает неофициально</SelectItem>
                          <SelectItem value="self-employed">Самозанятый</SelectItem>
                          <SelectItem value="unemployed">Безработный</SelectItem>
                          <SelectItem value="part-time">Частичная занятость</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={
                          formData.employment === "employed-official"
                            ? "Работает официально"
                            : formData.employment === "employed-unofficial"
                              ? "Работает неофициально"
                              : formData.employment === "self-employed"
                                ? "Самозанятый"
                                : formData.employment === "unemployed"
                                  ? "Безработный"
                                  : formData.employment === "part-time"
                                    ? "Частичная занятость"
                                    : formData.employment || "Работает"
                        }
                        readOnly
                      />
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="workplace">Место работы и должность</Label>
                    <Input
                      id="workplace"
                      value={formData.workplace}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="familyIncome">Доходы семьи (тыс. тенге в месяц)</Label>
                  <Input
                    id="familyIncome"
                    value={formData.familyIncome}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    placeholder="Укажите общий доход семьи"
                  />
                </div>

                {!formData.isActive && (
                  <div className="grid gap-2">
                    <Label htmlFor="inactiveReason">Причина выбытия</Label>
                    {isEditing ? (
                      <Select
                        value={formData.inactiveReason || "moved"}
                        onValueChange={(value) => handleSelectChange("inactiveReason", value)}
                      >
                        <SelectTrigger id="inactiveReason">
                          <SelectValue placeholder="Выберите причину" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="moved">Переезд</SelectItem>
                          <SelectItem value="improved">Улучшение ситуации</SelectItem>
                          <SelectItem value="children-grown">Дети выросли</SelectItem>
                          <SelectItem value="death">Смерть</SelectItem>
                          <SelectItem value="other">Другое</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={
                          formData.inactiveReason === "moved"
                            ? "Переезд"
                            : formData.inactiveReason === "improved"
                              ? "Улучшение ситуации"
                              : formData.inactiveReason === "children-grown"
                                ? "Дети выросли"
                                : formData.inactiveReason === "death"
                                  ? "Смерть"
                                  : formData.inactiveReason === "other"
                                    ? "Другое"
                                    : formData.inactiveReason || ""
                        }
                        readOnly
                      />
                    )}
                  </div>
                )}

                <div className="grid gap-2">
                  <Label>Дополнительные параметры</Label>
                  <div className="flex flex-col gap-2">
                    {isEditing && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isActive"
                          checked={formData.isActive}
                          onCheckedChange={(checked) => handleCheckboxChange("isActive", checked as boolean)}
                        />
                        <Label htmlFor="isActive" className="font-normal">
                          Семья активна
                        </Label>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="needsSupport"
                        checked={formData.needsSupport}
                        onCheckedChange={(checked) => handleCheckboxChange("needsSupport", checked as boolean)}
                        disabled={!isEditing}
                      />
                      <Label htmlFor="needsSupport" className="font-normal">
                        Требуется социальная поддержка
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="needsEducation"
                        checked={formData.needsEducation}
                        onCheckedChange={(checked) => handleCheckboxChange("needsEducation", checked as boolean)}
                        disabled={!isEditing}
                      />
                      <Label htmlFor="needsEducation" className="font-normal">
                        Требуется поддержка в сфере образования
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="needsHealth"
                        checked={formData.needsHealth}
                        onCheckedChange={(checked) => handleCheckboxChange("needsHealth", checked as boolean)}
                        disabled={!isEditing}
                      />
                      <Label htmlFor="needsHealth" className="font-normal">
                        Требуется медицинская помощь
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="needsPolice"
                        checked={formData.needsPolice}
                        onCheckedChange={(checked) => handleCheckboxChange("needsPolice", checked as boolean)}
                        disabled={!isEditing}
                      />
                      <Label htmlFor="needsPolice" className="font-normal">
                        Требуется внимание правоохранительных органов
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasDisability"
                        checked={formData.hasDisability}
                        onCheckedChange={(checked) => handleCheckboxChange("hasDisability", checked as boolean)}
                        disabled={!isEditing}
                      />
                      <Label htmlFor="hasDisability" className="font-normal">
                        Есть члены семьи с инвалидностью
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Примечания</Label>
                  <Textarea id="notes" value={formData.notes} onChange={handleInputChange} readOnly={!isEditing} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}
