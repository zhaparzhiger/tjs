"use client"

import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatisticsDashboard } from "@/components/statistics-dashboard"
import type { UserRole } from "@/types/roles"

export default function StatisticsPage() {
  const searchParams = useSearchParams()
  const role = (searchParams.get("role") as UserRole) || "admin"

  return (
    <DashboardLayout role={role}>
      <StatisticsDashboard role={role} />
    </DashboardLayout>
  )
}
