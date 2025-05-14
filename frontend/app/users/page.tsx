"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { UserManagement } from "@/components/user-management"
import { type UserRole, roleConfigs } from "@/types/roles"
import { useEffect } from "react"

export default function UsersPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const role = (searchParams.get("role") as UserRole) || "admin"
  const roleConfig = roleConfigs[role]

  // Redirect if user doesn't have permission to manage users
  useEffect(() => {
    if (!roleConfig.permissions.canManageUsers) {
      router.push(`/dashboard?role=${role}`)
    }
  }, [role, roleConfig.permissions.canManageUsers, router])

  if (!roleConfig.permissions.canManageUsers) {
    return null
  }

  return (
    <DashboardLayout role={role}>
      <UserManagement />
    </DashboardLayout>
  )
}
