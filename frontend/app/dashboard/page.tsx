"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { FamilyDashboard } from "@/components/family-dashboard"
import type { UserRole } from "@/types/roles"

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const role = (searchParams.get("role") as UserRole) || "admin"

  return (
    <DashboardLayout role={role}>
      <FamilyDashboard role={role} />
    </DashboardLayout>
  )
}
