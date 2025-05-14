"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Download,
  Trash2,
  Eye,
  Search,
  Filter,
  FileText,
  FileImage,
  FileIcon as FilePdf,
  FileArchive,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { type UserRole, roleConfigs } from "@/types/roles"
import { getFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage-utils"
import type { Document } from "@/types/models"

// Импортируем функции для скачивания
import { downloadEmptyExcel, downloadEmptyPdf } from "@/lib/export-utils"

export default function DocumentsPage() {
  const searchParams = useSearchParams()
  const role = (searchParams.get("role") as UserRole) || "admin"
  const type = searchParams.get("type")
  const { toast } = useToast()
  const roleConfig = roleConfigs[role]
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentName, setDocumentName] = useState("")
  const [documentType, setDocumentType] = useState("act")
  const [documentFamily, setDocumentFamily] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  // Загружаем документы из localStorage при монтировании компонента
  useEffect(() => {
    const storedDocuments = getFromStorage<Document[]>(STORAGE_KEYS.FAMILY_DOCUMENTS, [])

    // Применяем фильтр, если он указан
    if (type) {
      if (type === "acts") {
        setDocuments(storedDocuments.filter((doc) => doc.type === "act"))
      } else if (type === "certificates") {
        setDocuments(storedDocuments.filter((doc) => doc.type === "certificate"))
      } else if (type === "applications") {
        setDocuments(storedDocuments.filter((doc) => doc.type === "application"))
      }
    } else {
      setDocuments(storedDocuments)
    }
  }, [type])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      if (!documentName) {
        setDocumentName(e.target.files[0].name.split(".")[0])
      }
    }
  }

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      toast({
        title: "Ошибка",
        description: "Выберите файл для загрузки",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    // Имитация загрузки
    setTimeout(() => {
      const storedDocuments = getFromStorage<Document[]>(STORAGE_KEYS.FAMILY_DOCUMENTS, [])

      // Генерируем новый ID
      const newId = storedDocuments.length > 0 ? Math.max(...storedDocuments.map((d) => d.id)) + 1 : 1

      // Текущая дата
      const now = new Date().toLocaleDateString("ru-RU")

      // Создаем объект документа
      const newDocument: Document = {
        id: newId,
        name: documentName || selectedFile.name,
        type: documentType,
        familyId: Number.parseInt(documentFamily) || 1,
        familyName: "Семья #" + (Number.parseInt(documentFamily) || 1),
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        uploadedBy: "Текущий пользователь",
        uploadedAt: now,
        status: "active",
        date: now,
        author: "Текущий пользователь",
      }

      // Сохраняем документ в localStorage
      const updatedDocuments = [...storedDocuments, newDocument]
      saveToStorage(STORAGE_KEYS.FAMILY_DOCUMENTS, updatedDocuments)

      // Обновляем состояние
      if (type) {
        if (type === "acts" && documentType === "act") {
          setDocuments([...documents, newDocument])
        } else if (type === "certificates" && documentType === "certificate") {
          setDocuments([...documents, newDocument])
        } else if (type === "applications" && documentType === "application") {
          setDocuments([...documents, newDocument])
        }
      } else {
        setDocuments([...documents, newDocument])
      }

      // Сбрасываем форму
      setSelectedFile(null)
      setDocumentName("")
      setDocumentFamily("")
      setIsUploading(false)

      toast({
        title: "Документ загружен",
        description: "Документ успешно загружен в систему",
      })
    }, 2000)
  }

  const handleDownload = (document: Document) => {
    // В зависимости от типа документа скачиваем Excel или PDF
    if (document.fileType?.includes("pdf") || document.type === "act" || document.type === "certificate") {
      downloadEmptyPdf(document.name)
    } else if (document.fileType?.includes("excel") || document.fileType?.includes("spreadsheet")) {
      downloadEmptyExcel(document.name)
    } else if (document.fileType?.includes("word") || document.fileType?.includes("document")) {
      // Имитация скачивания Word документа
      const link = document.createElement("a")
      link.href = URL.createObjectURL(new Blob([""], { type: "application/msword" }))
      link.download = `${document.name}.doc`
      link.click()
    } else if (document.fileType?.includes("image")) {
      // Имитация скачивания изображения
      const link = document.createElement("a")
      link.href = URL.createObjectURL(new Blob([""], { type: "image/png" }))
      link.download = `${document.name}.png`
      link.click()
    } else {
      // Для других типов файлов
      const link = document.createElement("a")
      link.href = URL.createObjectURL(new Blob([""], { type: "application/octet-stream" }))
      link.download = document.name
      link.click()
    }

    toast({
      title: "Скачивание документа",
      description: `Документ "${document.name}" скачивается`,
    })
  }

  const handleDelete = (id: number) => {
    const storedDocuments = getFromStorage<Document[]>(STORAGE_KEYS.FAMILY_DOCUMENTS, [])
    const updatedDocuments = storedDocuments.filter((doc) => doc.id !== id)
    saveToStorage(STORAGE_KEYS.FAMILY_DOCUMENTS, updatedDocuments)

    setDocuments(documents.filter((doc) => doc.id !== id))

    toast({
      title: "Документ удален",
      description: "Документ успешно удален из системы",
    })
  }

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.familyName && doc.familyName.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const getFileIcon = (fileType: string | undefined, docType: string) => {
    if (!fileType) {
      if (docType === "act" || docType === "certificate") {
        return <FilePdf className="h-5 w-5 text-red-500" />
      } else {
        return <FileText className="h-5 w-5 text-blue-500" />
      }
    }

    if (fileType.includes("pdf")) {
      return <FilePdf className="h-5 w-5 text-red-500" />
    } else if (fileType.includes("image")) {
      return <FileImage className="h-5 w-5 text-green-500" />
    } else if (fileType.includes("excel") || fileType.includes("spreadsheet")) {
      return <FileText className="h-5 w-5 text-green-700" />
    } else if (fileType.includes("word") || fileType.includes("document")) {
      return <FileText className="h-5 w-5 text-blue-700" />
    } else if (fileType.includes("zip") || fileType.includes("rar") || fileType.includes("archive")) {
      return <FileArchive className="h-5 w-5 text-yellow-600" />
    } else {
      return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <DashboardLayout role={role}>
      <div className="flex-1 space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">
            {type === "acts"
              ? "Акты обследования"
              : type === "certificates"
                ? "Справки"
                : type === "applications"
                  ? "Заявления"
                  : "Документы"}
          </h2>
        </div>

        <Tabs defaultValue="documents" className="space-y-4">
          <TabsList>
            <TabsTrigger value="documents">Все документы</TabsTrigger>
            <TabsTrigger value="upload">Загрузить документ</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-4">
            <Card className="enhanced-card">
              <CardHeader className="pb-3">
                <CardTitle>Список документов</CardTitle>
                <CardDescription>Всего документов: {filteredDocuments.length}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="relative w-full sm:w-auto">
                      <Input
                        placeholder="Поиск по названию, семье..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-full sm:w-64"
                      />
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>

                  {filteredDocuments.length > 0 ? (
                    <div className="grid gap-4">
                      {filteredDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start space-x-4 mb-2 sm:mb-0">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              {getFileIcon(doc.fileType, doc.type)}
                            </div>
                            <div>
                              <h3 className="font-medium">{doc.name}</h3>
                              <div className="flex flex-col sm:flex-row sm:items-center text-sm text-muted-foreground gap-1 sm:gap-3">
                                <span>Семья: {doc.familyName}</span>
                                <span className="hidden sm:inline">•</span>
                                <span>
                                  Тип:{" "}
                                  {doc.type === "act"
                                    ? "Акт обследования"
                                    : doc.type === "certificate"
                                      ? "Справка"
                                      : "Заявление"}
                                </span>
                                <span className="hidden sm:inline">•</span>
                                <span>Загружен: {doc.uploadedAt}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 w-full sm:w-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto"
                              onClick={() => handleDownload(doc)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Скачать
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Документы не найдены</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload">
            <Card className="enhanced-card">
              <CardHeader>
                <CardTitle>Загрузка нового документа</CardTitle>
                <CardDescription>Загрузите документ в систему</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="documentName">Название документа</Label>
                    <Input
                      id="documentName"
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                      placeholder="Введите название документа"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="documentType">Тип документа</Label>
                    <select
                      id="documentType"
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="act">Акт обследования</option>
                      <option value="certificate">Справка</option>
                      <option value="application">Заявление</option>
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="documentFamily">ID семьи</Label>
                    <Input
                      id="documentFamily"
                      value={documentFamily}
                      onChange={(e) => setDocumentFamily(e.target.value)}
                      placeholder="Введите ID семьи"
                      type="number"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="file">Файл</Label>
                    <Input id="file" type="file" onChange={handleFileChange} accept="*/*" />
                    <p className="text-xs text-muted-foreground">Поддерживаются все форматы файлов</p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isUploading}>
                    {isUploading ? "Загрузка..." : "Загрузить документ"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
