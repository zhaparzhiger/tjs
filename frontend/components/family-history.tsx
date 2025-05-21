"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"

interface FamilyHistoryProps {
  family: { id: string }
  role: "admin" | "school" | "social" | "police" | "health" | "district" | "mobile"
}

interface HistoryEntry {
  id: string
  date: string
  user: string
  action: string
  details: string
}

export function FamilyHistory({ family, role }: FamilyHistoryProps) {
  const { toast } = useToast()
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    const загрузитьИсторию = async () => {
      try {
        const токен = localStorage.getItem("auth_token")
        if (!токен) {
          throw new Error("Токен авторизации отсутствует")
        }
        const ответ = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/families/family/${family.id}/history`, {
          headers: { Authorization: `Bearer ${токен}` },
        })
        console.log("Получена история семьи:", ответ.data)
        const преобразованнаяИстория = ответ.data.map((запись: HistoryEntry) => ({
          ...запись,
          action: преобразоватьДействие(запись.action),
          details: преобразоватьОписание(запись.details, запись.action),
        }))
        setHistory(преобразованнаяИстория)
      } catch (ошибка) {
        console.error("Ошибка при загрузке истории семьи:", ошибка)
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить историю семьи",
          variant: "destructive",
        })
      }
    }
    загрузитьИсторию()
  }, [family.id, toast])

  const преобразоватьДействие = (действие: string) => {
    switch (действие) {
      case "support_added":
        return "Добавление меры поддержки"
      case "document_added":
        return "Добавление документа"
      case "document_removed":
        return "Удаление документа"
      case "status_changed":
        return "Изменение статуса"
      case "data_updated":
        return "Изменение данных"
      case "created":
        return "Создание записи"
      case "support_updated":
        return "Обновление меры поддержки"
      case "support_removed":
        return "Удаление меры поддержки"
      case "member_added":
        return "Добавление члена семьи"
      case "member_updated":
        return "Обновление члена семьи"
      case "member_removed":
        return "Удаление члена семьи"
      default:
        return действие
    }
  }

  const преобразоватьОписание = (описание: string, действие: string) => {
    // Исправляем ошибку с английскими текстами в деталях
    if (описание.includes("New support measure added:")) {
      const тип = описание.replace("New support measure added:", "").trim()
      return `Добавлена мера поддержки: ${переводТипов(тип)}`
    }

    if (описание.includes("Support measure updated:")) {
      const тип = описание.replace("Support measure updated:", "").trim()
      return `Обновлена мера поддержки: ${переводТипов(тип)}`
    }

    if (описание.includes("Support measure removed:")) {
      const тип = описание.replace("Support measure removed:", "").trim()
      return `Удалена мера поддержки: ${переводТипов(тип)}`
    }

    if (описание.includes("New document added:")) {
      const название = описание.replace("New document added:", "").trim()
      return `Добавлен документ: ${название}`
    }

    if (описание.includes("Document removed:")) {
      const название = описание.replace("Document removed:", "").trim()
      return `Удален документ: ${название}`
    }

    if (описание.includes("Family record created")) {
      return "Создана запись о семье"
    }

    if (описание.includes("Status changed from")) {
      return описание.replace("Status changed from", "Статус изменен с").replace("to", "на")
    }

    if (описание.includes("Data updated:")) {
      return описание.replace("Data updated:", "Изменены данные:")
    }

    if (описание.includes("member added:")) {
      const имя = описание.replace("member added:", "").trim()
      return `Добавлен член семьи: ${имя}`
    }

    return описание
  }

  const переводТипов = (тип: string) => {
    switch (тип.toLowerCase()) {
      case "registration":
        return "регистрация"
      case "clothing":
        return "одежда"
      case "kindergarten":
        return "детский сад"
      case "asp":
        return "АСП"
      case "fuel":
        return "топливо"
      case "charity":
        return "благотворительность"
      case "medical":
        return "определение в медучреждение"
      default:
        return тип
    }
  }

  const получитьЗначокДействия = (действие: string) => {
    switch (действие) {
      case "Изменение статуса":
        return <Badge className="bg-yellow-600">{действие}</Badge>
      case "Добавление меры поддержки":
      case "Обновление меры поддержки":
      case "Удаление меры поддержки":
        return <Badge className="bg-green-600">{действие}</Badge>
      case "Добавление документа":
      case "Удаление документа":
        return <Badge className="bg-blue-600">{действие}</Badge>
      case "Изменение данных":
      case "Добавление члена семьи":
      case "Обновление члена семьи":
      case "Удаление члена семьи":
        return <Badge className="bg-purple-600">{действие}</Badge>
      case "Создание записи":
        return <Badge className="bg-red-600">{действие}</Badge>
      default:
        return <Badge variant="outline">{действие}</Badge>
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата и время</TableHead>
              <TableHead>Пользователь</TableHead>
              <TableHead>Действие</TableHead>
              <TableHead>Детали</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  История отсутствует
                </TableCell>
              </TableRow>
            ) : (
              history.map((запись) => (
                <TableRow key={запись.id}>
                  <TableCell>{запись.date}</TableCell>
                  <TableCell>{запись.user}</TableCell>
                  <TableCell>{получитьЗначокДействия(запись.action)}</TableCell>
                  <TableCell>{запись.details}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
