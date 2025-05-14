"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Printer } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { UserRole } from "@/types/roles"
import type { FamilyMember } from "@/types/models"
import { FamilyService } from "@/services/family-service"

export default function FamilyMemberPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const role = (searchParams.get("role") as UserRole) || "admin"
  const familyId = searchParams.get("familyId") || "1"
  const router = useRouter()
  const { toast } = useToast()
  const [member, setMember] = useState<FamilyMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<FamilyMember>>({})

  useEffect(() => {
    // Получаем данные члена семьи из сервиса
    try {
      const memberData = FamilyService.getFamilyMemberById(Number.parseInt(params.id))

      if (memberData) {
        setMember(memberData)
        setFormData(memberData)
      } else {
        // Если член семьи не найден, пробуем получить из временного хранилища
        try {
          const selectedMember = localStorage.getItem("selectedFamilyMember")
          if (selectedMember) {
            const parsedMember = JSON.parse(selectedMember)
            setMember(parsedMember)
            setFormData(parsedMember)
          }
        } catch (error) {
          console.error("Ошибка при получении данных из localStorage:", error)
        }
      }
    } catch (error) {
      console.error("Ошибка при загрузке данных члена семьи:", error)
    }

    setLoading(false)
  }, [params.id])

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
    if (member && formData) {
      try {
        // Обновляем члена семьи в localStorage
        const updatedMember = FamilyService.updateFamilyMember(member.id, formData)

        if (updatedMember) {
          setMember(updatedMember)
          setIsEditing(false)
          toast({
            title: "Изменения сохранены",
            description: "Данные члена семьи успешно обновлены",
          })
        } else {
          toast({
            title: "Ошибка",
            description: "Не удалось сохранить изменения",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Ошибка при сохранении данных:", error)
        toast({
          title: "Ошибка",
          description: "Произошла ошибка при сохранении данных",
          variant: "destructive",
        })
      }
    }
  }

  const handlePrint = () => {
    toast({
      title: "Печать",
      description: "Документ отправлен на печать",
    })
  }

  if (loading) {
    return (
      <DashboardLayout role={role}>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <p>Загрузка данных...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!member) {
    return (
      <DashboardLayout role={role}>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <p>Член семьи не найден</p>
          <Button onClick={() => router.back()}>Вернуться назад</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role={role}>
      <div className="flex-1 space-y-4 p-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">{member.name}</h2>
            <Badge className="ml-2">{member.status}</Badge>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Печать
            </Button>
            {isEditing ? (
              <Button size="sm" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Сохранить
              </Button>
            ) : (
              <Button size="sm" onClick={() => setIsEditing(true)}>
                Редактировать
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="general">Основная информация</TabsTrigger>
            {member.status === "Школьник" && <TabsTrigger value="school">Школа</TabsTrigger>}
            {member.status === "Студент" && <TabsTrigger value="education">Образование</TabsTrigger>}
            {member.status === "Дошкольник" && <TabsTrigger value="preschool">Дошкольное учреждение</TabsTrigger>}
            <TabsTrigger value="health">Здоровье</TabsTrigger>
            <TabsTrigger value="documents">Документы</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">ФИО</Label>
                    <Input id="name" value={formData?.name || ""} onChange={handleInputChange} readOnly={!isEditing} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="iin">ИИН</Label>
                    <Input id="iin" value={formData?.iin || ""} onChange={handleInputChange} readOnly={!isEditing} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="relation">Родственная связь</Label>
                    {isEditing ? (
                      <Select
                        value={formData?.relation}
                        onValueChange={(value) => handleSelectChange("relation", value)}
                      >
                        <SelectTrigger id="relation">
                          <SelectValue placeholder="Выберите связь" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Мать">Мать</SelectItem>
                          <SelectItem value="Отец">Отец</SelectItem>
                          <SelectItem value="Сын">Сын</SelectItem>
                          <SelectItem value="Дочь">Дочь</SelectItem>
                          <SelectItem value="Бабушка">Бабушка</SelectItem>
                          <SelectItem value="Дедушка">Дедушка</SelectItem>
                          <SelectItem value="Опекун">Опекун</SelectItem>
                          <SelectItem value="Другое">Другое</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input value={formData?.relation} readOnly />
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="age">Возраст</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData?.age}
                      onChange={handleNumberChange}
                      readOnly={!isEditing}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Статус</Label>
                    {isEditing ? (
                      <Select value={formData?.status} onValueChange={(value) => handleSelectChange("status", value)}>
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Выберите статус" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Взрослый">Взрослый</SelectItem>
                          <SelectItem value="Студент">Студент</SelectItem>
                          <SelectItem value="Школьник">Школьник</SelectItem>
                          <SelectItem value="Дошкольник">Дошкольник</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input value={formData?.status} readOnly />
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Примечания</Label>
                  <Textarea
                    id="notes"
                    value={formData?.notes || ""}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    placeholder="Дополнительная информация о члене семьи"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="registrationAddress">Адрес прописки</Label>
                  <Input
                    id="registrationAddress"
                    value={formData?.registrationAddress || ""}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    placeholder="Адрес прописки"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {member.status === "Школьник" && (
            <TabsContent value="school" className="space-y-4 animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Информация о школе</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="school">Школа</Label>
                      <Input
                        id="school"
                        value={formData?.school || ""}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                        placeholder="Например: СОШ №25"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="grade">Класс</Label>
                      <Input
                        id="grade"
                        value={formData?.grade || ""}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                        placeholder="Например: 6"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Дополнительные параметры</Label>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="freeTextbooks"
                          checked={formData?.freeTextbooks || false}
                          onCheckedChange={(checked) => handleCheckboxChange("freeTextbooks", checked as boolean)}
                          disabled={!isEditing}
                        />
                        <Label htmlFor="freeTextbooks" className="font-normal">
                          Бесплатные учебники
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="freeMeals"
                          checked={formData?.freeMeals || false}
                          onCheckedChange={(checked) => handleCheckboxChange("freeMeals", checked as boolean)}
                          disabled={!isEditing}
                        />
                        <Label htmlFor="freeMeals" className="font-normal">
                          Бесплатное питание
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="needsSupport"
                          checked={formData?.needsSupport || false}
                          onCheckedChange={(checked) => handleCheckboxChange("needsSupport", checked as boolean)}
                          disabled={!isEditing}
                        />
                        <Label htmlFor="needsSupport" className="font-normal">
                          Требуется дополнительная поддержка
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {member.status === "Студент" && (
            <TabsContent value="education" className="space-y-4 animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Информация об образовании</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="institution">Учебное заведение</Label>
                      <Input
                        id="institution"
                        value={formData?.institution || ""}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                        placeholder="Например: КазНУ"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="course">Курс</Label>
                      <Input
                        id="course"
                        value={formData?.course || ""}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                        placeholder="Например: 2"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="funding">Форма обучения</Label>
                      {isEditing ? (
                        <Select
                          value={formData?.funding || "budget"}
                          onValueChange={(value) => handleSelectChange("funding", value)}
                        >
                          <SelectTrigger id="funding">
                            <SelectValue placeholder="Выберите форму обучения" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="budget">Бюджет</SelectItem>
                            <SelectItem value="paid">Платное</SelectItem>
                            <SelectItem value="grant">Грант</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={
                            formData?.funding === "budget"
                              ? "Бюджет"
                              : formData?.funding === "paid"
                                ? "Платное"
                                : formData?.funding === "grant"
                                  ? "Грант"
                                  : formData?.funding || ""
                          }
                          readOnly
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {member.status === "Дошкольник" && (
            <TabsContent value="preschool" className="space-y-4 animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Информация о дошкольном учреждении</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="preschool">Дошкольное учреждение</Label>
                      <Input
                        id="preschool"
                        value={formData?.preschool || ""}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                        placeholder="Например: Детский сад №10"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="meals">Питание</Label>
                      {isEditing ? (
                        <Select
                          value={formData?.meals || "free"}
                          onValueChange={(value) => handleSelectChange("meals", value)}
                        >
                          <SelectTrigger id="meals">
                            <SelectValue placeholder="Выберите тип питания" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Бесплатное</SelectItem>
                            <SelectItem value="paid">Платное</SelectItem>
                            <SelectItem value="none">Не получает</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={
                            formData?.meals === "free"
                              ? "Бесплатное"
                              : formData?.meals === "paid"
                                ? "Платное"
                                : formData?.meals === "none"
                                  ? "Не получает"
                                  : formData?.meals || ""
                          }
                          readOnly
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Дополнительные параметры</Label>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="needsKindergarten"
                          checked={formData?.needsKindergarten || false}
                          onCheckedChange={(checked) => handleCheckboxChange("needsKindergarten", checked as boolean)}
                          disabled={!isEditing}
                        />
                        <Label htmlFor="needsKindergarten" className="font-normal">
                          Требуется место в детском саду
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="specialNeeds"
                          checked={formData?.specialNeeds || false}
                          onCheckedChange={(checked) => handleCheckboxChange("specialNeeds", checked as boolean)}
                          disabled={!isEditing}
                        />
                        <Label htmlFor="specialNeeds" className="font-normal">
                          Особые потребности
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="health" className="space-y-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Информация о здоровье</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Статус здоровья</Label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasDisability"
                        checked={formData?.hasDisability || false}
                        onCheckedChange={(checked) => handleCheckboxChange("hasDisability", checked as boolean)}
                        disabled={!isEditing}
                      />
                      <Label htmlFor="hasDisability" className="font-normal">
                        Имеет инвалидность
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="chronicIllness"
                        checked={formData?.chronicIllness || false}
                        onCheckedChange={(checked) => handleCheckboxChange("chronicIllness", checked as boolean)}
                        disabled={!isEditing}
                      />
                      <Label htmlFor="chronicIllness" className="font-normal">
                        Хронические заболевания
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="needsMedicalCare"
                        checked={formData?.needsMedicalCare || false}
                        onCheckedChange={(checked) => handleCheckboxChange("needsMedicalCare", checked as boolean)}
                        disabled={!isEditing}
                      />
                      <Label htmlFor="needsMedicalCare" className="font-normal">
                        Требуется медицинская помощь
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="medicalNotes">Медицинские примечания</Label>
                  <Textarea
                    id="medicalNotes"
                    value={formData?.medicalNotes || ""}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    placeholder="Дополнительная информация о здоровье"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {member.status === "Взрослый" && (
            <TabsContent value="documents" className="space-y-4 animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Удостоверение личности</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="idCardNumber">Номер удостоверения</Label>
                      <Input
                        id="idCardNumber"
                        value={formData?.idCardNumber || ""}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="idCardIssueDate">Дата выдачи</Label>
                      <Input
                        id="idCardIssueDate"
                        value={formData?.idCardIssueDate || ""}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                        placeholder="ДД.ММ.ГГГГ"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="idCardExpiryDate">Дата окончания</Label>
                      <Input
                        id="idCardExpiryDate"
                        value={formData?.idCardExpiryDate || ""}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                        placeholder="ДД.ММ.ГГГГ"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="idCardNotes">Примечания</Label>
                      <Input
                        id="idCardNotes"
                        value={formData?.idCardNotes || ""}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                        placeholder="Например: утеряно, сгорело и т.д."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="documents" className="space-y-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Документы</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Здесь будут отображаться документы, связанные с данным членом семьи.
                </p>
                <Button variant="outline">Добавить документ</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
