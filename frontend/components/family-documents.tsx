"use client"

import type React from "react"

import { useState } from "react"
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
import { FileUp, Download, Eye, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { simulateFileUpload, exportToPdf } from "@/lib/export-utils"
import { getFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage-utils"
import type { Document } from "@/types/models"

interface FamilyDocumentsProps {
  family: any
  role: "admin" | "school" | "social" | "police" | "health" | "district" | "mobile"
}

export function FamilyDocuments({ family, role }: FamilyDocumentsProps) {
  const { toast } = useToast()
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false)
  const [documents, setDocuments] = useState<Document[]>(() => {
    // Получаем документы из localStorage или используем демо-данные
    const storedDocs = getFromStorage<Document[]>(STORAGE_KEYS.FAMILY_DOCUMENTS, [])
    const familyDocs = storedDocs.filter((doc) => doc.familyId === family.id)

    return familyDocs.length > 0
      ? familyDocs
      : [
          {
            id: 1,
            familyId: family.id,
            name: "Акт обследования",
            type: "Акт",
            date: "15.03.2025",
            author: "Иванов П.С.",
          },
          {
            id: 2,
            familyId: family.id,
            name: "Справка о доходах",
            type: "Справка",
            date: "10.02.2025",
            author: "Петрова А.В.",
          },
          {
            id: 3,
            familyId: family.id,
            name: "Заявление на АСП",
            type: "Заявление",
            date: "05.01.2025",
            author: "Сидоров К.Н.",
          },
          {
            id: 4,
            familyId: family.id,
            name: "Свидетельство о рождении",
            type: "Документ",
            date: "20.12.2024",
            author: "Ким Е.С.",
          },
        ]
  })

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault()

    // Получаем данные из формы
    const form = e.target as HTMLFormElement
    const documentName = (form.querySelector("#documentName") as HTMLInputElement).value
    const documentType = (form.querySelector("#documentType") as HTMLSelectElement).value
    const date = new Date().toLocaleDateString("ru-RU")

    // Создаем новый документ
    const newDocument: Document = {
      id: Math.max(0, ...documents.map((d) => d.id)) + 1,
      familyId: family.id,
      name: documentName,
      type:
        documentType === "act"
          ? "Акт"
          : documentType === "certificate"
            ? "Справка"
            : documentType === "application"
              ? "Заявление"
              : documentType === "document"
                ? "Документ"
                : "Другое",
      date,
      author: "Текущий пользователь",
    }

    // Имитация загрузки файла
    simulateFileUpload((file) => {
      newDocument.fileUrl = URL.createObjectURL(file)
      newDocument.fileType = file.type
      newDocument.fileSize = file.size

      // Обновляем состояние и localStorage
      const updatedDocs = [...documents, newDocument]
      setDocuments(updatedDocs)

      // Получаем все документы и добавляем новый
      const allDocs = getFromStorage<Document[]>(STORAGE_KEYS.FAMILY_DOCUMENTS, [])
      const docsWithoutFamily = allDocs.filter((d) => d.familyId !== family.id)
      saveToStorage(STORAGE_KEYS.FAMILY_DOCUMENTS, [...docsWithoutFamily, ...updatedDocs])

      setIsAddDocumentOpen(false)
      toast({
        title: "Документ добавлен",
        description: "Новый документ успешно добавлен",
      })
    })
  }

  const handleDeleteDocument = (id: number) => {
    // Удаляем документ из состояния
    const updatedDocs = documents.filter((doc) => doc.id !== id)
    setDocuments(updatedDocs)

    // Обновляем localStorage
    const allDocs = getFromStorage<Document[]>(STORAGE_KEYS.FAMILY_DOCUMENTS, [])
    const docsWithoutDeleted = allDocs.filter((d) => d.id !== id)
    saveToStorage(STORAGE_KEYS.FAMILY_DOCUMENTS, docsWithoutDeleted)

    toast({
      title: "Документ удален",
      description: "Документ успешно удален из списка",
    })
  }

  const handleViewDocument = (document: Document) => {
    if (document.fileUrl) {
      // Если есть URL файла, открываем его в новом окне
      window.open(document.fileUrl, "_blank")
    } else {
      // Иначе показываем уведомление
      toast({
        title: "Просмотр документа",
        description: "Документ недоступен для просмотра",
      })
    }
  }

  const handleDownloadDocument = (document: Document) => {
    // Имитация скачивания PDF
    exportToPdf(
      {
        name: document.name,
        type: document.type,
        date: document.date,
        author: document.author,
        content: "Содержимое документа...",
      },
      document.name,
    )

    toast({
      title: "Скачивание документа",
      description: "Документ скачивается",
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
                    <Label htmlFor="documentName">Название документа</Label>
                    <Input id="documentName" required />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="documentType">Тип документа</Label>
                    <Select>
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
                    <Label>Дата документа</Label>
                    <DatePicker />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="file">Файл</Label>
                    <Input id="file" type="file" />
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
                <TableCell className="font-medium">{document.name}</TableCell>
                <TableCell>{document.type}</TableCell>
                <TableCell>{document.date}</TableCell>
                <TableCell>{document.author}</TableCell>
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
      </CardContent>
    </Card>
  )
}
