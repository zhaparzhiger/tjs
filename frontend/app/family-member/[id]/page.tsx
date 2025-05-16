"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { UserRole } from "@/types/roles"
import type { FamilyMember } from "@/types/models"
import { FamilyService } from "@/services/family-service"

export default function FamilyMemberPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = React.use(paramsPromise);
  const searchParams = useSearchParams();
  const role = (searchParams.get("role") as UserRole) || "admin";
  const familyId = searchParams.get("familyId") || "";
  const router = useRouter();
  const { toast } = useToast();
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<FamilyMember>>({});

  useEffect(() => {
    async function fetchMember() {
      setLoading(true);
      try {
        const memberData = await FamilyService.getFamilyMemberById(params.id);
        if (memberData) {
          setMember(memberData);
          setFormData(memberData);
        } else {
          toast({
            title: "Ошибка",
            description: "Член семьи не найден",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        toast({
          title: "Ошибка",
          description: error.message || "Не удалось загрузить данные члена семьи",
          variant: "destructive",
        });
      }
      setLoading(false);
    }
    fetchMember();
  }, [params.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: Number.parseInt(value) || 0 }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    if (member && formData) {
      if (formData.iin && !/^\d{12}$/.test(formData.iin)) {
        toast({
          title: "Ошибка",
          description: "ИИН должен состоять из 12 цифр",
          variant: "destructive",
        });
        return;
      }
      try {
        const updatedMember = await FamilyService.updateFamilyMember(member.id, formData);
        if (updatedMember) {
          setMember(updatedMember);
          setIsEditing(false);
          toast({
            title: "Изменения сохранены",
            description: "Данные члена семьи успешно обновлены",
          });
        } else {
          toast({
            title: "Ошибка",
            description: "Не удалось сохранить изменения",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        toast({
          title: "Ошибка",
          description: error.message || "Не удалось сохранить изменения",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout role={role}>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <p>Загрузка данных...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!member) {
    return (
      <DashboardLayout role={role}>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <p>Член семьи не найден</p>
          <Button onClick={() => router.back()}>Вернуться назад</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={role}>
      <div className="flex-1 space-y-4 p-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">{member.name}</h2>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <Button size="sm" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Сохранить
              </Button>
            ) : (
              <Button size="sm" onClick={() => setIsEditing(true)}>
                Редактировать
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">ФИО</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="iin">ИИН</Label>
                <Input
                  id="iin"
                  value={formData.iin || ""}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="relation">Родственная связь</Label>
                {isEditing ? (
                  <Select
                    value={formData.relation}
                    onValueChange={(value) => handleSelectChange("relation", value)}
                  >
                    <SelectTrigger id="relation">
                      <SelectValue placeholder="Выберите связь" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Мать">Мать</SelectItem>
                      <SelectItem value="Отец">Отец</SelectItem>
                      <SelectItem value="Сын">Сын</SelectItem>
                      <SelectItem value="Дочь">Дочь</SelectItem>
                      <SelectItem value="Бабушка">Бабушка</SelectItem>
                      <SelectItem value="Дедушка">Дедушка</SelectItem>
                      <SelectItem value="Опекун">Опекун</SelectItem>
                      <SelectItem value="Другое">Другое</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={formData.relation || ""} readOnly />
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="age">Возраст</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age || 0}
                  onChange={handleNumberChange}
                  readOnly={!isEditing}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Статус</Label>
                {isEditing ? (
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Взрослый">Взрослый</SelectItem>
                      <SelectItem value="Студент">Студент</SelectItem>
                      <SelectItem value="Школьник">Школьник</SelectItem>
                      <SelectItem value="Дошкольник">Дошкольник</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={formData.status || ""} readOnly />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}