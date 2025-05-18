"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, FileUp, X, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { type UserRole, roleConfigs } from "@/types/roles"
import axios from "axios"

interface FamilyFormData {
  caseNumber: string
  familyName: string
  address: string
  registrationAddress: string
  region: string
  district: string
  city: string
  status: string
  settingReason: string
  riskLevel: string
  riskFactors: string[]
  registrationDate: string
  notes: string
  contactPhone: string
  contactEmail: string
  housingType: string
  incomeSource: string
  familyIncome: number
  socialBenefits: string[]
  referralSource: string
  primaryLanguage: string
  hasInterpreterNeeded: boolean
  familyType: string
  children: number
  employment: string
  workplace: string
  needsSupport: boolean
  needsEducation: boolean
  needsHealth: boolean
  needsPolice: boolean
  hasDisability: boolean
  nbReason: string
  tzhsReason: string
}

interface DocumentFile {
  file: File
  title: string
  type: string
  preview?: string
}

export default function NewFamilyPage() {
  const searchParams = useSearchParams()
  const role = (searchParams.get("role") as UserRole) || "admin"
  const router = useRouter()
  const { toast } = useToast()
  const roleConfig = roleConfigs[role]
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<Partial<FamilyFormData>>({
    caseNumber: "",
    familyName: "",
    address: "",
    registrationAddress: "",
    region: "",
    district: "",
    city: "",
    status: "ТЖС",
    settingReason: "",
    riskLevel: "low",
    riskFactors: [],
    registrationDate: new Date().toISOString().split("T")[0],
    notes: "",
    contactPhone: "",
    contactEmail: "",
    housingType: "",
    incomeSource: "",
    familyIncome: 0,
    socialBenefits: [],
    referralSource: "",
    primaryLanguage: "",
    hasInterpreterNeeded: false,
    familyType: "full",
    children: 0,
    employment: "employed",
    workplace: "",
    needsSupport: false,
    needsEducation: false,
    needsHealth: false,
    needsPolice: false,
    hasDisability: false,
    nbReason: "",
    tzhsReason: "",
  })

  const [riskFactorsInput, setRiskFactorsInput] = useState("")
  const [socialBenefitsInput, setSocialBenefitsInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [documents, setDocuments] = useState<DocumentFile[]>([])
  const [documentTitle, setDocumentTitle] = useState("")
  const [documentType, setDocumentType] = useState("document")

  // Синхронизация строк ввода с formData
  useEffect(() => {
    setRiskFactorsInput(formData.riskFactors?.join(", ") || "")
    setSocialBenefitsInput(formData.socialBenefits?.join(", ") || "")
  }, [formData.riskFactors, formData.socialBenefits])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: Number.parseInt(value) || 0 }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleArrayInputChange = (name: string, value: string) => {
    if (name === "riskFactors") {
      setRiskFactorsInput(value)
    } else if (name === "socialBenefits") {
      setSocialBenefitsInput(value)
    }
  }

  const handleArrayInputBlur = (name: string, value: string) => {
    setFormData((prev) => {
      const values = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
      return { ...prev, [name]: values }
    })
  }

  const handleAddDocument = () => {
    if (fileInputRef.current?.files?.length) {
      const file = fileInputRef.current.files[0]

      if (!documentTitle.trim()) {
        toast({
          title: "Ошибка",
          description: "Введите название документа",
          variant: "destructive",
        })
        return
      }

      // Create preview URL for images
      let preview = undefined
      if (file.type.startsWith("image/")) {
        preview = URL.createObjectURL(file)
      }

      const newDocument: DocumentFile = {
        file,
        title: documentTitle,
        type: documentType,
        preview,
      }

      setDocuments([...documents, newDocument])
      setDocumentTitle("")
      setDocumentType("document")

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveDocument = (index: number) => {
    const updatedDocuments = [...documents]

    // Revoke object URL if it exists to prevent memory leaks
    if (updatedDocuments[index].preview) {
      URL.revokeObjectURL(updatedDocuments[index].preview!)
    }

    updatedDocuments.splice(index, 1)
    setDocuments(updatedDocuments)
  }

  // Map frontend type values to backend display values
  const typeMap: { [key: string]: string } = {
    act: "Акт",
    certificate: "Справка",
    application: "Заявление",
    document: "Документ",
    other: "Другое",
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Перед отправкой обновляем массивы riskFactors и socialBenefits
    const riskFactorsValues = riskFactorsInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
    const socialBenefitsValues = socialBenefitsInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)

    setFormData((prev) => ({
      ...prev,
      riskFactors: riskFactorsValues,
      socialBenefits: socialBenefitsValues,
    }))

    try {
      // First create the family
      const familyData = {
        caseNumber: formData.caseNumber,
        familyName: formData.familyName,
        address: formData.address,
        registrationAddress: formData.registrationAddress,
        region: formData.region,
        district: formData.district,
        city: formData.city,
        status: formData.status,
        settingReason: formData.settingReason,
        riskLevel: formData.riskLevel,
        riskFactors: riskFactorsValues,
        registrationDate: new Date(formData.registrationDate || "").toISOString(),
        notes: formData.notes,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        housingType: formData.housingType,
        incomeSource: formData.incomeSource,
        familyIncome: formData.familyIncome,
        socialBenefits: socialBenefitsValues,
        referralSource: formData.referralSource,
        primaryLanguage: formData.primaryLanguage,
        hasInterpreterNeeded: formData.hasInterpreterNeeded,
        familyType: formData.familyType,
        children: formData.children,
        employment: formData.employment,
        workplace: formData.workplace,
        needsSupport: formData.needsSupport,
        needsEducation: formData.needsEducation,
        needsHealth: formData.needsHealth,
        needsPolice: formData.needsPolice,
        hasDisability: formData.hasDisability,
        nbReason: formData.nbReason,
        tzhsReason: formData.tzhsReason,
      }

      const token = localStorage.getItem("auth_token")
      const response = await axios.post("http://localhost:5555/api/families", familyData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.data || !response.data.family || !response.data.family.id) {
        throw new Error("Failed to create family - no ID returned")
      }

      const familyId = response.data.family.id

      // Then upload each document if there are any
      if (documents.length > 0) {
        const uploadPromises = documents.map((doc) => {
          const formData = new FormData()
          formData.append("file", doc.file)
          formData.append("title", doc.title)
          formData.append("type", typeMap[doc.type] || doc.type)
          formData.append("familyId", familyId)

          return axios.post("http://localhost:5555/api/documents/upload", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          })
        })

        await Promise.all(uploadPromises)
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
                    <Label htmlFor="caseNumber">ИИН</Label>
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

                <div className="grid gap-2">
                  <Label htmlFor="registrationAddress">Адрес прописки</Label>
                  <Textarea
                    id="registrationAddress"
                    name="registrationAddress"
                    value={formData.registrationAddress}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="region">Регион</Label>
                    <Input id="region" name="region" value={formData.region} onChange={handleInputChange} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="district">Район</Label>
                    <Input id="district" name="district" value={formData.district} onChange={handleInputChange} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="city">Город</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="status">Статус</Label>
                    <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Выберите статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ТЖС">ТЖС</SelectItem>
                        <SelectItem value="Неблагополучная">Неблагополучная</SelectItem>
                        <SelectItem value="ТЖС, Неблагополучная">ТЖС и Неблагополучная</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="settingReason">Причина постановки</Label>
                    <Input
                      id="settingReason"
                      name="settingReason"
                      value={formData.settingReason || ""}
                      onChange={handleInputChange}
                      placeholder="Укажите причину постановки на учет"
                    />
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
                  </div>

                  {formData.status?.includes("ТЖС") && (
                    <div className="grid gap-2">
                      <Label htmlFor="tzhsReason">Причина ТЖС</Label>
                      <Select
                        value={formData.tzhsReason || "Малообеспеченность"}
                        onValueChange={(value) => handleSelectChange("tzhsReason", value)}
                      >
                        <SelectTrigger id="tzhsReason">
                          <SelectValue placeholder="Выберите причину" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Малообеспеченность">Малообеспеченность</SelectItem>
                          <SelectItem value="Многодетность">Многодетность</SelectItem>
                          <SelectItem value="Неполная семья">Неполная семья</SelectItem>
                          <SelectItem value="Инвалидность">Инвалидность</SelectItem>
                          <SelectItem value="Сироты">Сироты</SelectItem>
                          <SelectItem value="Другое">Другое</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {formData.status?.includes("Неблагополучная") && (
                    <div className="grid gap-2">
                      <Label htmlFor="nbReason">Причина неблагополучия</Label>
                      <Select
                        value={formData.nbReason || "Алкоголизм"}
                        onValueChange={(value) => handleSelectChange("nbReason", value)}
                      >
                        <SelectTrigger id="nbReason">
                          <SelectValue placeholder="Выберите причину" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Алкоголизм">Алкоголизм</SelectItem>
                          <SelectItem value="Наркомания">Наркомания</SelectItem>
                          <SelectItem value="Насилие в семье">Насилие в семье</SelectItem>
                          <SelectItem value="Пренебрежение нуждами детей">Пренебрежение нуждами детей</SelectItem>
                          <SelectItem value="Криминальное поведение">Криминальное поведение</SelectItem>
                          <SelectItem value="Другое">Другое</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="children">Количество детей</Label>
                    <Input
                      id="children"
                      type="number"
                      onChange={handleNumberChange}
                      value={formData.children}
                      min={0}
                    />
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
                    <Input id="workplace" name="workplace" value={formData.workplace} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="riskFactors">Факторы риска (через запятую)</Label>
                  <Input
                    id="riskFactors"
                    name="riskFactors"
                    value={riskFactorsInput}
                    onChange={(e) => handleArrayInputChange("riskFactors", e.target.value)}
                    onBlur={() => handleArrayInputBlur("riskFactors", riskFactorsInput)}
                    placeholder="Введите факторы риска, разделяя запятыми"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="socialBenefits">Социальные выплаты (через запятую)</Label>
                  <Input
                    id="socialBenefits"
                    name="socialBenefits"
                    value={socialBenefitsInput}
                    onChange={(e) => handleArrayInputChange("socialBenefits", e.target.value)}
                    onBlur={() => handleArrayInputBlur("socialBenefits", socialBenefitsInput)}
                    placeholder="Введите социальные выплаты, разделяя запятыми"
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
                    <Label htmlFor="housingType">Вид жилья</Label>
                    <Select
                      value={formData.housingType}
                      onValueChange={(value) => handleSelectChange("housingType", value)}
                    >
                      <SelectTrigger id="housingType">
                        <SelectValue placeholder="Выберите тип" />
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
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="familyIncome">Доходы семьи (тыс. тенге в месяц)</Label>
                    <Input
                      id="familyIncome"
                      name="familyIncome"
                      type="text"
                      value={formData.familyIncome}
                      onChange={handleInputChange}
                    />
                  </div>
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
                        id="hasDisability"
                        checked={formData.hasDisability || false}
                        onCheckedChange={(checked) => handleCheckboxChange("hasDisability", checked as boolean)}
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
                      />
                      <Label htmlFor="hasInterpreterNeeded" className="font-normal">
                        Требуется переводчик
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Примечания</Label>
                  <Textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} />
                </div>
              </CardContent>
            </Card>

            {/* Document Upload Section */}
            <Card className="enhanced-card">
              <CardHeader>
                <CardTitle>Документы</CardTitle>
                <CardDescription>Прикрепите документы к семье</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="documentTitle">Название документа</Label>
                    <Input
                      id="documentTitle"
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      placeholder="Введите название документа"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="documentType">Тип документа</Label>
                    <Select value={documentType} onValueChange={(value) => setDocumentType(value)}>
                      <SelectTrigger id="documentType">
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="act">Акт</SelectItem>
                        <SelectItem value="certificate">Справка</SelectItem>
                        <SelectItem value="application">Заявление</SelectItem>
                        <SelectItem value="document">Документ</SelectItem>
                        <SelectItem value="other">Другое</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="documentFile">Файл</Label>
                    <div className="flex gap-2">
                      <Input
                        id="documentFile"
                        type="file"
                        ref={fileInputRef}
                        accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      />
                      <Button type="button" onClick={handleAddDocument}>
                        <FileUp className="h-4 w-4 mr-2" />
                        Добавить
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Document List */}
                {documents.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">Прикрепленные документы:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {documents.map((doc, index) => (
                        <div key={index} className="border rounded-md p-4 relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => handleRemoveDocument(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>

                          <div className="flex items-center mb-2">
                            {doc.preview ? (
                              <img
                                src={doc.preview || "/placeholder.svg"}
                                alt={doc.title}
                                className="w-12 h-12 object-cover rounded mr-3"
                              />
                            ) : (
                              <FileText className="w-12 h-12 text-gray-500 mr-3" />
                            )}
                            <div>
                              <p className="font-medium">{doc.title}</p>
                              <p className="text-sm text-gray-500">{typeMap[doc.type] || doc.type}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 truncate">{doc.file.name}</p>
                          <p className="text-sm text-gray-500">{(doc.file.size / 1024).toFixed(2)} KB</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
