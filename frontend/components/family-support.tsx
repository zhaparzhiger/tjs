"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { Family, SupportMeasure } from "@/types/models"
import { updateFamily } from "@/services/family-service"

interface FamilySupportProps {
  family: Family
  onUpdate: () => void
}

export function FamilySupport({ family, onUpdate }: FamilySupportProps) {
  const [supportMeasures, setSupportMeasures] = useState<SupportMeasure[]>(family.supportMeasures || [])
  const [newMeasure, setNewMeasure] = useState<SupportMeasure>({
    id: Date.now().toString(),
    type: "",
    category: "",
    status: "в обработке",
    dateRequested: new Date().toISOString(),
    dateProvided: "",
    notes: "",
    chronology: [],
  })

  const supportCategories = [
    { value: "социальная", label: "Социальная поддержка" },
    { value: "материальная", label: "Материальная помощь" },
    { value: "психологическая", label: "Психологическая помощь" },
    { value: "юридическая", label: "Юридическая помощь" },
    { value: "медицинская", label: "Здравоохранение" },
    { value: "образовательная", label: "Образование" },
    { value: "трудоустройство", label: "Трудоустройство" },
    { value: "жилищная", label: "Жилищная помощь" },
    { value: "благотворительность", label: "Благотворительность" },
  ]

  const supportTypes: Record<string, { value: string; label: string }[]> = {
    социальная: [
      { value: "консультация", label: "Консультация социального работника" },
      { value: "патронаж", label: "Социальный патронаж" },
      { value: "акт привлечения", label: "Акт привлечения" },
      { value: "сопровождение", label: "Социальное сопровождение" },
    ],
    материальная: [
      { value: "единовременная", label: "Единовременная выплата" },
      { value: "ежемесячная", label: "Ежемесячное пособие" },
      { value: "продуктовая", label: "Продуктовая помощь" },
      { value: "вещевая", label: "Вещевая помощь" },
    ],
    психологическая: [
      { value: "консультация психолога", label: "Консультация психолога" },
      { value: "групповая терапия", label: "Групповая терапия" },
      { value: "кризисная помощь", label: "Кризисная помощь" },
    ],
    юридическая: [
      { value: "консультация юриста", label: "Консультация юриста" },
      { value: "оформление документов", label: "Оформление документов" },
      { value: "представительство", label: "Представительство в суде" },
    ],
    медицинская: [
      { value: "медосмотр", label: "Медицинский осмотр" },
      { value: "лечение", label: "Лечение" },
      { value: "реабилитация", label: "Реабилитация" },
      { value: "медучреждение", label: "Определение в медучреждение" },
    ],
    образовательная: [
      { value: "устройство в школу", label: "Устройство в школу" },
      { value: "устройство в детский сад", label: "Устройство в детский сад" },
      { value: "дополнительное образование", label: "Дополнительное образование" },
    ],
    трудоустройство: [
      { value: "поиск работы", label: "Помощь в поиске работы" },
      { value: "профориентация", label: "Профориентация" },
      { value: "обучение", label: "Профессиональное обучение" },
    ],
    жилищная: [
      { value: "улучшение условий", label: "Улучшение жилищных условий" },
      { value: "ремонт", label: "Помощь в ремонте" },
      { value: "коммунальные услуги", label: "Льготы по коммунальным услугам" },
    ],
    благотворительность: [
      { value: "денежная помощь", label: "Денежная помощь" },
      { value: "сбор средств", label: "Сбор средств" },
      { value: "волонтерская помощь", label: "Волонтерская помощь" },
    ],
  }

  const statusOptions = [
    { value: "в обработке", label: "В обработке" },
    { value: "одобрено", label: "Одобрено" },
    { value: "отказано", label: "Отказано" },
    { value: "выполнено", label: "Выполнено" },
    { value: "обследование", label: "Обследование" },
  ]

  const handleAddMeasure = () => {
    if (!newMeasure.type || !newMeasure.category) return

    const updatedMeasures = [
      ...supportMeasures,
      {
        ...newMeasure,
        chronology: [
          {
            date: new Date().toISOString(),
            action: `Создана заявка на ${getTypeLabel(newMeasure.type, newMeasure.category)}`,
            status: "в обработке",
          },
        ],
      },
    ]

    setSupportMeasures(updatedMeasures)

    const updatedFamily = {
      ...family,
      supportMeasures: updatedMeasures,
    }

    updateFamily(updatedFamily)
    onUpdate()

    setNewMeasure({
      id: Date.now().toString(),
      type: "",
      category: "",
      status: "в обработке",
      dateRequested: new Date().toISOString(),
      dateProvided: "",
      notes: "",
      chronology: [],
    })
  }

  const handleUpdateStatus = (id: string, newStatus: string) => {
    const updatedMeasures = supportMeasures.map((measure) => {
      if (measure.id === id) {
        const updatedMeasure = {
          ...measure,
          status: newStatus,
          chronology: [
            ...(measure.chronology || []),
            {
              date: new Date().toISOString(),
              action: `Статус изменен на "${statusOptions.find((s) => s.value === newStatus)?.label}"`,
              status: newStatus,
            },
          ],
        }

        if (newStatus === "выполнено" && !measure.dateProvided) {
          updatedMeasure.dateProvided = new Date().toISOString()
        }

        return updatedMeasure
      }
      return measure
    })

    setSupportMeasures(updatedMeasures)

    const updatedFamily = {
      ...family,
      supportMeasures: updatedMeasures,
    }

    updateFamily(updatedFamily)
    onUpdate()
  }

  const handleUpdateNotes = (id: string, notes: string) => {
    const updatedMeasures = supportMeasures.map((measure) => {
      if (measure.id === id) {
        return {
          ...measure,
          notes,
          chronology: [
            ...(measure.chronology || []),
            {
              date: new Date().toISOString(),
              action: "Обновлены примечания",
              status: measure.status,
            },
          ],
        }
      }
      return measure
    })

    setSupportMeasures(updatedMeasures)

    const updatedFamily = {
      ...family,
      supportMeasures: updatedMeasures,
    }

    updateFamily(updatedFamily)
    onUpdate()
  }

  const getTypeLabel = (type: string, category: string) => {
    const categoryTypes = supportTypes[category] || []
    const typeObj = categoryTypes.find((t) => t.value === type)
    return typeObj ? typeObj.label : type
  }

  const getCategoryLabel = (category: string) => {
    const categoryObj = supportCategories.find((c) => c.value === category)
    return categoryObj ? categoryObj.label : category
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case "одобрено":
        return "bg-green-100 text-green-800"
      case "отказано":
        return "bg-red-100 text-red-800"
      case "выполнено":
        return "bg-blue-100 text-blue-800"
      case "обследование":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Не указано"
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Добавить меру поддержки</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="category">Категория поддержки</Label>
              <Select
                value={newMeasure.category}
                onValueChange={(value) => setNewMeasure({ ...newMeasure, category: value, type: "" })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {supportCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Тип поддержки</Label>
              <Select
                value={newMeasure.type}
                onValueChange={(value) => setNewMeasure({ ...newMeasure, type: value })}
                disabled={!newMeasure.category}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  {newMeasure.category &&
                    supportTypes[newMeasure.category]?.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-4">
            <Label htmlFor="notes">Примечания</Label>
            <Textarea
              id="notes"
              value={newMeasure.notes}
              onChange={(e) => setNewMeasure({ ...newMeasure, notes: e.target.value })}
              placeholder="Дополнительная информация"
              className="min-h-[80px]"
            />
          </div>

          <Button onClick={handleAddMeasure} disabled={!newMeasure.type || !newMeasure.category}>
            Добавить
          </Button>
        </CardContent>
      </Card>

      {supportMeasures.length > 0 ? (
        <div className="space-y-4">
          {supportMeasures.map((measure) => (
            <Card key={measure.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <CardTitle className="text-lg">{getTypeLabel(measure.type, measure.category)}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{getCategoryLabel(measure.category)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(measure.status)}`}>
                      {statusOptions.find((s) => s.value === measure.status)?.label || measure.status}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Дата запроса</p>
                    <p>{formatDate(measure.dateRequested)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Дата предоставления</p>
                    <p>{measure.dateProvided ? formatDate(measure.dateProvided) : "Не предоставлено"}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <Label htmlFor={`status-${measure.id}`}>Статус</Label>
                  <Select value={measure.status} onValueChange={(value) => handleUpdateStatus(measure.id, value)}>
                    <SelectTrigger id={`status-${measure.id}`}>
                      <SelectValue />
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

                <div className="mb-4">
                  <Label htmlFor={`notes-${measure.id}`}>Примечания</Label>
                  <Textarea
                    id={`notes-${measure.id}`}
                    value={measure.notes}
                    onChange={(e) => handleUpdateNotes(measure.id, e.target.value)}
                    placeholder="Дополнительная информация"
                    className="min-h-[80px]"
                  />
                </div>

                {measure.chronology && measure.chronology.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Хронология</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-md">
                      {measure.chronology.map((event, index) => (
                        <div key={index} className="text-sm border-l-2 border-gray-300 pl-3 py-1">
                          <p className="text-gray-500 text-xs">{formatDate(event.date)}</p>
                          <p>{event.action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-6 text-center text-gray-500">Меры поддержки не добавлены</CardContent>
        </Card>
      )}
    </div>
  )
}
