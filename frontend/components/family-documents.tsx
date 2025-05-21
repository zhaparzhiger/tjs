"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { DatePicker } from "@/components/date-picker"
import { FileUp, Download, Eye, Trash2, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"

interface Document {
  id: string
  familyId: string
  title: string
  type: string
  uploadDate: string
  uploadedBy: { fullName: string }
  fileUrl: string
  mimeType?: string
  fileSize?: number
}

interface FamilyDocumentsProps {
  family: { id: string }
  role: "admin" | "school" | "social" | "police" | "health" | "district" | "mobile"
}

export function FamilyDocuments({ family, role }: FamilyDocumentsProps) {
  const { toast } = useToast()
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false)
  const [isViewDocumentOpen, setIsViewDocumentOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDate, setSelectedDate] = useState<string>("")

  // Map frontend type values to backend display values
  const typeMap: { [key: string]: string } = {
    act: "Акт",
    certificate: "Справка",
    application: "Заявление",
    document: "Документ",
    other: "Другое",
  }

  // Fetch documents on mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/documents/family/${family.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log("Fetched documents:", response.data)
        setDocuments(response.data)
      } catch (error) {
        console.error("Error fetching documents:", error)
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить документы",
          variant: "destructive",
        })
      }
    }
    fetchDocuments()
  }, [family.id, toast])

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    // Append additional fields
    formData.append("familyId", family.id)
    if (selectedDate) {
      formData.append("uploadDate", selectedDate)
    }

    // Map type to display value
    const type = formData.get("type") as string
    if (type && typeMap[type]) {
      formData.set("type", typeMap[type])
    }

    try {
      const token = localStorage.getItem("auth_token")
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/documents/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      console.log("Uploaded document:", response.data.document)
      setDocuments([...documents, response.data.document])
      setIsAddDocumentOpen(false)
      setSelectedDate("")
      toast({
        title: "Документ добавлен",
        description: "Новый документ успешно добавлен",
      })
    } catch (error) {
      console.error("Error uploading document:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось добавить документ",
        variant: "destructive",
      })
    }
  }

  const handleDeleteDocument = async (id: string) => {
    try {
      const token = localStorage.getItem("auth_token")
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDocuments(documents.filter((doc) => doc.id !== id))
      toast({
        title: "Документ удален",
        description: "Документ успешно удален из списка",
      })
    } catch (error) {
      console.error("Error deleting document:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось удалить документ",
        variant: "destructive",
      })
    }
  }

  const handleViewDocument = (doc: Document) => {
    console.log("Viewing document:", { fileUrl: doc.fileUrl, mimeType: doc.mimeType })
    let url = doc.fileUrl
    // Normalize URLs (handle relative, case-insensitive 'uploads')
    if (url && !url.startsWith("http")) {
      url = `${process.env.NEXT_PUBLIC_API_URL}${url.startsWith("/") ? url : "/uploads/" + url}`
      url = url.replace(/\/Uploads\//i, "/uploads/")
    }
    console.log("Normalized URL:", url)
    setSelectedDocument({ ...doc, fileUrl: url })
    setIsViewDocumentOpen(true)
  }

  const renderDocumentPreview = (doc: Document) => {
    const mimeType = doc.mimeType?.toLowerCase()
    const url = doc.fileUrl
    const fileSize = doc.fileSize ? `${(doc.fileSize / 1024).toFixed(2)} KB` : "Неизвестно"

    // Handle image previews
    if (mimeType?.startsWith("image/")) {
      return (
        <div className="flex flex-col items-center">
          <img
            src={url || "/placeholder.svg"}
            alt={doc.title}
            className="max-w-full h-auto object-contain"
            style={{ maxHeight: "70vh" }}
            onError={() =>
              toast({
                title: "Ошибка",
                description: "Не удалось загрузить изображение",
                variant: "destructive",
              })
            }
          />
          <Button onClick={() => handleDownloadDocument(doc)} className="mt-4" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Скачать изображение
          </Button>
        </div>
      )
    }

    // Handle PDF previews with iframe for better compatibility
    if (mimeType === "application/pdf") {
      return (
        <div className="flex flex-col items-center">
          <iframe
            src={`${url}#toolbar=0&navpanes=0&scrollbar=1`}
            className="w-full border-0"
            style={{ height: "70vh" }}
            title={doc.title}
            onError={() =>
              toast({
                title: "Ошибка",
                description: "Не удалось загрузить PDF",
                variant: "destructive",
              })
            }
          />
          <Button onClick={() => handleDownloadDocument(doc)} className="mt-4" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Скачать PDF
          </Button>
        </div>
      )
    }

    // Handle Office documents and other file types
    const getFileIcon = () => {
      if (mimeType?.includes("excel") || mimeType?.includes("spreadsheet")) {
        return <FileText className="w-16 h-16 mx-auto text-green-500" />
      } else if (mimeType?.includes("word") || mimeType?.includes("document")) {
        return <FileText className="w-16 h-16 mx-auto text-blue-500" />
      } else if (mimeType === "text/plain") {
        return <FileText className="w-16 h-16 mx-auto text-gray-500" />
      } else {
        return <FileText className="w-16 h-16 mx-auto text-gray-500" />
      }
    }

    return (
      <div className="text-center p-8">
        {getFileIcon()}
        <p className="mt-4 text-lg font-medium">{doc.title}</p>
        <p className="text-muted-foreground">Тип: {mimeType || "неизвестный"}</p>
        <p className="text-muted-foreground mb-4">Размер: {fileSize}</p>
        <Button onClick={() => handleDownloadDocument(doc)} className="mt-2" variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Скачать документ
        </Button>
      </div>
    )
  }

  const handleDownloadDocument = (doc: Document) => {
    let url = doc.fileUrl
    // Normalize URLs
    if (url && !url.startsWith("http")) {
      url = `${process.env.NEXT_PUBLIC_API_URL}${url.startsWith("/") ? url : "/uploads/" + url}`
      url = url.replace(/\/Uploads\//i, "/uploads/")
    }

    // Create a blob from the URL and download it
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok")
        }
        return response.blob()
      })
      .then((blob) => {
        // Determine file extension based on mimeType
        const extension = doc.mimeType
          ? doc.mimeType.includes("image/png")
            ? ".png"
            : doc.mimeType.includes("image/jpeg")
              ? ".jpg"
              : doc.mimeType.includes("application/pdf")
                ? ".pdf"
                : doc.mimeType.includes("spreadsheetml.sheet")
                  ? ".xlsx"
                  : doc.mimeType.includes("ms-excel")
                    ? ".xls"
                    : doc.mimeType.includes("wordprocessingml.document")
                      ? ".docx"
                      : doc.mimeType.includes("msword")
                        ? ".doc"
                        : doc.mimeType.includes("text/plain")
                          ? ".txt"
                          : ""
          : ""

        // Create a blob URL and trigger download
        const blobUrl = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = blobUrl
        link.download = `${doc.title}${extension}`
        document.body.appendChild(link)
        link.click()

        // Clean up
        window.URL.revokeObjectURL(blobUrl)
        document.body.removeChild(link)

        toast({
          title: "Скачивание документа",
          description: `Скачивается: ${doc.title}${extension}`,
        })
      })
      .catch((error) => {
        console.error("Error downloading document:", error)
        toast({
          title: "Ошибка",
          description: "Не удалось скачать документ",
          variant: "destructive",
        })
      })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-end mb-4">
          <Dialog open={isAddDocumentOpen} onOpenChange={setIsAddDocumentOpen}>
            <DialogTrigger asChild>
              <Button>
                <FileUp className="mr-2 h-4 w-4" />
                Добавить документ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить документ</DialogTitle>
                <DialogDescription>Загрузите новый документ для семьи</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddDocument}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Название документа</Label>
                    <Input id="title" name="title" required />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="type">Тип документа</Label>
                    <Select name="type">
                      <SelectTrigger id="type">
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
                    <Label>Дата документа</Label>
                    <DatePicker
                      value={selectedDate}
                      onChange={(value) => {
                        console.log("DatePicker onChange:", value)
                        const dateStr =
                          value instanceof Date
                            ? value.toISOString().split("T")[0]
                            : typeof value === "string" && value
                              ? value
                              : ""
                        setSelectedDate(dateStr)
                      }}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="file">Файл</Label>
                    <Input id="file" name="file" type="file" required />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Добавить</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название документа</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Автор</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((document) => (
              <TableRow key={document.id}>
                <TableCell className="font-medium">{document.title}</TableCell>
                <TableCell>{document.type}</TableCell>
                <TableCell>{new Date(document.uploadDate).toLocaleDateString("ru-RU")}</TableCell>
                <TableCell>{document.uploadedBy.fullName}</TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleViewDocument(document)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDownloadDocument(document)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteDocument(document.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* View Document Modal */}
        <Dialog open={isViewDocumentOpen} onOpenChange={setIsViewDocumentOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedDocument?.title || "Просмотр документа"}</DialogTitle>
              <DialogDescription>
                {selectedDocument?.type || "Документ"} от{" "}
                {selectedDocument?.uploadDate ? new Date(selectedDocument.uploadDate).toLocaleDateString("ru-RU") : ""}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 overflow-auto max-h-[80vh]">
              {selectedDocument ? renderDocumentPreview(selectedDocument) : <p>Документ не выбран</p>}
            </div>
            <DialogFooter className="flex justify-between">
              <Button variant="outline" onClick={() => selectedDocument && handleDownloadDocument(selectedDocument)}>
                <Download className="mr-2 h-4 w-4" />
                Скачать
              </Button>
              <Button onClick={() => setIsViewDocumentOpen(false)}>Закрыть</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
