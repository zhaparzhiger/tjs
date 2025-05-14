"use client"

import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RolePermissions } from "@/components/role-permissions"
import type { UserRole } from "@/types/roles"

export default function RoleInfoPage() {
  const searchParams = useSearchParams()
  const role = (searchParams.get("role") as UserRole) || "admin"

  // Описание функционала для каждой роли
  const roleFunctionality = {
    admin: {
      title: "Администратор системы",
      description: "Полный доступ ко всем функциям системы",
      responsibilities: [
        "Управление пользователями и их правами доступа",
        "Полный доступ к данным всех семей",
        "Создание и редактирование всех типов мер поддержки",
        "Управление справочниками системы",
        "Создание и просмотр всех типов отчетов",
        "Настройка системных параметров",
      ],
    },
    district: {
      title: "Районный пользователь",
      description: "Управление данными о семьях в своем районе",
      responsibilities: [
        "Добавление и редактирование семей в своем районе",
        "Создание и редактирование всех типов мер поддержки",
        "Загрузка и управление документами",
        "Создание и просмотр отчетов по своему району",
        "Координация работы ведомств в своем районе",
      ],
    },
    school: {
      title: "Школьный пользователь",
      description: "Управление данными о семьях и детях в сфере образования",
      responsibilities: [
        "Добавление и редактирование семей",
        "Управление данными о школьниках и студентах",
        "Создание и редактирование мер образовательной поддержки",
        "Загрузка документов, связанных с образованием",
        "Просмотр отчетов по образованию",
      ],
    },
    social: {
      title: "Социальная защита",
      description: "Управление мерами социальной поддержки",
      responsibilities: [
        "Добавление и редактирование семей",
        "Создание и редактирование мер социальной поддержки",
        "Управление АСП, ЖП и другими социальными выплатами",
        "Загрузка документов, связанных с социальной защитой",
        "Просмотр отчетов по социальной защите",
      ],
    },
    health: {
      title: "Здравоохранение",
      description: "Управление медицинскими мерами поддержки",
      responsibilities: [
        "Добавление и редактирование семей",
        "Создание и редактирование мер медицинской поддержки",
        "Управление данными об инвалидности",
        "Загрузка медицинских документов",
        "Просмотр отчетов по здравоохранению",
      ],
    },
    police: {
      title: "Полиция",
      description: "Управление мерами поддержки от правоохранительных органов",
      responsibilities: [
        "Добавление и редактирование семей",
        "Создание и редактирование мер поддержки от полиции",
        "Управление правовыми мерами",
        "Загрузка документов, связанных с правоохранительной деятельностью",
        "Просмотр отчетов по правоохранительной деятельности",
      ],
    },
    mobile: {
      title: "Мобильная группа",
      description: "Сбор данных о семьях в полевых условиях",
      responsibilities: [
        "Добавление и редактирование семей",
        "Загрузка документов и фотографий",
        "Проведение обследований жилищных условий",
        "Сбор первичной информации о семьях",
      ],
    },
    regional: {
      title: "Областной пользователь",
      description: "Анализ данных на областном уровне",
      responsibilities: [
        "Просмотр данных о всех семьях в области",
        "Создание и просмотр аналитических отчетов",
        "Мониторинг эффективности мер поддержки",
        "Анализ статистических данных",
      ],
    },
  }

  const currentRole = roleFunctionality[role]

  return (
    <DashboardLayout role={role}>
      <div className="flex-1 space-y-4 animate-fade-in">
        <Card className="enhanced-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold">{currentRole.title}</CardTitle>
            <CardDescription>{currentRole.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Основные обязанности</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {currentRole.responsibilities.map((responsibility, index) => (
                    <li key={index}>{responsibility}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <RolePermissions role={role} />
      </div>
    </DashboardLayout>
  )
}
