"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface FamilyHistoryProps {
  family: any
  role: "admin" | "school" | "social" | "police" | "health" | "district" | "mobile"
}

export function FamilyHistory({ family, role }: FamilyHistoryProps) {
  const history = [
    {
      id: 1,
      date: "17.04.2025 14:30",
      user: "Иванов П.С.",
      action: "Изменение статуса",
      details: "Статус изменен с 'ТЖС' на 'ТЖС и Неблагополучная'",
    },
    {
      id: 2,
      date: "15.04.2025 10:15",
      user: "Петрова А.В.",
      action: "Добавление меры поддержки",
      details: "Добавлена мера поддержки 'АСП' на сумму 45000 тыс. тенге",
    },
    {
      id: 3,
      date: "12.04.2025 09:45",
      user: "Сидоров К.Н.",
      action: "Добавление документа",
      details: "Добавлен документ 'Акт обследования'",
    },
    {
      id: 4,
      date: "10.04.2025 16:20",
      user: "Ким Е.С.",
      action: "Изменение данных",
      details: "Изменен адрес проживания",
    },
    {
      id: 5,
      date: "05.04.2025 11:30",
      user: "Иванов П.С.",
      action: "Создание записи",
      details: "Создана запись о семье",
    },
  ]

  const getActionBadge = (action: string) => {
    switch (action) {
      case "Изменение статуса":
        return <Badge className="bg-yellow-600">{action}</Badge>
      case "Добавление меры поддержки":
        return <Badge className="bg-green-600">{action}</Badge>
      case "Добавление документа":
        return <Badge className="bg-blue-600">{action}</Badge>
      case "Изменение данных":
        return <Badge className="bg-purple-600">{action}</Badge>
      case "Создание записи":
        return <Badge className="bg-red-600">{action}</Badge>
      default:
        return <Badge variant="outline">{action}</Badge>
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
            {history.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.date}</TableCell>
                <TableCell>{item.user}</TableCell>
                <TableCell>{getActionBadge(item.action)}</TableCell>
                <TableCell>{item.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
