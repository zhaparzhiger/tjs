"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { DashboardLayout } from "@/components/dashboard-layout";
import { UserManagement } from "@/components/user-management";
import { type UserRole, roleConfigs } from "@/types/roles";
import { useEffect } from "react";

export default function UsersPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roleFromParams = searchParams.get("role") as UserRole;

  console.log("UsersPage: isAuthenticated:", isAuthenticated, "user:", user, "roleFromParams:", roleFromParams);

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
    console.log(`UsersPage: Используем преобразованную роль из user: ${role}`);
  }

  // Проверяем существование roleConfig
  const roleConfig = role ? roleConfigs[role] : null;
  if (!roleConfig) {
    console.error(`UsersPage: Недопустимая роль: ${role}`);
    useEffect(() => {
      router.push("/login");
    }, [router]);
    return <div>Ошибка: Недопустимая роль. Перенаправление на вход...</div>;
  }

  // Проверяем права на управление пользователями
  useEffect(() => {
    if (!isLoading && isAuthenticated && !roleConfig.permissions.canManageUsers) {
      console.warn(`UsersPage: Роль ${role} не имеет прав на управление пользователями`);
      router.push(`/dashboard?role=${role}`);
    }
  }, [isLoading, isAuthenticated, role, roleConfig.permissions.canManageUsers, router]);

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!isAuthenticated) {
    return <div>Пожалуйста, войдите в систему.</div>;
  }

  if (!roleConfig.permissions.canManageUsers) {
    return null;
  }

  return (
    <DashboardLayout role={role}>
      <UserManagement />
    </DashboardLayout>
  );
}