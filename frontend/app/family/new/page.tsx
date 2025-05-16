"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { type UserRole, roleConfigs } from "@/types/roles"

interface FamilyFormData {
  caseNumber: string
  familyName: string
  address: string
  region: string
  district: string
  city: string
  status: string
  riskLevel: string
  riskFactors: string[]
  registrationDate: string
  notes: string
  contactPhone: string
  contactEmail: string
  housingType: string
  incomeSource: string
  monthlyIncome: number
  socialBenefits: string[]
  referralSource: string
  primaryLanguage: string
  hasInterpreterNeeded: boolean
  familyType: string
  employment: string
  workplace: string
  needsSupport: boolean
  needsEducation: boolean
  needsHealth: boolean
  needsPolice: boolean
}

export default function NewFamilyPage() {
  const searchParams = useSearchParams()
  const role = (searchParams.get("role") as UserRole) || "admin"
  const router = useRouter()
  const { toast } = useToast()
  const roleConfig = roleConfigs[role]

  const [formData, setFormData] = useState<FamilyFormData>({
    caseNumber: "",
    familyName: "Иванов Иван Иванович",
    address: "г. Павлодар, ул. Ленина, д. 10, кв. 5",
    region: "",
    district: "",
    city: "",
    status: "ТЖС",
    riskLevel: "low",
    riskFactors: [],
    registrationDate: new Date().toISOString().split("T")[0],
    notes: "Семья нуждается в социальной поддержке",
    contactPhone: "",
    contactEmail: "",
    housingType: "apartment",
    incomeSource: "",
    monthlyIncome: 0,
    socialBenefits: [],
    referralSource: "",
    primaryLanguage: "",
    hasInterpreterNeeded: false,
    familyType: "full",
    employment: "employed",
    workplace: "ТОО 'Компания', менеджер",
    needsSupport: true,
    needsEducation: false,
    needsHealth: false,
    needsPolice: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleArrayInputChange = (name: string, value: string) => {
    setFormData((prev) => {
      const values = value.split(",").map((item) => item.trim()).filter(Boolean)
      return { ...prev, [name]: values }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("http://localhost:5555/api/families", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          caseNumber: formData.caseNumber,
          familyName: formData.familyName,
          address: formData.address,
          region: formData.region,
          district: formData.district,
          city: formData.city,
          status: formData.status,
          riskLevel: formData.riskLevel,
          riskFactors: formData.riskFactors,
          registrationDate: new Date(formData.registrationDate).toISOString(),
          notes: formData.notes,
          contactPhone: formData.contactPhone,
          contactEmail: formData.contactEmail,
          housingType: formData.housingType,
          incomeSource: formData.incomeSource,
          monthlyIncome: Number(formData.monthlyIncome),
          socialBenefits: formData.socialBenefits,
          referralSource: formData.referralSource,
          primaryLanguage: formData.primaryLanguage,
          hasInterpreterNeeded: formData.hasInterpreterNeeded,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create family")
      }

      toast({
        title: "Семья добавлена",
        description: "Новая семья успешно добавлена в базу данных",
      })
      router.push(`/families?role=${role}`)
    } catch (error: any) {
      console.error("Error creating family:", error)
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать семью",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
                    <Label htmlFor="caseNumber">Номер дела</Label>
                    <Input
                      id="caseNumber"
                      name="caseNumber"
                      value={formData.caseNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="familyName">ФИО семьи</Label>
                    <Input
                      id="familyName"
                      name="familyName"
                      value={formData.familyName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Адрес проживания</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
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
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="district">Район</Label>
                    <Input
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="city">Город</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="status">Статус</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleSelectChange("status", value)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Выберите статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ТЖС">ТЖС</SelectItem>
                        <SelectItem value="Неблагополучная">Неблагополучная</SelectItem>
                        <SelectItem value="ТЖС, Н/Б">ТЖС и Неблагополучная</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="familyType">Тип семьи</Label>
                    <Select
                      value={formData.familyType}
                      onValueChange={(value) => handleSelectChange("familyType", value)}
                    >
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
                    <Label htmlFor="riskLevel">Уровень риска</Label>
                    <Select
                      value={formData.riskLevel}
                      onValueChange={(value) => handleSelectChange("riskLevel", value)}
                    >
                      <SelectTrigger id="riskLevel">
                        <SelectValue placeholder="Выберите уровень" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Низкий</SelectItem>
                        <SelectItem value="medium">Средний</SelectItem>
                        <SelectItem value="high">Высокий</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="employment">Занятость родителей</Label>
                    <Select
                      value={formData.employment}
                      onValueChange={(value) => handleSelectChange("employment", value)}
                    >
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
                    <Input
                      id="workplace"
                      name="workplace"
                      value={formData.workplace}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="riskFactors">Факторы риска (через запятую)</Label>
                  <Input
                    id="riskFactors"
                    name="riskFactors"
                    value={formData.riskFactors.join(", ")}
                    onChange={(e) => handleArrayInputChange("riskFactors", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="socialBenefits">Социальные выплаты (через запятую)</Label>
                  <Input
                    id="socialBenefits"
                    name="socialBenefits"
                    value={formData.socialBenefits.join(", ")}
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
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="housingType">Тип жилья</Label>
                    <Select
                      value={formData.housingType}
                      onValueChange={(value) => handleSelectChange("housingType", value)}
                    >
                      <SelectTrigger id="housingType">
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Квартира</SelectItem>
                        <SelectItem value="house">Дом</SelectItem>
                        <SelectItem value="rented">Арендованное</SelectItem>
                        <SelectItem value="temporary">Временное</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="monthlyIncome">Месячный доход</Label>
                    <Input
                      id="monthlyIncome"
                      name="monthlyIncome"
                      type="number"
                      value={formData.monthlyIncome}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="incomeSource">Источник дохода</Label>
                  <Input
                    id="incomeSource"
                    name="incomeSource"
                    value={formData.incomeSource}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="referralSource">Источник направления</Label>
                  <Input
                    id="referralSource"
                    name="referralSource"
                    value={formData.referralSource}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="primaryLanguage">Основной язык</Label>
                  <Input
                    id="primaryLanguage"
                    name="primaryLanguage"
                    value={formData.primaryLanguage}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Дополнительные параметры</Label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="needsSupport"
                        checked={formData.needsSupport}
                        onCheckedChange={(checked) => handleCheckboxChange("needsSupport", checked as boolean)}
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
                      />
                      <Label htmlFor="needsPolice" className="font-normal">
                        Требуется внимание правоохранительных органов
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasInterpreterNeeded"
                        checked={formData.hasInterpreterNeeded}
                        onCheckedChange={(checked) => handleCheckboxChange("hasInterpreterNeeded", checked as boolean)}
                      />
                      <Label htmlFor="hasInterpreterNeeded" className="font-normal">
                        Требуется переводчик
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Примечания</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => router.back()}>
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}