"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Family } from "@/types/models"
import { updateFamily } from "@/services/family-service"
import { DatePicker } from "./date-picker"

interface FamilyDetailsProps {
  family: Family
  onUpdate: () => void
}

export function FamilyDetails({ family, onUpdate }: FamilyDetailsProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<Partial<Family>>(family)
  const [isActive, setIsActive] = useState(family.isActive !== false)
  const [inactiveReason, setInactiveReason] = useState(family.inactiveReason || "")

  const handleChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleStatusChange = (value: string) => {
    handleChange("status", value)
  }

  const handleFamilyTypeChange = (value: string) => {
    handleChange("familyType", value)
  }

  const handleHousingTypeChange = (value: string) => {
    handleChange("housingType", value)
  }

  const handleActiveChange = (value: boolean) => {
    setIsActive(value)
    handleChange("isActive", value)
  }

  const handleInactiveReasonChange = (value: string) => {
    setInactiveReason(value)
    handleChange("inactiveReason", value)
  }

  const handleSave = () => {
    const updatedFamily = {
      ...family,
      ...formData,
      isActive,
      inactiveReason: isActive ? "" : inactiveReason,
    }
    updateFamily(updatedFamily)
    onUpdate()
  }

  const familyTypes = [
    { value: "полная", label: "Полная семья" },
    { value: "неполная", label: "Неполная семья" },
    { value: "многодетная", label: "Многодетная семья" },
    { value: "приемная", label: "Приемная семья" },
    { value: "опекунская", label: "Опекунская семья" },
    { value: "малообеспеченная", label: "Малообеспеченная семья" },
    { value: "молодая", label: "Молодая семья" },
    { value: "мать-одиночка", label: "Мать-одиночка" },
    { value: "отец-одиночка", label: "Отец-одиночка" },
  ]

  const statusOptions = [
    { value: "на учете", label: "На учете" },
    { value: "в ТЖС", label: "В трудной жизненной ситуации" },
    { value: "неблагополучная", label: "Неблагополучная" },
    { value: "обследование", label: "Обследование" },
  ]

  const housingTypes = [
    { value: "квартира", label: "Квартира" },
    { value: "частный дом", label: "Частный дом" },
    { value: "комната", label: "Комната" },
    { value: "общежитие", label: "Общежитие" },
    { value: "съемное жилье", label: "Съемное жилье" },
    { value: "социальное жилье", label: "Социальное жилье" },
    { value: "аварийное жилье", label: "Аварийное жилье" },
    { value: "нет жилья", label: "Нет жилья" },
  ]

  const inactiveReasons = [
    { value: "переезд", label: "Переезд" },
    { value: "улучшение ситуации", label: "Улучшение ситуации" },
    { value: "отказ от услуг", label: "Отказ от услуг" },
    { value: "другое", label: "Другое" },
  ]

  const tjsReasons = [
    { value: "потеря работы", label: "Потеря работы" },
    { value: "болезнь", label: "Болезнь" },
    { value: "потеря кормильца", label: "Потеря кормильца" },
    { value: "низкий доход", label: "Низкий доход" },
    { value: "другое", label: "Другое" },
  ]

  const badFamilyReasons = [
    { value: "алкоголизм", label: "Алкоголизм" },
    { value: "наркомания", label: "Наркомания" },
    { value: "насилие", label: "Насилие" },
    { value: "пренебрежение", label: "Пренебрежение нуждами детей" },
    { value: "другое", label: "Другое" },
  ]

  const showTjsReason = formData.status === "в ТЖС"
  const showBadFamilyReason = formData.status === "неблагополучная"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Основная информация</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="familyName">Фамилия семьи</Label>
            <Input
              id="familyName"
              value={formData.familyName || ""}
              onChange={(e) => handleChange("familyName", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="familyType">Тип семьи</Label>
            <Select value={formData.familyType || ""} onValueChange={handleFamilyTypeChange}>
              <SelectTrigger id="familyType">
                <SelectValue placeholder="Выберите тип семьи" />
              </SelectTrigger>
              <SelectContent>
                {familyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="status">Статус</Label>
            <Select value={formData.status || ""} onValueChange={handleStatusChange}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="registrationDate">Дата постановки на учет</Label>
            <DatePicker
              date={formData.registrationDate ? new Date(formData.registrationDate) : undefined}
              setDate={(date) => handleChange("registrationDate", date?.toISOString())}
            />
          </div>
        </div>

        {showTjsReason && (
          <div className="mb-4">
            <Label htmlFor="tjsReason">Причина ТЖС</Label>
            <Select value={formData.tjsReason || ""} onValueChange={(value) => handleChange("tjsReason", value)}>
              <SelectTrigger id="tjsReason">
                <SelectValue placeholder="Выберите причину" />
              </SelectTrigger>
              <SelectContent>
                {tjsReasons.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showBadFamilyReason && (
          <div className="mb-4">
            <Label htmlFor="badFamilyReason">Причина неблагополучия</Label>
            <Select
              value={formData.badFamilyReason || ""}
              onValueChange={(value) => handleChange("badFamilyReason", value)}
            >
              <SelectTrigger id="badFamilyReason">
                <SelectValue placeholder="Выберите причину" />
              </SelectTrigger>
              <SelectContent>
                {badFamilyReasons.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="address">Адрес проживания</Label>
            <Input
              id="address"
              value={formData.address || ""}
              onChange={(e) => handleChange("address", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="registrationAddress">Адрес прописки</Label>
            <Input
              id="registrationAddress"
              value={formData.registrationAddress || ""}
              onChange={(e) => handleChange("registrationAddress", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="district">Район</Label>
            <Input
              id="district"
              value={formData.district || ""}
              onChange={(e) => handleChange("district", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="housingType">Вид жилья</Label>
            <Select value={formData.housingType || ""} onValueChange={handleHousingTypeChange}>
              <SelectTrigger id="housingType">
                <SelectValue placeholder="Выберите вид жилья" />
              </SelectTrigger>
              <SelectContent>
                {housingTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="contactPhone">Контактный телефон</Label>
            <Input
              id="contactPhone"
              value={formData.contactPhone || ""}
              onChange={(e) => handleChange("contactPhone", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="income">Доход семьи (тенге)</Label>
            <Input
              id="income"
              type="number"
              value={formData.income || ""}
              onChange={(e) => handleChange("income", e.target.value)}
            />
          </div>
        </div>

        <div className="mb-4">
          <Label htmlFor="notes">Примечания</Label>
          <Textarea
            id="notes"
            value={formData.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => handleActiveChange(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="isActive">Семья активна</Label>
          </div>
        </div>

        {!isActive && (
          <div className="mb-4">
            <Label htmlFor="inactiveReason">Причина выбытия</Label>
            <Select value={inactiveReason} onValueChange={handleInactiveReasonChange}>
              <SelectTrigger id="inactiveReason">
                <SelectValue placeholder="Выберите причину" />
              </SelectTrigger>
              <SelectContent>
                {inactiveReasons.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            Отмена
          </Button>
          <Button onClick={handleSave}>Сохранить</Button>
        </div>
      </CardContent>
    </Card>
  )
}
