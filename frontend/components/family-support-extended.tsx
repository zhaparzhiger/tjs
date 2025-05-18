"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Edit, Trash2, AlertCircle, CheckCircle2, Clock, FileText, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FamilyService } from "@/services/family-service";
import type { Family, SupportMeasure } from "@/types/models";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/auth-context";

// Utility function to format ISO date to DD.MM.YYYY without timezone shift
const formatDate = (isoDate: string | undefined): string => {
  if (!isoDate) return "Дата отсутствует";
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return "Неверная дата";
    // Extract year, month, day directly to avoid timezone issues
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${day}.${month}.${year}`;
  } catch {
    return "Ошибка формата даты";
  }
};

interface FamilySupportExtendedProps {
  family: Pick<Family, "id" | "familyName">;
  role: string;
}

export function FamilySupportExtended({ family, role }: FamilySupportExtendedProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAddSupportOpen, setIsAddSupportOpen] = useState(false);
  const [isEditSupportOpen, setIsEditSupportOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [editingMeasure, setEditingMeasure] = useState<SupportMeasure | null>(null);
  const [supportType, setSupportType] = useState("social");
  const [activeTab, setActiveTab] = useState("social");
  const [supportMeasures, setSupportMeasures] = useState<SupportMeasure[]>([]);
  const isMobile = useIsMobile();

  // Form for add modal
  const addForm = useForm({
    defaultValues: {
      supportCategory: "social",
      supportType: "",
      status: "provided",
      amount: "",
      notes: "",
      "date-picker": new Date().toISOString().split("T")[0],
    },
  });

  // Form for edit modal
  const editForm = useForm({
    defaultValues: {
      supportCategory: "",
      supportType: "",
      status: "",
      amount: "",
      notes: "",
      "date-picker": "",
    },
  });

  // Reset edit form when editingMeasure changes
  useEffect(() => {
    if (editingMeasure && isEditSupportOpen) {
      console.log("Editing measure:", editingMeasure);
      const statusMap: { [key: string]: string } = {
        Оказано: "provided",
        "В процессе": "in-progress",
        Отказано: "rejected",
      };
      const dateStr = editingMeasure.date
        ? new Date(editingMeasure.date).toISOString().split("T")[0]
        : "";
      editForm.reset({
        supportCategory: editingMeasure.category || "social",
        supportType: editingMeasure.type || "",
        status: statusMap[editingMeasure.status] || "provided",
        amount: editingMeasure.amount || "",
        notes: editingMeasure.notes || "",
        "date-picker": dateStr,
      });
      console.log("Edit form reset with values:", editForm.getValues());
    }
  }, [editingMeasure, isEditSupportOpen, editForm]);

  useEffect(() => {
    if (!family.id) {
      toast({
        title: "Ошибка",
        description: "Идентификатор семьи отсутствует",
        variant: "destructive",
      });
      return;
    }

    const fetchSupportMeasures = async () => {
      try {
        console.log("Fetching support measures for familyId:", family.id);
        const data = await FamilyService.getFamilySupport(family.id);
        console.log("Fetched support measures:", data);
        // Log raw and formatted dates
        data.forEach((measure: SupportMeasure, index: number) => {
          console.log(`Measure ${index + 1} - ID: ${measure.id}, Raw Date: ${measure.date}, Formatted: ${formatDate(measure.date)}`);
        });
        setSupportMeasures(data);
      } catch (error: any) {
        console.error("Fetch error:", error);
        toast({
          title: "Ошибка",
          description: error.message || "Не удалось загрузить меры поддержки",
          variant: "destructive",
        });
      }
    };
    fetchSupportMeasures();
  }, [family.id, toast]);

  const handleAddSupport = async (data: any) => {
    console.log("handleAddSupport triggered with data:", data);

    if (!data.supportCategory || !data.supportType || !data.status) {
      console.error("Missing required fields:", data);
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля (категория, тип, статус)",
        variant: "destructive",
      });
      return;
    }

    const newMeasure: Omit<SupportMeasure, "id" | "createdAt"> = {
      familyId: family.id,
      category: data.supportCategory,
      type: data.supportType,
      amount: data.amount || "0",
      date: data["date-picker"]
        ? new Date(data["date-picker"]).toISOString()
        : new Date().toISOString(),
      status:
        data.status === "provided"
          ? "Оказано"
          : data.status === "in-progress"
          ? "В процессе"
          : "Отказано",
      notes: data.notes || "No description provided",
      createdBy: user?.fullName || user?.iin || "System",
    };

    try {
      console.log("Adding new support measure:", newMeasure);
      const createdMeasure = await FamilyService.addSupportMeasure(newMeasure, user?.id || "unknown");
      console.log("Created measure:", createdMeasure);
      setSupportMeasures([...supportMeasures, createdMeasure]);
      setIsAddSupportOpen(false);
      addForm.reset();
      toast({
        title: "Мера поддержки добавлена",
        description: "Новая мера поддержки успешно добавлена",
      });
    } catch (error: any) {
      console.error("Add support error:", error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось добавить меру поддержки",
        variant: "destructive",
      });
    }
  };

  const handleEditSupport = async (data: any) => {
    if (!editingMeasure) return;
    console.log("handleEditSupport triggered with data:", data);

    if (!data.supportCategory || !data.supportType || !data.status) {
      console.error("Missing required fields:", data);
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля (категория, тип, статус)",
        variant: "destructive",
      });
      return;
    }

    const updatedMeasure: SupportMeasure = {
      ...editingMeasure,
      category: data.supportCategory,
      type: data.supportType,
      amount: data.amount || "0",
      date: data["date-picker"]
        ? new Date(data["date-picker"]).toISOString()
        : editingMeasure.date,
      status:
        data.status === "provided"
          ? "Оказано"
          : data.status === "in-progress"
          ? "В процессе"
          : "Отказано",
      notes: data.notes || "No description provided",
    };

    try {
      console.log("Updating support measure:", updatedMeasure);
      const updated = await FamilyService.updateSupportMeasure(updatedMeasure, user?.id || "unknown");
      console.log("Updated measure:", updated);
      setSupportMeasures(
        supportMeasures.map((m) => (m.id === updatedMeasure.id ? updated : m))
      );
      setIsEditSupportOpen(false);
      setEditingMeasure(null);
      editForm.reset();
      toast({
        title: "Мера поддержки обновлена",
        description: "Мера поддержки успешно обновлена",
      });
    } catch (error: any) {
      console.error("Update support error:", error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить меру поддержки",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMeasure = async (measureId: string) => {
    console.log("handleDeleteMeasure triggered for measureId:", measureId);
    try {
      await FamilyService.deleteSupportMeasure(measureId);
      setSupportMeasures(supportMeasures.filter((m) => m.id !== measureId));
      toast({
        title: "Мера поддержки удалена",
        description: "Мера поддержки успешно удалена",
      });
    } catch (error: any) {
      console.error("Delete support error:", error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить меру поддержки",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Оказано":
        return (
          <Badge className="bg-green-600 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Оказано
          </Badge>
        );
      case "В процессе":
        return (
          <Badge className="bg-yellow-600 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            В процессе
          </Badge>
        );
      case "Отказано":
        return (
          <Badge className="bg-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Отказано
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const canEditSocial = ["admin", "district", "social"].includes(role);
  const canEditEducation = ["admin", "district", "school"].includes(role);
  const canEditHealth = ["admin", "district", "health"].includes(role);
  const canEditPolice = ["admin", "district", "police"].includes(role);
  const canEditLegal = ["admin", "district", "police"].includes(role);
  const canEditCharity = ["admin", "district", "social"].includes(role);

  const filteredSupport = (category: string) =>
    supportMeasures.filter((measure) => measure.category.toLowerCase() === category);

  const renderSupportTable = (supports: SupportMeasure[], canEdit: boolean) => {
    if (supports.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FileText className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium">Меры поддержки не найдены</h3>
          <p className="text-sm text-gray-500 mt-1">
            Добавьте новую меру поддержки, нажав на кнопку «Добавить меру поддержки»
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="rounded-md border desktop-support-table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Тип поддержки</TableHead>
                <TableHead>Сумма (тыс. тенге)</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supports.map((support) => {
                console.log(`Rendering measure ID: ${support.id}, Raw Date: ${support.date}, Formatted: ${formatDate(support.date)}`);
                return (
                  <TableRow key={support.id}>
                    <TableCell className="font-medium">{support.type}</TableCell>
                    <TableCell>{support.amount}</TableCell>
                    <TableCell>{formatDate(support.date)}</TableCell>
                    <TableCell>{getStatusBadge(support.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={!canEdit}
                          onClick={() => {
                            console.log("Edit button clicked for measure:", support.id, "Raw Date:", support.date, "Formatted:", formatDate(support.date));
                            setEditingMeasure(support);
                            setSupportType(support.category);
                            setIsEditSupportOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={!canEdit}
                          onClick={() => handleDeleteMeasure(support.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="mobile-support-cards">
          {supports.map((support) => (
            <div key={support.id} className="mobile-table-card">
              <div className="mobile-table-card-header">
                <div className="mobile-table-card-title">{support.type}</div>
                {getStatusBadge(support.status)}
              </div>
              <div className="mobile-table-card-row">
                <div className="mobile-table-card-label">Сумма:</div>
                <div className="mobile-table-card-value">{support.amount} тыс. тенге</div>
              </div>
              <div className="mobile-table-card-row">
                <div className="mobile-table-card-label">Дата:</div>
                <div className="mobile-table-card-value">{formatDate(support.date)}</div>
              </div>
              {support.notes && (
                <div className="mobile-table-card-row">
                  <div className="mobile-table-card-label">Примечания:</div>
                  <div className="mobile-table-card-value">{support.notes}</div>
                </div>
              )}
              <div className="mobile-table-card-actions">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canEdit}
                  onClick={() => {
                    console.log("Edit button clicked for measure:", support.id, "Raw Date:", support.date, "Formatted:", formatDate(support.date));
                    setEditingMeasure(support);
                    setSupportType(support.category);
                    setIsEditSupportOpen(true);
                  }}
                >
                  <Edit className="mr-1 h-4 w-4" />
                  Изменить
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canEdit}
                  onClick={() => handleDeleteMeasure(support.id)}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Удалить
                </Button>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  const categoryMap: { [key: string]: string } = {
    social: "Социальная защита",
    education: "Образование",
    health: "Здравоохранение",
    police: "Полиция",
    legal: "Правовые меры",
    charity: "Благотворительность",
  };

  const typeOptions: { [key: string]: { value: string; label: string }[] } = {
    social: [
      { value: "asp", label: "АСП" },
      { value: "zhp", label: "ЖП" },
      { value: "one-time", label: "Единовременная помощь" },
      { value: "fuel", label: "Социальная помощь на топливо" },
      { value: "charity", label: "Благотворительная помощь" },
      { value: "employment", label: "Трудоустройство" },
      { value: "ssu", label: "ССУ" },
    ],
    education: [
      { value: "vseobuch", label: "Всеобуч" },
      { value: "psychology", label: "Психологическая консультация" },
      { value: "kindergarten", label: "Постановка на очередь в ДДУ" },
      { value: "school", label: "Оформление в СОШ" },
    ],
    health: [
      { value: "attachment", label: "Прикрепление к медучреждению" },
      { value: "disability", label: "Установление инвалидности" },
      { value: "treatment", label: "Оказание лечения" },
      { value: "ambulatory", label: "Амбулаторное лечение" },
      { value: "stationary", label: "Стационарное лечение" },
      { value: "medical-facility", label: "Определение в медучреждение" },
    ],
    police: [
      { value: "prevention", label: "Профилактическая беседа" },
      { value: "registration", label: "Постановка на учет в ОВД" },
      { value: "involvement-act", label: "Акт привлечения" },
    ],
    legal: [
      { value: "restrictions", label: "Приняты ограничения в родительских правах" },
      { value: "deprivation", label: "Принято решение о лишении родительских прав" },
      { value: "kdn", label: "Рассмотрение на КДН" },
    ],
    charity: [
      { value: "financial", label: "Финансовая помощь" },
      { value: "material", label: "Материальная помощь" },
      { value: "clothing", label: "Одежда и обувь" },
      { value: "food", label: "Продукты питания" },
      { value: "school-supplies", label: "Школьные принадлежности" },
    ],
  };

  const renderSupportForm = (isEdit: boolean, measure?: SupportMeasure) => {
    const form = isEdit ? editForm : addForm;
    const onSubmit = isEdit ? handleEditSupport : handleAddSupport;

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <FormField
            control={form.control}
            name="supportCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="supportCategory">Категория</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSupportType(value);
                    }}
                  >
                    <SelectTrigger id="supportCategory">
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryMap).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="supportType"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="supportType">Тип поддержки</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="supportType">
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions[supportType].map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="amount">Сумма (тыс. тенге)</FormLabel>
                <FormControl>
                  <Input
                    id="amount"
                    type="text"
                    placeholder="0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date-picker"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="date-picker">Дата оказания</FormLabel>
                <FormControl>
                  <Input
                    id="date-picker"
                    type="date"
                    value={field.value}
                    onChange={(e) => {
                      console.log("Date input onChange:", e.target.value);
                      field.onChange(e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="status">Статус</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="provided">Оказано</SelectItem>
                      <SelectItem value="in-progress">В процессе</SelectItem>
                      <SelectItem value="rejected">Отказано</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="notes">Примечания</FormLabel>
                <FormControl>
                  <Textarea id="notes" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="submit">{isEdit ? "Сохранить" : "Добавить"}</Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Меры поддержки</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => setIsHistoryOpen(true)}>
              <History className="mr-2 h-4 w-4" />
              Хронология
            </Button>
            <Dialog open={isAddSupportOpen} onOpenChange={setIsAddSupportOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Добавить меру поддержки
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить меру поддержки</DialogTitle>
                  <DialogDescription>Заполните информацию о новой мере поддержки</DialogDescription>
                </DialogHeader>
                {renderSupportForm(false)}
              </DialogContent>
            </Dialog>
            <Dialog open={isEditSupportOpen} onOpenChange={setIsEditSupportOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Редактировать меру поддержки</DialogTitle>
                  <DialogDescription>Обновите информацию о мере поддержки</DialogDescription>
                </DialogHeader>
                {renderSupportForm(true, editingMeasure)}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="social" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
          <div className="scrollable-tabs-container">
            <TabsList className="scrollable-tabs-list">
              {Object.entries(categoryMap).map(([key, label]) => (
                <TabsTrigger key={key} value={key} className="scrollable-tab">
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="social">
            {isMobile ? (
              <div className="space-y-4">
                {filteredSupport("social").map((measure) => (
                  <div key={measure.id} className="support-card">
                    <div className="support-card-header">{measure.type}</div>
                    <div className="support-card-content">
                      <div className="support-card-item">
                        <span className="support-card-label">Дата:</span>
                        <span className="support-card-value">{formatDate(measure.date)}</span>
                      </div>
                      <div className="support-card-item">
                        <span className="support-card-label">Статус:</span>
                        <span className="support-card-value">{measure.status}</span>
                      </div>
                      <div className="support-card-item">
                        <span className="support-card-label">Сумма:</span>
                        <span className="support-card-value">{measure.amount} тыс. тенге</span>
                      </div>
                    </div>
                    <div className="support-card-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!canEditSocial}
                        onClick={() => {
                          console.log("Edit button clicked for measure:", measure.id, "Raw Date:", measure.date, "Formatted:", formatDate(measure.date));
                          setEditingMeasure(measure);
                          setSupportType(measure.category);
                          setIsEditSupportOpen(true);
                        }}
                      >
                        Изменить
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={!canEditSocial}
                        onClick={() => handleDeleteMeasure(measure.id)}
                      >
                        Удалить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              renderSupportTable(filteredSupport("social"), canEditSocial)
            )}
          </TabsContent>

          <TabsContent value="education">
            {isMobile ? (
              <div className="space-y-4">
                {filteredSupport("education").map((measure) => (
                  <div key={measure.id} className="support-card">
                    <div className="support-card-header">{measure.type}</div>
                    <div className="support-card-content">
                      <div className="support-card-item">
                        <span className="support-card-label">Дата:</span>
                        <span className="support-card-value">{formatDate(measure.date)}</span>
                      </div>
                      <div className="support-card-item">
                        <span className="support-card-label">Статус:</span>
                        <span className="support-card-value">{measure.status}</span>
                      </div>
                      <div className="support-card-item">
                        <span className="support-card-label">Сумма:</span>
                        <span className="support-card-value">{measure.amount} тыс. тенге</span>
                      </div>
                    </div>
                    <div className="support-card-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!canEditEducation}
                        onClick={() => {
                          console.log("Edit button clicked for measure:", measure.id, "Raw Date:", measure.date, "Formatted:", formatDate(measure.date));
                          setEditingMeasure(measure);
                          setSupportType(measure.category);
                          setIsEditSupportOpen(true);
                        }}
                      >
                        Изменить
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={!canEditEducation}
                        onClick={() => handleDeleteMeasure(measure.id)}
                      >
                        Удалить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              renderSupportTable(filteredSupport("education"), canEditEducation)
            )}
          </TabsContent>

          <TabsContent value="health">
            {isMobile ? (
              <div className="space-y-4">
                {filteredSupport("health").map((measure) => (
                  <div key={measure.id} className="support-card">
                    <div className="support-card-header">{measure.type}</div>
                    <div className="support-card-content">
                      <div className="support-card-item">
                        <span className="support-card-label">Дата:</span>
                        <span className="support-card-value">{formatDate(measure.date)}</span>
                      </div>
                      <div className="support-card-item">
                        <span className="support-card-label">Статус:</span>
                        <span className="support-card-value">{measure.status}</span>
                      </div>
                      <div className="support-card-item">
                        <span className="support-card-label">Сумма:</span>
                        <span className="support-card-value">{measure.amount} тыс. тенге</span>
                      </div>
                    </div>
                    <div className="support-card-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!canEditHealth}
                        onClick={() => {
                          console.log("Edit button clicked for measure:", measure.id, "Raw Date:", measure.date, "Formatted:", formatDate(measure.date));
                          setEditingMeasure(measure);
                          setSupportType(measure.category);
                          setIsEditSupportOpen(true);
                        }}
                      >
                        Изменить
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={!canEditHealth}
                        onClick={() => handleDeleteMeasure(measure.id)}
                      >
                        Удалить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              renderSupportTable(filteredSupport("health"), canEditHealth)
            )}
          </TabsContent>

          <TabsContent value="police">
            {isMobile ? (
              <div className="space-y-4">
                {filteredSupport("police").map((measure) => (
                  <div key={measure.id} className="support-card">
                    <div className="support-card-header">{measure.type}</div>
                    <div className="support-card-content">
                      <div className="support-card-item">
                        <span className="support-card-label">Дата:</span>
                        <span className="support-card-value">{formatDate(measure.date)}</span>
                      </div>
                      <div className="support-card-item">
                        <span className="support-card-label">Статус:</span>
                        <span className="support-card-value">{measure.status}</span>
                      </div>
                      <div className="support-card-item">
                        <span className="support-card-label">Сумма:</span>
                        <span className="support-card-value">{measure.amount} тыс. тенге</span>
                      </div>
                    </div>
                    <div className="support-card-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!canEditPolice}
                        onClick={() => {
                          console.log("Edit button clicked for measure:", measure.id, "Raw Date:", measure.date, "Formatted:", formatDate(measure.date));
                          setEditingMeasure(measure);
                          setSupportType(measure.category);
                          setIsEditSupportOpen(true);
                        }}
                      >
                        Изменить
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={!canEditPolice}
                        onClick={() => handleDeleteMeasure(measure.id)}
                      >
                        Удалить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              renderSupportTable(filteredSupport("police"), canEditPolice)
            )}
          </TabsContent>

          <TabsContent value="legal">
            {isMobile ? (
              <div className="space-y-4">
                {filteredSupport("legal").map((measure) => (
                  <div key={measure.id} className="support-card">
                    <div className="support-card-header">{measure.type}</div>
                    <div className="support-card-content">
                      <div className="support-card-item">
                        <span className="support-card-label">Дата:</span>
                        <span className="support-card-value">{formatDate(measure.date)}</span>
                      </div>
                      <div className="support-card-item">
                        <span className="support-card-label">Статус:</span>
                        <span className="support-card-value">{measure.status}</span>
                      </div>
                      <div className="support-card-item">
                        <span className="support-card-label">Сумма:</span>
                        <span className="support-card-value">{measure.amount} тыс. тенге</span>
                      </div>
                    </div>
                    <div className="support-card-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!canEditLegal}
                        onClick={() => {
                          console.log("Edit button clicked for measure:", measure.id, "Raw Date:", measure.date, "Formatted:", formatDate(measure.date));
                          setEditingMeasure(measure);
                          setSupportType(measure.category);
                          setIsEditSupportOpen(true);
                        }}
                      >
                        Изменить
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={!canEditLegal}
                        onClick={() => handleDeleteMeasure(measure.id)}
                      >
                        Удалить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              renderSupportTable(filteredSupport("legal"), canEditLegal)
            )}
          </TabsContent>

          <TabsContent value="charity">
            {isMobile ? (
              <div className="space-y-4">
                {filteredSupport("charity").map((measure) => (
                  <div key={measure.id} className="support-card">
                    <div className="support-card-header">{measure.type}</div>
                    <div className="support-card-content">
                      <div className="support-card-item">
                        <span className="support-card-label">Дата:</span>
                        <span className="support-card-value">{formatDate(measure.date)}</span>
                      </div>
                      <div className="support-card-item">
                        <span className="support-card-label">Статус:</span>
                        <span className="support-card-value">{measure.status}</span>
                      </div>
                      <div className="support-card-item">
                        <span className="support-card-label">Сумма:</span>
                        <span className="support-card-value">{measure.amount} тыс. тенге</span>
                      </div>
                    </div>
                    <div className="support-card-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!canEditCharity}
                        onClick={() => {
                          console.log("Edit button clicked for measure:", measure.id, "Raw Date:", measure.date, "Formatted:", formatDate(measure.date));
                          setEditingMeasure(measure);
                          setSupportType(measure.category);
                          setIsEditSupportOpen(true);
                        }}
                      >
                        Изменить
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={!canEditCharity}
                        onClick={() => handleDeleteMeasure(measure.id)}
                      >
                        Удалить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              renderSupportTable(filteredSupport("charity"), canEditCharity)
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Хронология мер поддержки</DialogTitle>
              <DialogDescription>История всех оказанных мер поддержки для данной семьи</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                {supportMeasures.map((item, index) => (
                  <div key={item.id} className="relative pl-10 pb-8">
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                      {index + 1}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{item.type}</h4>
                          <p className="text-sm text-gray-500">
                            Категория: {categoryMap[item.category.toLowerCase()] || item.category}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatDate(item.date)}</p>
                          <p className="text-xs text-gray-500">Автор: {item.createdBy}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <p className="text-sm">
                          {item.amount && item.amount !== "0" ? `Сумма: ${item.amount} тыс. тенге` : "Без финансирования"}
                        </p>
                        {getStatusBadge(item.status)}
                      </div>
                      {item.notes && (
                        <p className="mt-2 text-sm text-gray-600 bg-gray-100 p-2 rounded">Примечание: {item.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}