"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { FamilyDashboard } from "@/components/family-dashboard";
import { useAuth } from "@/context/auth-context";
import type { UserRole } from "@/types/roles";
import { roleConfigs } from "@/types/roles";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roleFromParams = searchParams.get("role") as UserRole;

  console.log("DashboardPage: isAuthenticated:", isAuthenticated, "user:", user, "roleFromParams:", roleFromParams);

  // Если пользователь не аутентифицирован, перенаправляем на /login
  if (!isLoading && !isAuthenticated) {
    router.push("/login");
    return <div>Перенаправление на вход...</div>;
  }

  // Карта для преобразования ролей
  const roleMap: { [key: string]: UserRole } = {
    "Администратор": "admin",
    "Школа": "school",
    "Район": "district",
    "Мобильная группа": "mobile",
    "Полиция": "police",
    "Здравоохранение": "health",
    "Регион": "regional",
    "Социальная служба": "social",
  };

  // Определяем роль
  let role = roleFromParams;
  if (!role && user?.role) {
    role = roleMap[user.role] || user.role.toLowerCase() as UserRole;
    console.log(`Используем преобразованную роль из user: ${role}`);
    if (roleConfigs[role]) {
      router.replace(`/dashboard?role=${role}`);
    } else {
      role = null;
    }
  }

  // Если роль недопустима, перенаправляем на /login
  if (!role || !roleConfigs[role]) {
    console.error(`Недопустимая роль: ${role}`);
    router.push("/login");
    return <div>Перенаправление...</div>;
  }

  return (
    <DashboardLayout role={role}>
      <FamilyDashboard role={role} />
    </DashboardLayout>
  );
}