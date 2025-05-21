"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { UserRole } from "@/types/roles"
import type { Family } from "@/types/models"

// Define FamilyMember interface for fetching children count
interface FamilyMember {
  id: string
  firstName: string
  lastName: string
  relationship: string
  status: string
}

// Define component props
interface FamilyDetailsExtendedProps {
  family: Family
  role: UserRole
  onUpdate?: (updatedFamily: Family) => void
}

export function FamilyDetailsExtended({ family, role, onUpdate }: FamilyDetailsExtendedProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [childrenCount, setChildrenCount] = useState<number>(family.children || 0)
  const [formData, setFormData] = useState<Partial<Family>>({
    name: family.name || "",
    iin: family.iin || "",
    address: family.address || "",
    registrationAddress: family.registrationAddress || family.address || "",
    status: family.status || "ТЖС",
    settingReason: family.settingReason || "",
    tzhsReason: family.tzhsReason || "",
    nbReason: family.nbReason || "",
    inspectionStatus: family.inspectionStatus || "not-inspected",
    familyType: family.familyType || "full",
    children: family.children || 0,
    housingType: family.housingType || "apartment",
    employment: family.employment || "employed-official",
    workplace: family.workplace || "",
    familyIncome: family.familyIncome || "",
    needsSupport: family.needsSupport || false,
    needsEducation: family.needsEducation || false,
    needsHealth: family.needsHealth || false,
    needsPolice: family.needsPolice || false,
    hasDisability: family.hasDisability || false,
    isActive: family.isActive !== false,
    inactiveReason: family.inactiveReason || "",
    notes: family.notes || "",
    region: family.region || "",
    district: family.district || "",
    city: family.city || "",
    riskLevel: family.riskLevel || "",
    riskFactors: family.riskFactors || "",
    socialBenefits: family.socialBenefits || "",
    contactPhone: family.contactPhone || "",
    contactEmail: family.contactEmail || "",
    hasInterpreterNeeded: family.hasInterpreterNeeded || false,
  })

  // Fetch family members to calculate children count
  useEffect(() => {
    if (!family.id) {
      toast({
        title: "Ошибка",
        description: "Идентификатор семьи отсутствует",
        variant: "destructive",
      })
      return
    }

    const fetchFamilyMembers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/family-members/family/${family.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
          },
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to fetch family members")
        }
        const members: FamilyMember[] = await response.json()
        const children = members.filter(
          (member) =>
            member.relationship === "son" ||
            member.relationship === "daughter" ||
            member.status === "Школьник" ||
            member.status === "Дошкольник",
        ).length
        setChildrenCount(children)
      } catch (error: any) {
        console.error("Error fetching family members:", error)
        toast({
          title: "Ошибка",
          description: error.message || "Не удалось загрузить данные о членах семьи",
          variant: "destructive",
        })
      }
    }
    fetchFamilyMembers()
  }, [family.id, toast])

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

  const handleArrayInputChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSave = async () => {
    try {
      const payload = {
        familyName: formData.name,
        caseNumber: formData.iin,
        address: formData.address,
        registrationAddress: formData.registrationAddress,
        status: formData.status,
        settingReason: formData.settingReason,
        tzhsReason: formData.tzhsReason,
        nbReason: formData.nbReason,
        children: formData.children,
        inspectionStatus: formData.inspectionStatus,
        familyType: formData.familyType,
        housingType: formData.housingType,
        employment: formData.employment,
        workplace: formData.workplace,
        familyIncome: formData.familyIncome,
        needsSupport: formData.needsSupport,
        needsEducation: formData.needsEducation,
        needsHealth: formData.needsHealth,
        needsPolice: formData.needsPolice,
        hasDisability: formData.hasDisability,
        isActive: formData.isActive,
        inactiveReason: formData.inactiveReason,
        notes: formData.notes,
        region: formData.region || "",
        district: formData.district || "",
        city: formData.city || "",
        riskLevel: formData.riskLevel || "",
        riskFactors: formData.riskFactors || "",
        socialBenefits: formData.socialBenefits || "",
        contactPhone: formData.contactPhone || "",
        contactEmail: formData.contactEmail || "",
        hasInterpreterNeeded: formData.hasInterpreterNeeded || false,
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/families/${family.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update family")
      }

      const updated = await response.json()
      const updatedDestructured = updated.family
      console.log(updatedDestructured)
      const updatedFamily: Family = {
        id: updatedDestructured.id,
        name: updatedDestructured.familyName,
        iin: updatedDestructured.caseNumber,
        address: updatedDestructured.address,
        registrationAddress: updatedDestructured.registrationAddress || updatedDestructured.address,
        status: updatedDestructured.status,
        settingReason: updatedDestructured.settingReason || "",
        tzhsReason: updatedDestructured.tzhsReason || "",
        nbReason: updatedDestructured.nbReason || "",
        inspectionStatus: updatedDestructured.inspectionStatus || "not-inspected",
        familyType: updatedDestructured.familyType || "full",
        children: updatedDestructured.children,
        housingType: updatedDestructured.housingType || "apartment",
        employment: updatedDestructured.employment || "employed-official",
        workplace: updatedDestructured.workplace || "",
        familyIncome: updatedDestructured.familyIncome || "",
        needsSupport: updatedDestructured.needsSupport || false,
        needsEducation: updatedDestructured.needsEducation || false,
        needsHealth: updatedDestructured.needsHealth || false,
        needsPolice: updatedDestructured.needsPolice || false,
        hasDisability: updatedDestructured.hasDisability || false,
        isActive: updatedDestructured.isActive !== false,
        inactiveReason: updatedDestructured.inactiveReason || "",
        notes: updatedDestructured.notes || "",
        lastUpdate: new Date(updatedDestructured.lastUpdate).toLocaleDateString(),
        region: updatedDestructured.region || "",
        district: updatedDestructured.district || "",
        city: updatedDestructured.city || "",
        riskLevel: updatedDestructured.riskLevel || "",
        riskFactors: updatedDestructured.riskFactors || "",
        socialBenefits: updatedDestructured.socialBenefits || "",
        contactPhone: updatedDestructured.contactPhone || "",
        contactEmail: updatedDestructured.contactEmail || "",
        hasInterpreterNeeded: updatedDestructured.hasInterpreterNeeded || false,
      }

      console.log(updatedFamily)

      setIsEditing(false)
      toast({
        title: "Изменения сохранены",
        description: "Данные семьи успешно обновлены",
      })

      if (onUpdate) {
        onUpdate(updatedFamily)
      }
    } catch (error: any) {
      console.error("Error updating family:", error)
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось сохранить изменения",
        variant: "destructive",
      })
    }
  }

  // Role-based permissions
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
    <div className="flex-1 space-y-4">
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {formData.isActive ? (
            <Badge className="bg-green-600">Активна</Badge>
          ) : (
            <Badge className="bg-red-600">Выбыла</Badge>
          )}
          {formData.inspectionStatus && getInspectionStatusBadge(formData.inspectionStatus)}
        </div>
        {!isEditing ? (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            disabled={!canEditFamily}
            className="w-full xs:w-auto"
          >
            Редактировать
          </Button>
        ) : (
          <div className="flex flex-col xs:flex-row gap-2 w-full xs:w-auto">
            <Button variant="outline" onClick={() => setIsEditing(false)} className="w-full xs:w-auto">
              Отмена
            </Button>
            <Button onClick={handleSave} className="w-full xs:w-auto">
              Сохранить
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Информация о семье</CardTitle>
          <CardDescription>Просмотр и редактирование данных семьи</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">ФИО родителя</Label>
              <Input id="name" value={formData.name || ""} onChange={handleInputChange} readOnly={!isEditing} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="iin">ИИН</Label>
              <Input id="iin" value={formData.iin || ""} onChange={handleInputChange} readOnly={!isEditing} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Адрес проживания</Label>
            <Textarea id="address" value={formData.address || ""} onChange={handleInputChange} readOnly={!isEditing} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="registrationAddress">Адрес прописки</Label>
            <Textarea
              id="registrationAddress"
              value={formData.registrationAddress || ""}
              onChange={handleInputChange}
              readOnly={!isEditing}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="region">Регион</Label>
              <Input
                id="region"
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                readOnly={!isEditing}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="district">Район</Label>
              <Input
                id="district"
                name="district"
                value={formData.district}
                readOnly={!isEditing}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">Город</Label>
              <Input id="city" name="city" value={formData.city} readOnly={!isEditing} onChange={handleInputChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Статус</Label>
              {isEditing ? (
                <Select
                  value={
                    formData.status === "ТЖС, Неблагополучная"
                      ? "both"
                      : formData.status === "ТЖС"
                        ? "tzhs"
                        : formData.status === "Неблагополучная"
                          ? "nb"
                          : "tzhs" // Значение по умолчанию
                  }
                  onValueChange={(value) =>
                    handleSelectChange(
                      "status",
                      value === "both" ? "ТЖС, Неблагополучная" : value === "tzhs" ? "ТЖС" : "Неблагополучная",
                    )
                  }
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
                <Input value={formData.status || ""} readOnly />
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="settingReason">Причина постановки</Label>
              <Input
                id="settingReason"
                value={formData.settingReason || ""}
                onChange={handleInputChange}
                readOnly={!isEditing}
                placeholder="Укажите причину постановки на учет"
              />
            </div>

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

          {formData.status?.includes("Неблагополучная") && (
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="familyType">Тип семьи</Label>
              {isEditing ? (
                <Select
                  value={formData.familyType || "full"}
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
                                      : formData.familyType || "Полная"
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
                min={0}
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

          <div className="grid gap-2">
            <Label htmlFor="riskLevel">Уровень риска</Label>
            {isEditing ? (
              <Select value={formData.riskLevel} onValueChange={(value) => handleSelectChange("riskLevel", value)}>
                <SelectTrigger id="riskLevel">
                  <SelectValue placeholder="Выберите уровень" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Низкий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={
                  formData.riskLevel === "low"
                    ? "Низкий"
                    : formData.riskLevel === "medium"
                      ? "Средний"
                      : formData.riskLevel === "high"
                        ? "Высокий"
                        : formData.riskLevel || ""
                }
                readOnly
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="employment">Занятость родителей</Label>
              {isEditing ? (
                <Select
                  value={formData.employment || "employed-official"}
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
                              : formData.employment || ""
                  }
                  readOnly
                />
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="workplace">Место работы и должность</Label>
              <Input
                id="workplace"
                value={formData.workplace || ""}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="riskFactors">Факторы риска (через запятую)</Label>
            <Input
              id="riskFactors"
              name="riskFactors"
              value={formData.riskFactors}
              readOnly={!isEditing}
              onChange={(e) => handleArrayInputChange("riskFactors", e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="socialBenefits">Социальные выплаты (через запятую)</Label>
            <Input
              id="socialBenefits"
              name="socialBenefits"
              value={formData.socialBenefits}
              readOnly={!isEditing}
              onChange={(e) => handleArrayInputChange("socialBenefits", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="contactPhone">Контактный телефон</Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                readOnly={!isEditing}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactEmail">Контактный email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                readOnly={!isEditing}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="familyIncome">Доходы семьи (тыс. тенге в месяц)</Label>
            <Input
              id="familyIncome"
              value={formData.familyIncome || ""}
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
                    checked={formData.isActive || false}
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
                  checked={formData.needsSupport || false}
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
                  checked={formData.needsEducation || false}
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
                  checked={formData.needsHealth || false}
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
                  checked={formData.needsPolice || false}
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
                  checked={formData.hasDisability || false}
                  onCheckedChange={(checked) => handleCheckboxChange("hasDisability", checked as boolean)}
                  disabled={!isEditing}
                />
                <Label htmlFor="hasDisability" className="font-normal">
                  Есть члены семьи с инвалидностью
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasInterpreterNeeded"
                  checked={formData.hasInterpreterNeeded}
                  onCheckedChange={(checked) => handleCheckboxChange("hasInterpreterNeeded", checked as boolean)}
                  disabled={!isEditing}
                />
                <Label htmlFor="hasInterpreterNeeded" className="font-normal">
                  Требуется переводчик
                </Label>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Примечания</Label>
            <Textarea id="notes" value={formData.notes || ""} onChange={handleInputChange} readOnly={!isEditing} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
