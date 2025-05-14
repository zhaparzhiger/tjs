"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/date-picker"
import { PlusCircle, Edit, Trash2, AlertCircle, CheckCircle2, Clock, FileText, History } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { UserRole } from "@/types/roles"
import { FamilyService } from "@/services/family-service"
import type { SupportMeasure } from "@/types/models"
import { useIsMobile } from "@/hooks/use-mobile"

interface FamilySupportExtendedProps {
  family: any
  role: UserRole
}

export function FamilySupportExtended({ family, role }: FamilySupportExtendedProps) {
  const { toast } = useToast()
  const [isAddSupportOpen, setIsAddSupportOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [supportType, setSupportType] = useState("social")
  const [activeTab, setActiveTab] = useState("social")

  // Данные о социальной поддержке
  const [socialSupport, setSocialSupport] = useState<SupportMeasure[]>(() => {
    // Получаем меры поддержки из localStorage
    const allSupport = FamilyService.getFamilySupport(family.id)
    return allSupport.filter((s) => s.category === "social") || []
  })

  const [educationSupport, setEducationSupport] = useState<SupportMeasure[]>(() => {
    // Получаем меры поддержки из localStorage
    const allSupport = FamilyService.getFamilySupport(family.id)
    return allSupport.filter((s) => s.category === "education") || []
  })

  const [healthSupport, setHealthSupport] = useState<SupportMeasure[]>(() => {
    // Получаем меры поддержки из localStorage
    const allSupport = FamilyService.getFamilySupport(family.id)
    return allSupport.filter((s) => s.category === "health") || []
  })

  const [policeSupport, setPoliceSupport] = useState<SupportMeasure[]>(() => {
    // Получаем меры поддержки из localStorage
    const allSupport = FamilyService.getFamilySupport(family.id)
    return allSupport.filter((s) => s.category === "police") || []
  })

  const [legalMeasures, setLegalMeasures] = useState<SupportMeasure[]>(() => {
    // Получаем меры поддержки из localStorage
    const allSupport = FamilyService.getFamilySupport(family.id)
    return allSupport.filter((s) => s.category === "legal") || []
  })

  const [charitySupport, setCharitySupport] = useState<SupportMeasure[]>(() => {
    // Получаем меры поддержки из localStorage
    const allSupport = FamilyService.getFamilySupport(family.id)
    return allSupport.filter((s) => s.category === "charity") || []
  })

  // История мер поддержки
  const [supportHistory, setSupportHistory] = useState<SupportMeasure[]>([
    {
      id: 101,
      familyId: family.id,
      category: "social",
      type: "АСП",
      amount: "45",
      date: "15.01.2023",
      status: "Оказано",
      notes: "Ежемесячная выплата",
      createdAt: "15.01.2023",
      createdBy: "Иванов И.И.",
    },
    {
      id: 102,
      familyId: family.id,
      category: "education",
      type: "Всеобуч",
      amount: "25",
      date: "20.02.2023",
      status: "Оказано",
      notes: "Школьные принадлежности",
      createdAt: "20.02.2023",
      createdBy: "Петров П.П.",
    },
    {
      id: 103,
      familyId: family.id,
      category: "health",
      type: "Прикрепление к медучреждению",
      amount: "0",
      date: "10.03.2023",
      status: "Оказано",
      notes: "Поликлиника №2",
      createdAt: "10.03.2023",
      createdBy: "Сидоров С.С.",
    },
  ])

  const handleAddSupport = (e: React.FormEvent) => {
    e.preventDefault()

    // Получаем данные из формы
    const form = e.target as HTMLFormElement
    const type = (form.querySelector("#supportType") as HTMLSelectElement).value
    const amount = (form.querySelector("#amount") as HTMLInputElement).value
    const status = (form.querySelector("#status") as HTMLSelectElement).value
    const notes = (form.querySelector("#notes") as HTMLTextAreaElement)?.value || ""

    // Создаем новую меру поддержки
    const measure: Omit<SupportMeasure, "id" | "createdAt"> = {
      familyId: family.id,
      category: supportType,
      type,
      amount,
      date: new Date().toLocaleDateString("ru-RU"),
      status: status === "provided" ? "Оказано" : status === "in-progress" ? "В процессе" : "Отказано",
      notes,
      createdBy: "Текущий пользователь",
    }

    // Сохраняем меру поддержки в localStorage
    const newMeasure = FamilyService.addSupportMeasure(measure, "Текущий пользователь")

    // Обновляем соответствующий список мер поддержки
    if (supportType === "social") {
      setSocialSupport([...socialSupport, newMeasure])
    } else if (supportType === "education") {
      setEducationSupport([...educationSupport, newMeasure])
    } else if (supportType === "health") {
      setHealthSupport([...healthSupport, newMeasure])
    } else if (supportType === "police") {
      setPoliceSupport([...policeSupport, newMeasure])
    } else if (supportType === "legal") {
      setLegalMeasures([...legalMeasures, newMeasure])
    } else if (supportType === "charity") {
      setCharitySupport([...charitySupport, newMeasure])
    }

    setIsAddSupportOpen(false)
    toast({
      title: "Мера поддержки добавлена",
      description: "Новая мера поддержки успешно добавлена",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Оказано":
        return (
          <Badge className="bg-green-600 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Оказано
          </Badge>
        )
      case "В процессе":
        return (
          <Badge className="bg-yellow-600 flex items-center gap-1">
            <Clock className="h-3 w-3" />В процессе
          </Badge>
        )
      case "Отказано":
        return (
          <Badge className="bg-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Отказано
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Проверка доступа к функциям в зависимости от роли
  const canEditSocial = ["admin", "district", "social"].includes(role)
  const canEditEducation = ["admin", "district", "school"].includes(role)
  const canEditHealth = ["admin", "district", "health"].includes(role)
  const canEditPolice = ["admin", "district", "police"].includes(role)
  const canEditLegal = ["admin", "district", "police"].includes(role)
  const canEditCharity = ["admin", "district", "social"].includes(role)

  const renderSupportTable = (supports: SupportMeasure[], canEdit: boolean) => {
    if (supports.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FileText className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium">Меры поддержки не найдены</h3>
          <p className="text-sm text-gray-500 mt-1">
            Добавьте новую меру поддержки, нажав на кнопку «Добавить меру поддержки»
          </p>
        </div>
      )
    }

    return (
      <>
        {/* Десктопная версия таблицы */}
        <div className="rounded-md border desktop-support-table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Тип поддержки</TableHead>
                <TableHead>Сумма (тыс. тенге)</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supports.map((support) => (
                <TableRow key={support.id}>
                  <TableCell className="font-medium">{support.type}</TableCell>
                  <TableCell>{support.amount}</TableCell>
                  <TableCell>{support.date}</TableCell>
                  <TableCell>{getStatusBadge(support.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" disabled={!canEdit}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" disabled={!canEdit}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Мобильная версия в виде карточек */}
        <div className="mobile-support-cards">
          {supports.map((support) => (
            <div key={support.id} className="mobile-table-card">
              <div className="mobile-table-card-header">
                <div className="mobile-table-card-title">{support.type}</div>
                {getStatusBadge(support.status)}
              </div>
              <div className="mobile-table-card-row">
                <div className="mobile-table-card-label">Сумма:</div>
                <div className="mobile-table-card-value">{support.amount} тыс. тенге</div>
              </div>
              <div className="mobile-table-card-row">
                <div className="mobile-table-card-label">Дата:</div>
                <div className="mobile-table-card-value">{support.date}</div>
              </div>
              {support.notes && (
                <div className="mobile-table-card-row">
                  <div className="mobile-table-card-label">Примечания:</div>
                  <div className="mobile-table-card-value">{support.notes}</div>
                </div>
              )}
              <div className="mobile-table-card-actions">
                <Button variant="outline" size="sm" disabled={!canEdit}>
                  <Edit className="mr-1 h-4 w-4" />
                  Изменить
                </Button>
                <Button variant="outline" size="sm" disabled={!canEdit}>
                  <Trash2 className="mr-1 h-4 w-4" />
                  Удалить
                </Button>
              </div>
            </div>
          ))}
        </div>
      </>
    )
  }

  const isMobile = useIsMobile()

  const handleEditMeasure = (measure: SupportMeasure) => {
    // TODO: Implement edit functionality
    console.log("Edit measure", measure)
  }

  const handleDeleteMeasure = (measureId: number) => {
    // TODO: Implement delete functionality
    console.log("Delete measure", measureId)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Меры поддержки</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => setIsHistoryOpen(true)}>
              <History className="mr-2 h-4 w-4" />
              Хронология
            </Button>
            <Dialog open={isAddSupportOpen} onOpenChange={setIsAddSupportOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Добавить меру поддержки
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить меру поддержки</DialogTitle>
                  <DialogDescription>Заполните информацию о новой мере поддержки</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddSupport}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="supportCategory">Категория</Label>
                      <Select value={supportType} onValueChange={setSupportType}>
                        <SelectTrigger id="supportCategory">
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="social">Социальная защита</SelectItem>
                          <SelectItem value="education">Образование</SelectItem>
                          <SelectItem value="health">Здравоохранение</SelectItem>
                          <SelectItem value="police">Полиция</SelectItem>
                          <SelectItem value="legal">Правовые меры</SelectItem>
                          <SelectItem value="charity">Благотворительность</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="supportType">Тип поддержки</Label>
                      <Select>
                        <SelectTrigger id="supportType">
                          <SelectValue placeholder="Выберите тип" />
                        </SelectTrigger>
                        <SelectContent>
                          {supportType === "social" && (
                            <>
                              <SelectItem value="asp">АСП</SelectItem>
                              <SelectItem value="zhp">ЖП</SelectItem>
                              <SelectItem value="one-time">Единовременная помощь</SelectItem>
                              <SelectItem value="fuel">Социальная помощь на топливо</SelectItem>
                              <SelectItem value="charity">Благотворительная помощь</SelectItem>
                              <SelectItem value="employment">Трудоустройство</SelectItem>
                              <SelectItem value="ssu">ССУ</SelectItem>
                            </>
                          )}
                          {supportType === "education" && (
                            <>
                              <SelectItem value="vseobuch">Всеобуч</SelectItem>
                              <SelectItem value="psychology">Психологическая консультация</SelectItem>
                              <SelectItem value="kindergarten">Постановка на очередь в ДДУ</SelectItem>
                              <SelectItem value="school">Оформление в СОШ</SelectItem>
                            </>
                          )}
                          {supportType === "health" && (
                            <>
                              <SelectItem value="attachment">Прикрепление к медучреждению</SelectItem>
                              <SelectItem value="disability">Установление инвалидности</SelectItem>
                              <SelectItem value="treatment">Оказание лечения</SelectItem>
                              <SelectItem value="ambulatory">Амбулаторное лечение</SelectItem>
                              <SelectItem value="stationary">Стационарное лечение</SelectItem>
                              <SelectItem value="medical-facility">
                                Определение в медучреждение (реабилитационный центр, хоспис и т.д.)
                              </SelectItem>
                            </>
                          )}
                          {supportType === "police" && (
                            <>
                              <SelectItem value="prevention">Профилактическая беседа</SelectItem>
                              <SelectItem value="registration">Постановка на учет в ОВД</SelectItem>
                              <SelectItem value="involvement-act">Акт привлечения</SelectItem>
                            </>
                          )}
                          {supportType === "legal" && (
                            <>
                              <SelectItem value="restrictions">Приняты ограничения в родительских правах</SelectItem>
                              <SelectItem value="deprivation">Принято решение о лишении родительских прав</SelectItem>
                              <SelectItem value="kdn">Рассмотрение на КДН</SelectItem>
                            </>
                          )}
                          {supportType === "charity" && (
                            <>
                              <SelectItem value="financial">Финансовая помощь</SelectItem>
                              <SelectItem value="material">Материальная помощь</SelectItem>
                              <SelectItem value="clothing">Одежда и обувь</SelectItem>
                              <SelectItem value="food">Продукты питания</SelectItem>
                              <SelectItem value="school-supplies">Школьные принадлежности</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="amount">Сумма (тыс. тенге)</Label>
                      <Input id="amount" type="text" />
                    </div>

                    <div className="grid gap-2">
                      <Label>Дата оказания</Label>
                      <DatePicker />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="status">Статус</Label>
                      <Select defaultValue="provided">
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Выберите статус" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="provided">Оказано</SelectItem>
                          <SelectItem value="in-progress">В процессе</SelectItem>
                          <SelectItem value="rejected">Отказано</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="notes">Примечания</Label>
                      <Textarea id="notes" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Добавить</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="social" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
          <div className="scrollable-tabs-container">
            <TabsList className="scrollable-tabs-list">
              <TabsTrigger value="social" className="scrollable-tab">
                Социальная защита
              </TabsTrigger>
              <TabsTrigger value="education" className="scrollable-tab">
                Образование
              </TabsTrigger>
              <TabsTrigger value="health" className="scrollable-tab">
                Здравоохранение
              </TabsTrigger>
              <TabsTrigger value="police" className="scrollable-tab">
                Полиция
              </TabsTrigger>
              <TabsTrigger value="legal" className="scrollable-tab">
                Правовые меры
              </TabsTrigger>
              <TabsTrigger value="charity" className="scrollable-tab">
                Благотворительность
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="social">
            {isMobile ? (
              <div className="space-y-4">
                {socialSupport.map((measure, index) => (
                  <div key={index} className="support-card">
                    <div className="support-card-header">{measure.type}</div>
                    <div className="support-card-content">
                      <div className="support-card-item">
                        <span className="support-card-label">Дата:</span>
                        <span className="support-card-value">{measure.date}</span>
                      </div>
                      <div className="support-card-item">
                        <span className="support-card-label">Статус:</span>
                        <span className="support-card-value">{measure.status}</span>
                      </div>
                      <div className="support-card-item">
                        <span className="support-card-label">Сумма:</span>
                        <span className="support-card-value">{measure.amount} тыс. тенге</span>
                      </div>
                    </div>
                    <div className="support-card-actions">
                      <Button variant="outline" size="sm" onClick={() => handleEditMeasure(measure)}>
                        Изменить
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteMeasure(measure.id)}>
                        Удалить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              renderSupportTable(socialSupport, canEditSocial)
            )}
          </TabsContent>

          <TabsContent value="education">
            {isMobile ? (
              <div className="space-y-4">
                {educationSupport.map((measure, index) => (
                  <div key={index} className="support-card">
                    <div className="support-card-header">{measure.type}</div>
                    <div className="support-card-content">
                      <div className="support-card-item">
                        <span className="support-card-label">Дата:</span>
                        <span className="support-card-value">{measure.date}</span>
                      </div>
                      <div className="support-card-item">
                        <span className="support-card-label">Статус:</span>
                        <span className="support-card-value">{measure.status}</span>
                      </div>
                      <div className="support-card-item">
                        <span className="support-card-label">Сумма:</span>
                        <span className="support-card-value">{measure.amount} тыс. тенге</span>
                      </div>
                    </div>
                    <div className="support-card-actions">
                      <Button variant="outline" size="sm" onClick={() => handleEditMeasure(measure)}>
                        Изменить
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteMeasure(measure.id)}>
                        Удалить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              renderSupportTable(educationSupport, canEditEducation)
            )}
          </TabsContent>

          <TabsContent value="health">
            {isMobile ? (
              <div className="space-y-4">
                {healthSupport.map((measure, index) => (
                  <div key={index} className="support-card">
                    <div className="support-card-header">{measure.type}</div>
                    <div className="support-card-content">
                      <div className="support-card-item">
                        <span className="support-card-label">Дата:</span>
                        <span className="support-card-value">{measure.date}</span>
                      </div>
                      <div className="support-card-item">
                        <span className="support-card-label">Статус:</span>
                        <span className="support-card-value">{measure.status}</span>
                      </div>
                      <div className="support-card-item">
                        <span className="support-card-label">Сумма:</span>
                        <span className="support-card-value">{measure.amount} тыс. тенге</span>
                      </div>
                    </div>
                    <div className="support-card-actions">
                      <Button variant="outline" size="sm" onClick={() => handleEditMeasure(measure)}>
                        Изменить
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteMeasure(measure.id)}>
                        Удалить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              renderSupportTable(healthSupport, canEditHealth)
            )}
          </TabsContent>

          <TabsContent value="police">
            {isMobile ? (
              <div className="space-y-4">
                {policeSupport.map((measure, index) => (
                  <div key={index} className="support-card">
                    <div className="support-card-header">{measure.type}</div>
                    <div className="support-card-content">
                      <div className="support-card-item">
                        <span className="support-card-label">Дата:</span>
                        <span className="support-card-value">{measure.date}</span>
                      </div>
                      <div className="support-card-item">
                        <span className="support-card-label">Статус:</span>
                        <span className="support-card-value">{measure.status}</span>
                      </div>
                      <div className="support-card-item">
                        <span className="support-card-label">Сумма:</span>
                        <span className="support-card-value">{measure.amount} тыс. тенге</span>
                      </div>
                    </div>
                    <div className="support-card-actions">
                      <Button variant="outline" size="sm" onClick={() => handleEditMeasure(measure)}>
                        Изменить
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteMeasure(measure.id)}>
                        Удалить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              renderSupportTable(policeSupport, canEditPolice)
            )}
          </TabsContent>

          <TabsContent value="legal">
            {isMobile ? (
              <div className="space-y-4">
                {legalMeasures.map((measure, index) => (
                  <div key={index} className="support-card">
                    <div className="support-card-header">{measure.type}</div>
                    <div className="support-card-content">
                      <div className="support-card-item">
                        <span className="support-card-label">Дата:</span>
                        <span className="support-card-value">{measure.date}</span>
                      </div>
                      <div className="support-card-item">
                        <span className="support-card-label">Статус:</span>
                        <span className="support-card-value">{measure.status}</span>
                      </div>
                      <div className="support-card-item">
                        <span className="support-card-label">Сумма:</span>
                        <span className="support-card-value">{measure.amount} тыс. тенге</span>
                      </div>
                    </div>
                    <div className="support-card-actions">
                      <Button variant="outline" size="sm" onClick={() => handleEditMeasure(measure)}>
                        Изменить
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteMeasure(measure.id)}>
                        Удалить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              renderSupportTable(legalMeasures, canEditLegal)
            )}
          </TabsContent>

          <TabsContent value="charity">
            {isMobile ? (
              <div className="space-y-4">
                {charitySupport.map((measure, index) => (
                  <div key={index} className="support-card">
                    <div className="support-card-header">{measure.type}</div>
                    <div className="support-card-content">
                      <div className="support-card-item">
                        <span className="support-card-label">Дата:</span>
                        <span className="support-card-value">{measure.date}</span>
                      </div>
                      <div className="support-card-item">
                        <span className="support-card-label">Статус:</span>
                        <span className="support-card-value">{measure.status}</span>
                      </div>
                      <div className="support-card-item">
                        <span className="support-card-label">Сумма:</span>
                        <span className="support-card-value">{measure.amount} тыс. тенге</span>
                      </div>
                    </div>
                    <div className="support-card-actions">
                      <Button variant="outline" size="sm" onClick={() => handleEditMeasure(measure)}>
                        Изменить
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteMeasure(measure.id)}>
                        Удалить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              renderSupportTable(charitySupport, canEditCharity)
            )}
          </TabsContent>
        </Tabs>

        {/* Диалог хронологии мер поддержки */}
        <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Хронология мер поддержки</DialogTitle>
              <DialogDescription>История всех оказанных мер поддержки для данной семьи</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                {supportHistory.map((item, index) => (
                  <div key={item.id} className="relative pl-10 pb-8">
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                      {index + 1}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{item.type}</h4>
                          <p className="text-sm text-gray-500">
                            Категория:{" "}
                            {item.category === "social"
                              ? "Социальная защита"
                              : item.category === "education"
                                ? "Образование"
                                : item.category === "health"
                                  ? "Здравоохранение"
                                  : item.category === "police"
                                    ? "Полиция"
                                    : "Правовые меры"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{item.date}</p>
                          <p className="text-xs text-gray-500">Автор: {item.createdBy}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <p className="text-sm">
                          {item.amount && item.amount !== "0"
                            ? `Сумма: ${item.amount} тыс. тенге`
                            : "Без финансирования"}
                        </p>
                        {getStatusBadge(item.status)}
                      </div>
                      {item.notes && (
                        <p className="mt-2 text-sm text-gray-600 bg-gray-100 p-2 rounded">Примечание: {item.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
