"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { UserRoleHeader } from "@/components/user-role-header"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  BarChart3,
  Home,
  Users,
  Settings,
  Bell,
  FileText,
  HelpCircle,
  Map,
  Download,
  LogOut,
  FileBarChart,
  UserCheck,
  Menu,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"

interface DashboardLayoutProps {
  children: React.ReactNode
  role: string
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const router = useRouter()
  const { logout, user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Используем роль из контекста аутентификации, если она доступна
  const userRole = user?.role || role
  const normalizedRole = userRole.toLowerCase()

  // Определяем разрешения на основе роли
  const getPermissions = (role: string) => {
    const normalizedRole = role.toLowerCase()

    const permissionsMap: Record<string, any> = {
      admin: {
        canViewDocuments: true,
        canViewMap: true,
        canViewStatistics: true,
        canViewReports: true,
        canManageUsers: true,
        canExportData: true,
        canManageSettings: true,
      },
      school: {
        canViewDocuments: true,
        canViewMap: false,
        canViewStatistics: false,
        canViewReports: false,
        canManageUsers: false,
        canExportData: false,
        canManageSettings: false,
      },
      district: {
        canViewDocuments: true,
        canViewMap: true,
        canViewStatistics: true,
        canViewReports: true,
        canManageUsers: false,
        canExportData: true,
        canManageSettings: false,
      },
      mobile: {
        canViewDocuments: true,
        canViewMap: true,
        canViewStatistics: false,
        canViewReports: false,
        canManageUsers: false,
        canExportData: false,
        canManageSettings: false,
      },
      police: {
        canViewDocuments: true,
        canViewMap: true,
        canViewStatistics: false,
        canViewReports: true,
        canManageUsers: false,
        canExportData: false,
        canManageSettings: false,
      },
      health: {
        canViewDocuments: true,
        canViewMap: false,
        canViewStatistics: false,
        canViewReports: true,
        canManageUsers: false,
        canExportData: false,
        canManageSettings: false,
      },
      regional: {
        canViewDocuments: true,
        canViewMap: true,
        canViewStatistics: true,
        canViewReports: true,
        canManageUsers: false,
        canExportData: true,
        canManageSettings: false,
      },
      social: {
        canViewDocuments: true,
        canViewMap: true,
        canViewStatistics: true,
        canViewReports: true,
        canManageUsers: false,
        canExportData: true,
        canManageSettings: false,
      },
    }

    return permissionsMap[normalizedRole] || permissionsMap.admin
  }

  const permissions = getPermissions(normalizedRole)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (!mounted) {
    return null
  }

  console.log("Dashboard Layout - Current role:", userRole, "Normalized role:", normalizedRole)

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <UserRoleHeader role={userRole}>
        {isMobile && (
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </UserRoleHeader>
      <div className="flex-1 flex pt-16 overflow-x-hidden">
        <SidebarProvider
          defaultOpen={!isMobile}
          open={isMobile ? mobileMenuOpen : true}
          onOpenChange={setMobileMenuOpen}
        >
          <Sidebar
            className="border-r border-border z-20 w-full max-w-[250px] md:max-w-[280px]"
            data-role={normalizedRole}
          >
            <SidebarContent className="pt-4">
              <SidebarMenu>
                <SidebarMenuItem>
                  <Link href={`/dashboard?role=${normalizedRole}`} passHref legacyBehavior>
                    <SidebarMenuButton
                      isActive={pathname === "/dashboard"}
                      className="sidebar-item"
                      onClick={() => isMobile && setMobileMenuOpen(false)}
                    >
                      <Home className="sidebar-icon" />
                      <span>Главная</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <Link href={`/families?role=${normalizedRole}`} passHref legacyBehavior>
                    <SidebarMenuButton
                      isActive={pathname === "/families"}
                      className={`sidebar-item ${pathname === "/families" ? "active" : ""}`}
                      onClick={() => isMobile && setMobileMenuOpen(false)}
                    >
                      <Users className="sidebar-icon" />
                      <span>Семьи</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>

                {permissions.canViewDocuments && (
                  <SidebarMenuItem>
                    <Link href={`/documents?role=${normalizedRole}`} passHref legacyBehavior>
                      <SidebarMenuButton
                        isActive={pathname === "/documents"}
                        className={`sidebar-item ${pathname === "/documents" ? "active" : ""}`}
                        onClick={() => isMobile && setMobileMenuOpen(false)}
                      >
                        <FileText className="sidebar-icon" />
                        <span>Документы</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                )}

                {permissions.canViewMap && (
                  <SidebarMenuItem>
                    <Link href={`/map?role=${normalizedRole}`} passHref legacyBehavior>
                      <SidebarMenuButton
                        isActive={pathname === "/map"}
                        className={`sidebar-item ${pathname === "/map" ? "active" : ""}`}
                        onClick={() => isMobile && setMobileMenuOpen(false)}
                      >
                        <Map className="sidebar-icon" />
                        <span>Карта</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                )}

                {permissions.canViewStatistics && (
                  <SidebarMenuItem>
                    <Link href={`/statistics?role=${normalizedRole}`} passHref legacyBehavior>
                      <SidebarMenuButton
                        isActive={pathname.startsWith("/statistics")}
                        className={`sidebar-item ${pathname.startsWith("/statistics") ? "active" : ""}`}
                        onClick={() => isMobile && setMobileMenuOpen(false)}
                      >
                        <BarChart3 className="sidebar-icon" />
                        <span>Статистика</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                )}

                {permissions.canViewReports && (
                  <SidebarMenuItem>
                    <Link href={`/reports?role=${normalizedRole}`} passHref legacyBehavior>
                      <SidebarMenuButton
                        isActive={pathname.startsWith("/reports")}
                        className={`sidebar-item ${pathname.startsWith("/reports") ? "active" : ""}`}
                        onClick={() => isMobile && setMobileMenuOpen(false)}
                      >
                        <FileBarChart className="sidebar-icon" />
                        <span>Отчеты</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                )}

                {permissions.canManageUsers && (
                  <SidebarMenuItem>
                    <Link href={`/users?role=${normalizedRole}`} passHref legacyBehavior>
                      <SidebarMenuButton
                        isActive={pathname === "/users"}
                        className={`sidebar-item ${pathname === "/users" ? "active" : ""}`}
                        onClick={() => isMobile && setMobileMenuOpen(false)}
                      >
                        <UserCheck className="sidebar-icon" />
                        <span>Пользователи</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                )}

                <SidebarMenuItem>
                  <Link href={`/notifications?role=${normalizedRole}`} passHref legacyBehavior>
                    <SidebarMenuButton
                      isActive={pathname === "/notifications"}
                      className={`sidebar-item ${pathname === "/notifications" ? "active" : ""}`}
                      onClick={() => isMobile && setMobileMenuOpen(false)}
                    >
                      <Bell className="sidebar-icon" />
                      <span>Уведомления</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>

                {permissions.canExportData && (
                  <SidebarMenuItem>
                    <Link href={`/export?role=${normalizedRole}`} passHref legacyBehavior>
                      <SidebarMenuButton
                        isActive={pathname === "/export"}
                        className={`sidebar-item ${pathname === "/export" ? "active" : ""}`}
                        onClick={() => isMobile && setMobileMenuOpen(false)}
                      >
                        <Download className="sidebar-icon" />
                        <span>Экспорт</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                )}

                {permissions.canManageSettings && (
                  <SidebarMenuItem>
                    <Link href={`/settings?role=${normalizedRole}`} passHref legacyBehavior>
                      <SidebarMenuButton
                        isActive={pathname.startsWith("/settings")}
                        className={`sidebar-item ${pathname.startsWith("/settings") ? "active" : ""}`}
                        onClick={() => isMobile && setMobileMenuOpen(false)}
                      >
                        <Settings className="sidebar-icon" />
                        <span>Настройки</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                )}

                <SidebarMenuItem>
                  <Link href={`/help?role=${normalizedRole}`} passHref legacyBehavior>
                    <SidebarMenuButton
                      isActive={pathname === "/help"}
                      className={`sidebar-item ${pathname === "/help" ? "active" : ""}`}
                      onClick={() => isMobile && setMobileMenuOpen(false)}
                    >
                      <HelpCircle className="sidebar-icon" />
                      <span>Помощь</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="border-t border-border p-4">
              <div className="flex flex-col space-y-4">
                <div className="text-xs text-muted-foreground">
                  <p>Единая база данных семей в ТЖС</p>
                  <p>Версия 1.0.0</p>
                </div>
                <SidebarMenuButton className="w-full sidebar-item" onClick={handleLogout}>
                  <LogOut className="sidebar-icon" />
                  <span>Выйти</span>
                </SidebarMenuButton>
              </div>
            </SidebarFooter>
          </Sidebar>
          <div className="flex-1 overflow-x-hidden overflow-y-auto px-1 sm:px-3 md:px-4 lg:pl-8 lg:pr-6 w-full max-w-full main-content-wrapper">
            <div className="w-full max-w-full overflow-x-hidden">{children}</div>
          </div>
        </SidebarProvider>
      </div>
    </div>
  )
}
