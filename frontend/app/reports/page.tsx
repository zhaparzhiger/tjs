"use client"

import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ReportsDashboard } from "@/components/reports-dashboard"
import type { UserRole } from "@/types/roles"

export default function ReportsPage() {
  const searchParams = useSearchParams()
  const role = (searchParams.get("role") as UserRole) || "admin"

  return (
    <DashboardLayout role={role}>
      <ReportsDashboard role={role} />
    </DashboardLayout>
  )
}
