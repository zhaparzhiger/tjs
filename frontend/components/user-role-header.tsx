"use client"

import type React from "react"

import { useTheme } from "next-themes"
import { Sun, Moon, User } from "lucide-react"
import { Button } from "@/components/ui/button"
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
    };
  
    return roleMap[role] || role;
  };
  
  const getRoleHeaderClass = (role: string) => {
    const normalizedRole = role.toLowerCase();
    const roleClassMap: Record<string, string> = {
      admin: "header-admin",
      school: "header-school",
      district: "header-district",
      mobile: "header-mobile",
      police: "header-police",
      health: "header-health",
      regional: "header-regional",
      social: "header-social",
    };
    return roleClassMap[normalizedRole] || "header-admin";
  };


  const headerClass = getRoleHeaderClass(userRole)
  const roleDisplayName = getRoleDisplayName(userRole)

  console.log("Current role:", userRole, "Header class:", headerClass)

  return (
    <header
      className={`fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-3 sm:px-4 md:px-6 z-30 ${headerClass}`}
      data-role={userRole.toLowerCase()}
    >
      <div className="flex items-center">
        {children}
        <div className="flex items-center ml-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 mr-2 text-white"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <h1 className="text-lg font-bold text-white truncate">
            {isMobile ? "ЕБД ТЖС" : "Единая база данных семей в ТЖС"}
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-white hover:bg-white/20"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <div className="relative flex items-center gap-2">
          <Button
            variant="outline"
            size={isMobile ? "sm" : "default"}
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
          >
            <User className="h-4 w-4 mr-1" />
            {user?.fullName || user?.username || "Пользователь"}
          </Button>

          <Button
            variant="outline"
            size={isMobile ? "sm" : "default"}
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
          >
            {roleDisplayName}
          </Button>
        </div>
      </div>
    </header>
  )
}
