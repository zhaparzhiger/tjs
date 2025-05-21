"use client"

import React from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, User, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useIsMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/context/auth-context"

interface UserRoleHeaderProps {
  role: string
  children?: React.ReactNode
}

export function UserRoleHeader({ role, children }: UserRoleHeaderProps) {
  const { theme, setTheme } = useTheme()
  const isMobile = useIsMobile()
  const { user } = useAuth()

  // Debug log to check user data
  React.useEffect(() => {
    console.log("User data:", user)
  }, [user])

  // Получаем роль из контекста аутентификации, если она доступна
  const userRole = user?.role || role

  // Определяем отображаемое имя роли
  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      ADMIN: "Администратор",
      admin: "Администратор",
      SCHOOL: "Школа",
      school: "Школа",
      DISTRICT: "Район",
      district: "Район",
      MOBILE: "Мобильная группа",
      mobile: "Мобильная группа",
      POLICE: "Полиция",
      police: "Полиция",
      HEALTH: "Здравоохранение",
      health: "Здравоохранение",
      REGIONAL: "Регион",
      regional: "Регион",
      SOCIAL: "Социальная служба",
      social: "Социальная служба",
      Администратор: "Администратор", // Handle provided role format
    }

    return roleMap[role] || role
  }

  // Получаем полное описание роли
  const getRoleFullDescription = (role: string) => {
    const roleDescMap: Record<string, string> = {
      ADMIN: "Полный доступ ко всем функциям системы",
      admin: "Полный доступ ко всем функциям системы",
      SCHOOL: "Доступ к данным учащихся и образовательным мерам",
      school: "Доступ к данным учащихся и образовательным мерам",
      DISTRICT: "Управление данными района",
      district: "Управление данными района",
      MOBILE: "Доступ к выездным мероприятиям",
      mobile: "Доступ к выездным мероприятиям",
      POLICE: "Доступ к данным правонарушений",
      police: "Доступ к данным правонарушений",
      HEALTH: "Доступ к медицинским данным",
      health: "Доступ к медицинским данным",
      REGIONAL: "Управление данными региона",
      regional: "Управление данными региона",
      SOCIAL: "Доступ к социальным мерам поддержки",
      social: "Доступ к социальным мерам поддержки",
      Администратор: "Полный доступ ко всем функциям системы",
    }

    return roleDescMap[role] || "Стандартный доступ к системе"
  }

  const getRoleHeaderClass = (role: string) => {
    const normalizedRole = role.toLowerCase()
    const roleClassMap: Record<string, string> = {
      admin: "header-admin",
      администратор: "header-admin",
      school: "header-school",
      district: "header-district",
      mobile: "header-mobile",
      police: "header-police",
      health: "header-health",
      regional: "header-regional",
      social: "header-social",
    }
    return roleClassMap[normalizedRole] || "header-admin"
  }

  const headerClass = getRoleHeaderClass(userRole)
  const roleDisplayName = getRoleDisplayName(userRole)
  const fullName = user?.fullName || "Имя не указано"
  const displayName = user?.username || user?.iin || "Пользователь"

  return (
    <header
      className={`fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-1.5 xs:px-2 sm:px-4 md:px-6 z-30 ${headerClass} max-w-full overflow-x-hidden`}
      data-role={userRole.toLowerCase()}
    >
      <div className="flex items-center min-w-0">
        {/* Ensure burger menu isn't black by wrapping it with a class that preserves its color */}
        <div className="text-white preserve-color">{children}</div>

        <div className="flex items-center ml-0.5 xs:ml-1 sm:ml-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 mr-1 xs:mr-1.5 sm:mr-2 text-white"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <h1 className="text-sm xs:text-base sm:text-lg font-bold text-white truncate max-w-[100px] xs:max-w-[140px] sm:max-w-[200px] md:max-w-none">
            {isMobile ? "ЕБД ТЖС" : "Единая база данных семей в ТЖС"}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-white hover:bg-white/20 h-8 w-8 xs:h-9 xs:w-9 sm:h-9 sm:w-9"
        >
          {theme === "dark" ? <Sun className="h-4 w-4 xs:h-5 xs:w-5 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 xs:h-5 xs:w-5 sm:h-5 sm:w-5" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white h-8 px-1.5 xs:px-2 sm:px-3 truncate max-w-[100px] xs:max-w-[120px] sm:max-w-[150px]"
            >
              <User className="h-4 w-4 mr-1 xs:mr-1.5" />
              <span className="text-xs xs:text-sm truncate">Профиль</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 xs:w-64">
            <DropdownMenuLabel>Мой профиль</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <div className="text-sm xs:text-base font-medium mb-1 truncate">{fullName}</div>
              <div className="text-xs xs:text-sm text-muted-foreground mb-1 truncate">{displayName}</div>
              <div className="space-y-1">
                <div className="text-xs xs:text-sm text-muted-foreground flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary mr-1.5"></span>
                  <span className="font-medium">{roleDisplayName}</span>
                </div>
                <div className="text-xs text-muted-foreground pl-3.5">{getRoleFullDescription(userRole)}</div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Настройки</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Выйти</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}