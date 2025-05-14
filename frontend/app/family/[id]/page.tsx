"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FamilyDetailsExtended } from "@/components/family-details-extended"
import { FamilyMembersExtended } from "@/components/family-members-extended"
import { FamilySupportExtended } from "@/components/family-support-extended"
import { FamilyDocuments } from "@/components/family-documents"
import { FamilyHistory } from "@/components/family-history"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Printer, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { families } from "@/data/families"
import type { UserRole } from "@/types/roles"
import { FamilyService } from "@/services/family-service"
import { Badge } from "@/components/ui/badge"

export default function FamilyPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const role = (searchParams.get("role") as UserRole) || "admin"
  const router = useRouter()
  const { toast } = useToast()
  const [family, setFamily] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Получаем данные семьи из localStorage
    const familyData = FamilyService.getFamilyById(Number.parseInt(params.id))

    if (familyData) {
      setFamily(familyData)
    } else {
      // Если семья не найдена, используем демо-данные
      const demoFamily = families.find((f) => f.id.toString() === params.id)
      setFamily(demoFamily || null)
    }

    setLoading(false)
  }, [params.id])

  const handleSave = () => {
    if (family) {
      // Обновляем семью в localStorage
      const updatedFamily = FamilyService.updateFamily(family.id, family, "Текущий пользователь")

      if (updatedFamily) {
        toast({
          title: "Изменения сохранены",
          description: "Данные семьи успешно обновлены",
        })
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось сохранить изменения",
          variant: "destructive",
        })
      }
    }
  }

  const handlePrint = () => {
    toast({
      title: "Печать",
      description: "Документ отправлен на печать",
    })
  }

  const handleRestore = () => {
    if (family) {
      // Восстанавливаем семью
      const restoredFamily = FamilyService.restoreFamily(family.id)

      if (restoredFamily) {
        setFamily(restoredFamily)
        toast({
          title: "Семья восстановлена",
          description: "Семья успешно восстановлена и перемещена в активные",
        })
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось восстановить семью",
          variant: "destructive",
        })
      }
    }
  }

  if (loading) {
    return (
      <DashboardLayout role={role}>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <p>Загрузка данных...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!family) {
    return (
      <DashboardLayout role={role}>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <p>Семья не найдена</p>
          <Button onClick={() => router.back()}>Вернуться назад</Button>
        </div>
      </DashboardLayout>
    )
  }

  const handleFamilyUpdate = (updatedFamily: any) => {
    setFamily(updatedFamily)
  }

  return (
    <DashboardLayout role={role}>
      <div className="flex-1 space-y-4 animate-fade-in w-full max-w-full overflow-x-hidden">
        <div className="family-page-header">
          <div className="family-page-title">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-3xl font-bold tracking-tight truncate">{family.name}</h2>
            {!family.isActive && (
              <Badge variant="destructive" className="ml-2">
                Выбыла
              </Badge>
            )}
          </div>
          <div className="family-page-actions">
            {!family.isActive && (
              <Button variant="outline" size="sm" onClick={handleRestore}>
                <RefreshCw className="mr-2 h-4 w-4" />
                <span className="hide-on-small">Восстановить</span>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              <span className="hide-on-small">Печать</span>
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              <span className="hide-on-small">Сохранить</span>
            </Button>
          </div>
        </div>

        <div className="tabs-list-container">
          <div className="family-tabs-container">
            <Tabs defaultValue="details" className="w-full">
              <div className="family-tabs-list">
                <TabsList className="w-full">
                  <TabsTrigger value="details" className="family-tab">
                    Основная информация
                  </TabsTrigger>
                  <TabsTrigger value="members" className="family-tab">
                    Члены семьи
                  </TabsTrigger>
                  <TabsTrigger value="support" className="family-tab">
                    Меры поддержки
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="family-tab">
                    Документы
                  </TabsTrigger>
                  <TabsTrigger value="history" className="family-tab">
                    История
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="details">
                <FamilyDetailsExtended family={family} onUpdate={handleFamilyUpdate} role={role} />
              </TabsContent>

              <TabsContent value="members">
                <FamilyMembersExtended family={family} role={role} />
              </TabsContent>

              <TabsContent value="support">
                <FamilySupportExtended family={family} role={role} />
              </TabsContent>

              <TabsContent value="documents">
                <FamilyDocuments family={family} role={role} />
              </TabsContent>

              <TabsContent value="history">
                <FamilyHistory family={family} role={role} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
