"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import type { UserRole } from "@/types/roles"

interface RolePermissionsProps {
  role: UserRole
}

export function RolePermissions({ role }: RolePermissionsProps) {
  // Определение разрешений для каждой роли
  const permissions = {
    admin: {
      name: "Администратор",
      color: "bg-red-600",
      permissions: {
        viewAllData: true,
        editAllData: true,
        addFamily: true,
        editFamily: true,
        deleteFamily: true,
        addSocialSupport: true,
        editSocialSupport: true,
        addEducationSupport: true,
        editEducationSupport: true,
        addHealthSupport: true,
        editHealthSupport: true,
        addPoliceSupport: true,
        editPoliceSupport: true,
        addLegalMeasures: true,
        editLegalMeasures: true,
        uploadDocuments: true,
        deleteDocuments: true,
        viewReports: true,
        createReports: true,
        manageUsers: true,
      },
    },
    district: {
      name: "Районный пользователь",
      color: "bg-purple-600",
      permissions: {
        viewAllData: false,
        editAllData: false,
        addFamily: true,
        editFamily: true,
        deleteFamily: true,
        addSocialSupport: true,
        editSocialSupport: true,
        addEducationSupport: true,
        editEducationSupport: true,
        addHealthSupport: true,
        editHealthSupport: true,
        addPoliceSupport: true,
        editPoliceSupport: true,
        addLegalMeasures: true,
        editLegalMeasures: true,
        uploadDocuments: true,
        deleteDocuments: true,
        viewReports: true,
        createReports: true,
        manageUsers: false,
      },
    },
    school: {
      name: "Школьный пользователь",
      color: "bg-green-600",
      permissions: {
        viewAllData: false,
        editAllData: false,
        addFamily: true,
        editFamily: true,
        deleteFamily: false,
        addSocialSupport: false,
        editSocialSupport: false,
        addEducationSupport: true,
        editEducationSupport: true,
        addHealthSupport: false,
        editHealthSupport: false,
        addPoliceSupport: false,
        editPoliceSupport: false,
        addLegalMeasures: false,
        editLegalMeasures: false,
        uploadDocuments: true,
        deleteDocuments: false,
        viewReports: true,
        createReports: false,
        manageUsers: false,
      },
    },
    social: {
      name: "Социальная защита",
      color: "bg-blue-600",
      permissions: {
        viewAllData: false,
        editAllData: false,
        addFamily: true,
        editFamily: true,
        deleteFamily: false,
        addSocialSupport: true,
        editSocialSupport: true,
        addEducationSupport: false,
        editEducationSupport: false,
        addHealthSupport: false,
        editHealthSupport: false,
        addPoliceSupport: false,
        editPoliceSupport: false,
        addLegalMeasures: false,
        editLegalMeasures: false,
        uploadDocuments: true,
        deleteDocuments: false,
        viewReports: true,
        createReports: false,
        manageUsers: false,
      },
    },
    health: {
      name: "Здравоохранение",
      color: "bg-orange-400",
      permissions: {
        viewAllData: false,
        editAllData: false,
        addFamily: true,
        editFamily: true,
        deleteFamily: false,
        addSocialSupport: false,
        editSocialSupport: false,
        addEducationSupport: false,
        editEducationSupport: false,
        addHealthSupport: true,
        editHealthSupport: true,
        addPoliceSupport: false,
        editPoliceSupport: false,
        addLegalMeasures: false,
        editLegalMeasures: false,
        uploadDocuments: true,
        deleteDocuments: false,
        viewReports: true,
        createReports: false,
        manageUsers: false,
      },
    },
    police: {
      name: "Полиция",
      color: "bg-yellow-600",
      permissions: {
        viewAllData: false,
        editAllData: false,
        addFamily: true,
        editFamily: true,
        deleteFamily: false,
        addSocialSupport: false,
        editSocialSupport: false,
        addEducationSupport: false,
        editEducationSupport: false,
        addHealthSupport: false,
        editHealthSupport: false,
        addPoliceSupport: true,
        editPoliceSupport: true,
        addLegalMeasures: true,
        editLegalMeasures: true,
        uploadDocuments: true,
        deleteDocuments: false,
        viewReports: true,
        createReports: false,
        manageUsers: false,
      },
    },
    mobile: {
      name: "Мобильная группа",
      color: "bg-sky-500",
      permissions: {
        viewAllData: false,
        editAllData: false,
        addFamily: true,
        editFamily: true,
        deleteFamily: false,
        addSocialSupport: false,
        editSocialSupport: false,
        addEducationSupport: false,
        editEducationSupport: false,
        addHealthSupport: false,
        editHealthSupport: false,
        addPoliceSupport: false,
        editPoliceSupport: false,
        addLegalMeasures: false,
        editLegalMeasures: false,
        uploadDocuments: true,
        deleteDocuments: false,
        viewReports: false,
        createReports: false,
        manageUsers: false,
      },
    },
    regional: {
      name: "Областной пользователь",
      color: "bg-indigo-600",
      permissions: {
        viewAllData: true,
        editAllData: false,
        addFamily: false,
        editFamily: false,
        deleteFamily: false,
        addSocialSupport: false,
        editSocialSupport: false,
        addEducationSupport: false,
        editEducationSupport: false,
        addHealthSupport: false,
        editHealthSupport: false,
        addPoliceSupport: false,
        editPoliceSupport: false,
        addLegalMeasures: false,
        editLegalMeasures: false,
        uploadDocuments: false,
        deleteDocuments: false,
        viewReports: true,
        createReports: true,
        manageUsers: false,
      },
    },
  }

  const currentRole = permissions[role]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          Права доступа
          <Badge className={`ml-2 ${currentRole.color}`}>{currentRole.name}</Badge>
        </CardTitle>
        <CardDescription>Разрешения и ограничения для текущей роли пользователя</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Функция</TableHead>
              <TableHead>Доступ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Просмотр всех данных</TableCell>
              <TableCell>
                {currentRole.permissions.viewAllData ? (
                  <Check className="text-green-600" />
                ) : (
                  <X className="text-red-600" />
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Редактирование всех данных</TableCell>
              <TableCell>
                {currentRole.permissions.editAllData ? (
                  <Check className="text-green-600" />
                ) : (
                  <X className="text-red-600" />
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Добавление семей</TableCell>
              <TableCell>
                {currentRole.permissions.addFamily ? (
                  <Check className="text-green-600" />
                ) : (
                  <X className="text-red-600" />
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Редактирование семей</TableCell>
              <TableCell>
                {currentRole.permissions.editFamily ? (
                  <Check className="text-green-600" />
                ) : (
                  <X className="text-red-600" />
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Удаление семей</TableCell>
              <TableCell>
                {currentRole.permissions.deleteFamily ? (
                  <Check className="text-green-600" />
                ) : (
                  <X className="text-red-600" />
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Добавление мер социальной поддержки</TableCell>
              <TableCell>
                {currentRole.permissions.addSocialSupport ? (
                  <Check className="text-green-600" />
                ) : (
                  <X className="text-red-600" />
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Редактирование мер социальной поддержки</TableCell>
              <TableCell>
                {currentRole.permissions.editSocialSupport ? (
                  <Check className="text-green-600" />
                ) : (
                  <X className="text-red-600" />
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Добавление мер образовательной поддержки</TableCell>
              <TableCell>
                {currentRole.permissions.addEducationSupport ? (
                  <Check className="text-green-600" />
                ) : (
                  <X className="text-red-600" />
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Редактирование мер образовательной поддержки</TableCell>
              <TableCell>
                {currentRole.permissions.editEducationSupport ? (
                  <Check className="text-green-600" />
                ) : (
                  <X className="text-red-600" />
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Добавление мер медицинской поддержки</TableCell>
              <TableCell>
                {currentRole.permissions.addHealthSupport ? (
                  <Check className="text-green-600" />
                ) : (
                  <X className="text-red-600" />
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Редактирование мер медицинской поддержки</TableCell>
              <TableCell>
                {currentRole.permissions.editHealthSupport ? (
                  <Check className="text-green-600" />
                ) : (
                  <X className="text-red-600" />
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Добавление мер поддержки от полиции</TableCell>
              <TableCell>
                {currentRole.permissions.addPoliceSupport ? (
                  <Check className="text-green-600" />
                ) : (
                  <X className="text-red-600" />
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Редактирование мер поддержки от полиции</TableCell>
              <TableCell>
                {currentRole.permissions.editPoliceSupport ? (
                  <Check className="text-green-600" />
                ) : (
                  <X className="text-red-600" />
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Добавление правовых мер</TableCell>
              <TableCell>
                {currentRole.permissions.addLegalMeasures ? (
                  <Check className="text-green-600" />
                ) : (
                  <X className="text-red-600" />
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Редактирование правовых мер</TableCell>
              <TableCell>
                {currentRole.permissions.editLegalMeasures ? (
                  <Check className="text-green-600" />
                ) : (
                  <X className="text-red-600" />
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Загрузка документов</TableCell>
              <TableCell>
                {currentRole.permissions.uploadDocuments ? (
                  <Check className="text-green-600" />
                ) : (
                  <X className="text-red-600" />
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Удаление документов</TableCell>
              <TableCell>
                {currentRole.permissions.deleteDocuments ? (
                  <Check className="text-green-600" />
                ) : (
                  <X className="text-red-600" />
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Просмотр отчетов</TableCell>
              <TableCell>
                {currentRole.permissions.viewReports ? (
                  <Check className="text-green-600" />
                ) : (
                  <X className="text-red-600" />
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Создание отчетов</TableCell>
              <TableCell>
                {currentRole.permissions.createReports ? (
                  <Check className="text-green-600" />
                ) : (
                  <X className="text-red-600" />
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Управление пользователями</TableCell>
              <TableCell>
                {currentRole.permissions.manageUsers ? (
                  <Check className="text-green-600" />
                ) : (
                  <X className="text-red-600" />
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
