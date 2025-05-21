"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FamilyDetailsExtended } from "@/components/family-details-extended"
import { FamilyMembersExtended } from "@/components/family-members-extended"
import { FamilySupportExtended } from "@/components/family-support-extended"
import { FamilyDocuments } from "@/components/family-documents"
import { FamilyHistory } from "@/components/family-history"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Printer, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import type { UserRole } from "@/types/roles"
import type { Family } from "@/types/models"
import { Badge } from "@/components/ui/badge"
import { use } from "react"

export default function FamilyPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const role = (user?.role?.toLowerCase() as UserRole) || "admin"
  const [family, setFamily] = useState<Family | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Unwrap params using React.use
  const { id } = use(params)

  useEffect(() => {
    const fetchFamily = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/families/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to load family data")
        }

        const data = await response.json()
        console.log("Data is", data)
        const mappedFamily: Family = {
          id: data.id,
          name: data.familyName,
          iin: data.caseNumber,
          address: data.address,
          registrationAddress: data.registrationAddress || data.address,
          status: data.status,
          settingReason: data.settingReason || "",
          tzhsReason: data.tzhsReason || "",
          nbReason: data.nbReason || "",
          inspectionStatus: data.inspectionStatus || "not-inspected",
          familyType: data.familyType || "full",
          children: data.children || 0,
          housingType: data.housingType || "apartment",
          employment: data.employment || "employed-official",
          workplace: data.workplace || "",
          familyIncome: data.familyIncome || "",
          needsSupport: data.needsSupport || false,
          needsEducation: data.needsEducation || false,
          needsHealth: data.needsHealth || false,
          needsPolice: data.needsPolice || false,
          hasDisability: data.hasDisability || false,
          isActive: data.isActive !== false,
          inactiveReason: data.inactiveReason || "",
          notes: data.notes || "",
          region: data.region || "",
          district: data.district || "",
          city: data.city || "",
          riskLevel: data.riskLevel || "",
          riskFactors: data.riskFactors || "",
          socialBenefits: data.socialBenefits || "",
          contactPhone: data.contactPhone || "",
          contactEmail: data.contactEmail || "",
          hasInterpreterNeeded: data.hasInterpreterNeeded || false,
          lastUpdate: new Date(data.lastUpdate).toLocaleDateString(),
        }
        setFamily(mappedFamily)
      } catch (err: any) {
        console.error("Error fetching family:", err)
        setError(err.message || "Failed to load family data")
        toast({
          title: "Ошибка",
          description: err.message || "Не удалось загрузить данные семьи",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFamily()
  }, [id])

  const handleSave = async () => {
    if (!family) return

    try {
      const payload = {
        familyName: family.name,
        caseNumber: family.iin,
        address: family.address,
        registrationAddress: family.registrationAddress,
        status: family.status,
        statusReason: family.statusReason,
        tzhsReason: family.tzhsReason,
        nbReason: family.nbReason,
        inspectionStatus: family.inspectionStatus,
        familyType: family.familyType,
        housingType: family.housingType,
        employment: family.employment,
        workplace: family.workplace,
        familyIncome: family.familyIncome,
        needsSupport: family.needsSupport,
        needsEducation: family.needsEducation,
        needsHealth: family.needsHealth,
        needsPolice: family.needsPolice,
        hasDisability: family.hasDisability,
        isActive: family.isActive,
        inactiveReason: family.inactiveReason,
        notes: family.notes,
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/families/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update family")
      }

      const updated = await response.json()
      const updatedFamily: Family = {
        id: updated.id,
        name: updated.familyName,
        iin: updated.caseNumber,
        address: updated.address,
        registrationAddress: updated.registrationAddress || updated.address,
        status: updated.status,
        statusReason: updated.statusReason || "",
        tzhsReason: updated.tzhsReason || "",
        nbReason: updated.nbReason || "",
        inspectionStatus: updated.inspectionStatus || "not-inspected",
        familyType: updated.familyType || "full",
        children: updated._count?.members || family.children,
        housingType: updated.housingType || "apartment",
        employment: updated.employment || "employed-official",
        workplace: updated.workplace || "",
        familyIncome: updated.familyIncome || "",
        needsSupport: updated.needsSupport || false,
        needsEducation: updated.needsEducation || false,
        needsHealth: updated.needsHealth || false,
        needsPolice: updated.needsPolice || false,
        hasDisability: updated.hasDisability || false,
        isActive: updated.isActive !== false,
        inactiveReason: updated.inactiveReason || "",
        notes: updated.notes || "",
        lastUpdate: new Date(updated.lastUpdate).toLocaleDateString(),
      }
      setFamily(updatedFamily)

      toast({
        title: "Изменения сохранены",
        description: "Данные семьи успешно обновлены",
      })
    } catch (err: any) {
      console.error("Error updating family:", err)
      toast({
        title: "Ошибка",
        description: err.message || "Не удалось сохранить изменения",
        variant: "destructive",
      })
    }
  }

  const handlePrint = () => {
    window.print()
    toast({
      title: "Печать",
      description: "Документ отправлен на печать",
    })
  }

  const handleRestore = async () => {
    if (!family) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/families/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ isActive: true, inactiveReason: "" }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to restore family")
      }

      const updated = await response.json()
      const restoredFamily: Family = {
        ...family,
        isActive: true,
        inactiveReason: "",
        lastUpdate: new Date(updated.lastUpdate).toLocaleDateString(),
      }
      setFamily(restoredFamily)
      toast({
        title: "Семья восстановлена",
        description: "Семья успешно восстановлена и перемещена в активные",
      })
    } catch (err: any) {
      console.error("Error restoring family:", err)
      toast({
        title: "Ошибка",
        description: err.message || "Не удалось восстановить семью",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <DashboardLayout role={role}>
        <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
          <p>Загрузка данных...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !family) {
    return (
      <DashboardLayout role={role}>
        <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
          <p>{error || "Семья не найдена"}</p>
          <Button onClick={() => router.back()}>Вернуться назад</Button>
        </div>
      </DashboardLayout>
    )
  }

  const handleFamilyUpdate = (updatedFamily: Family) => {
    setFamily(updatedFamily)
  }

  return (
    <DashboardLayout role={role}>
      <div className="flex-1 space-y-4 animate-fade-in w-full max-w-full overflow-x-hidden p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div className="flex items-center gap-2 max-w-full">
            <Button variant="outline" size="icon" onClick={() => router.back()} className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">{family.name}</h2>
            {!family.isActive && (
              <Badge variant="destructive" className="ml-2 shrink-0">
                Выбыла
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2 self-start">
            {!family.isActive && (
              <Button variant="outline" size="sm" onClick={handleRestore} className="h-9 whitespace-nowrap">
                <RefreshCw className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Восстановить</span>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handlePrint} className="h-9 whitespace-nowrap">
              <Printer className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Печать</span>
            </Button>
            <Button size="sm" onClick={handleSave} className="h-9 whitespace-nowrap">
              <Save className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Сохранить</span>
            </Button>
          </div>
        </div>

        <div className="w-full max-w-full">
          <Tabs defaultValue="details" className="w-full">
            <div className="w-full overflow-x-auto pb-1 no-scrollbar">
              <TabsList className="w-max min-w-full flex">
                <TabsTrigger value="details" className="flex-1 whitespace-nowrap">
                  Основная информация
                </TabsTrigger>
                <TabsTrigger value="members" className="flex-1 whitespace-nowrap">
                  Члены семьи
                </TabsTrigger>
                <TabsTrigger value="support" className="flex-1 whitespace-nowrap">
                  Меры поддержки
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex-1 whitespace-nowrap">
                  Документы
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1 whitespace-nowrap">
                  История
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="details" className="mt-4">
              <FamilyDetailsExtended family={family} onUpdate={handleFamilyUpdate} role={role} />
            </TabsContent>

            <TabsContent value="members" className="mt-4">
              <FamilyMembersExtended family={family} role={role} />
            </TabsContent>

            <TabsContent value="support" className="mt-4">
              <FamilySupportExtended family={family} role={role} />
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <FamilyDocuments family={family} role={role} />
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <FamilyHistory family={family} role={role} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  )
}
