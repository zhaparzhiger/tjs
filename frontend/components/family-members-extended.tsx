"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Trash2, UserPlus, Eye, Filter, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/types/roles";
import type { FamilyMember } from "@/types/models";

interface FamilyMembersExtendedProps {
  family: { id: string; name: string; iin: string };
  role: UserRole;
}

export function FamilyMembersExtended({ family, role }: FamilyMembersExtendedProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("Взрослый");
  const [selectedRelation, setSelectedRelation] = useState<string>(""); // New state for relationship

  useEffect(() => {
    const fetchMembers = async () => {
      if (!family.id) {
        setError("Invalid family ID");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setMembers([]);
      try {
        const response = await fetch(`http://localhost:5555/api/family-members/family/${family.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch family members");
        }

        const fetchedMembers = await response.json();
        const mappedMembers: FamilyMember[] = fetchedMembers.map((member: any) => ({
          id: member.id,
          familyId: member.familyId,
          name: `${member.firstName} ${member.lastName}${member.middleName ? ` ${member.middleName}` : ""}`,
          iin: member.documentNumber || "",
          relation: member.relationship || "Не указано",
          age: member.birthDate
            ? Math.floor(
                (new Date().getTime() - new Date(member.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365)
              )
            : 0,
          status: member.status || determineStatus(member),
          registrationAddress: member.registrationAddress || member.family?.address || "",
          idCardNumber: member.documentNumber || "",
          idCardIssueDate: member.documentIssueDate || "",
          idCardExpiryDate: member.documentExpiryDate || "",
          school: member.education || "",
          grade: member.grade || "",
          institution: member.institution || "",
          course: member.course || "",
          funding: member.funding || "",
          meals: member.meals || "",
          notes: member.notes || "",
        }));

        const uniqueMembers = Array.from(
          new Map(mappedMembers.map((member) => [member.id, member])).values()
        );
        console.log("Fetched unique members:", uniqueMembers);
        setMembers(uniqueMembers);
      } catch (err: any) {
        console.error("Error fetching family members:", err);
        setError(err.message || "Не удалось загрузить членов семьи");
        toast({
          title: "Ошибка",
          description: err.message || "Не удалось загрузить членов семьи",
          variant: "destructive",
        });

        if (err.message.includes("Unauthorized")) {
          localStorage.removeItem("auth_token");
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [family.id, router, toast]);

  const determineStatus = (member: any): string => {
    if (member.status) {
      return member.status;
    }
    if (member.formStatus) {
      return member.formStatus;
    }
    if (member.grade || (member.education && member.education.toLowerCase().includes("школа"))) {
      return "Школьник";
    }
    if (member.institution || (member.education && member.education.toLowerCase().includes("университет"))) {
      return "Студент";
    }
    if (member.age <= 6) {
      return "Дошкольник";
    }
    return "Взрослый";
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleAddMember started");

    try {
      const form = e.target as HTMLFormElement;
      console.log("Form element:", form);

      // Capture inputs
      const nameInput = (form.querySelector("#name") as HTMLInputElement)?.value?.trim();
      const nameParts = nameInput ? nameInput.split(/\s+/).filter(Boolean) : [];
      const firstName = nameParts[0] || "";
      const lastName = nameParts[1] || "";
      const middleName = nameParts.slice(2).join(" ") || null;
      const documentNumber = (form.querySelector("#iin") as HTMLInputElement)?.value?.trim();
      const relationship = selectedRelation; // Use state instead of DOM query
      const ageInput = (form.querySelector("#age") as HTMLInputElement)?.value;
      const age = ageInput ? parseInt(ageInput, 10) : NaN;
      const statusElement = form.querySelector("#status") as HTMLSelectElement;
      const status = statusElement?.value || selectedStatus;
      const registrationAddress = (form.querySelector("#registrationAddress") as HTMLInputElement)?.value?.trim();
      const genderElement = form.querySelector("#gender") as HTMLSelectElement;
      const gender = genderElement?.value;

      // Conditional fields
      const idCardNumber = (form.querySelector("#idCardNumber") as HTMLInputElement)?.value?.trim();
      const idCardNotes = (form.querySelector("#idCardNotes") as HTMLInputElement)?.value?.trim();
      const school = (form.querySelector("#school") as HTMLInputElement)?.value?.trim();
      const grade = (form.querySelector("#grade") as HTMLInputElement)?.value?.trim();
      const institution = (form.querySelector("#institution") as HTMLInputElement)?.value?.trim();
      const course = (form.querySelector("#course") as HTMLInputElement)?.value?.trim();
      const fundingElement = form.querySelector("#funding") as HTMLSelectElement;
      const funding = fundingElement?.value;
      const mealsElement = form.querySelector("#meals") as HTMLSelectElement;
      const meals = mealsElement?.value;

      console.log("Form inputs:", {
        firstName,
        lastName,
        middleName,
        documentNumber,
        relationship,
        age,
        status,
        registrationAddress,
        gender,
        idCardNumber,
        idCardNotes,
        school,
        grade,
        institution,
        course,
        funding,
        meals,
      });

      // Validate inputs
      if (!nameInput || !firstName || !lastName) {
        console.log("Validation failed: Invalid name");
        toast({
          title: "Ошибка",
          description: "Введите полное ФИО (имя и фамилия обязательны)",
          variant: "destructive",
        });
        return;
      }
      if (!documentNumber || !/^\d{12}$/.test(documentNumber)) {
        console.log("Validation failed: Invalid documentNumber");
        toast({
          title: "Ошибка",
          description: "ИИН должен состоять из 12 цифр",
          variant: "destructive",
        });
        return;
      }
      if (!family?.id) {
        console.log("Validation failed: No family ID");
        toast({
          title: "Ошибка",
          description: "Семья не найдена. Пожалуйста, выберите семью.",
          variant: "destructive",
        });
        return;
      }
      if (!relationship) {
        console.log("Validation failed: No relationship");
        toast({
          title: "Ошибка",
          description: "Выберите родственную связь",
          variant: "destructive",
        });
        return;
      }
      if (!status || !["Взрослый", "Студент", "Школьник", "Дошкольник"].includes(status)) {
        console.log("Validation failed: Invalid status");
        toast({
          title: "Ошибка",
          description: "Выберите корректный статус (Взрослый, Студент, Школьник, Дошкольник)",
          variant: "destructive",
        });
        return;
      }
      if (isNaN(age) || age < 0 || age > 150) {
        console.log("Validation failed: Invalid age");
        toast({
          title: "Ошибка",
          description: "Введите корректный возраст (от 0 до 150 лет)",
          variant: "destructive",
        });
        return;
      }

      console.log("Validation passed");

      const birthDate = new Date(new Date().setFullYear(new Date().getFullYear() - age)).toISOString();
      if (!birthDate || birthDate === "Invalid Date") {
        console.log("Validation failed: Invalid birthDate");
        toast({
          title: "Ошибка",
          description: "Невозможно вычислить дату рождения",
          variant: "destructive",
        });
        return;
      }

      const newMember: any = {
        familyId: family.id,
        firstName,
        lastName,
        middleName,
        documentNumber,
        relationship,
        birthDate,
        registrationAddress: registrationAddress || null,
        gender: gender || null,
        status,
        formStatus: status,
      };

      if (status === "Взрослый") {
        newMember.documentType = "Удостоверение личности";
        newMember.idCardNumber = idCardNumber || documentNumber;
        newMember.notes = idCardNotes || null;
      } else if (status === "Школьник") {
        newMember.education = school || null;
        newMember.grade = grade || null;
      } else if (status === "Студент") {
        newMember.institution = institution || null;
        newMember.course = course || null;
        newMember.funding = funding || null;
      } else if (status === "Дошкольник") {
        newMember.meals = meals || null;
      }

      console.log("Sending newMember:", newMember);

      const response = await fetch(`http://localhost:5555/api/family-members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(newMember),
      });

      console.log("Fetch response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Fetch error data:", errorData);
        throw new Error(errorData.message || "Failed to create family member");
      }

      const createdMember = await response.json();
      console.log("Backend response:", createdMember);

      const relationshipDisplayMap: { [key: string]: string } = {
        mother: "Мать",
        father: "Отец",
        son: "Сын",
        daughter: "Дочь",
        grandmother: "Бабушка",
        grandfather: "Дедушка",
        guardian: "Опекун",
        other: "Другое",
      };

      const mappedMember: FamilyMember = {
        id: createdMember.id,
        familyId: createdMember.familyId,
        name: `${createdMember.firstName} ${createdMember.lastName}${
          createdMember.middleName ? ` ${createdMember.middleName}` : ""
        }`,
        iin: createdMember.documentNumber || "",
        relation: relationshipDisplayMap[createdMember.relationship] || "Не указано",
        age: createdMember.birthDate
          ? Math.floor(
              (new Date().getTime() - new Date(createdMember.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365)
            )
          : 0,
        status: createdMember.status || determineStatus({ ...createdMember, formStatus: status }),
        registrationAddress: createdMember.registrationAddress || createdMember.family?.address || "",
        idCardNumber: createdMember.idCardNumber || createdMember.documentNumber || "",
        idCardIssueDate: createdMember.documentIssueDate || "",
        idCardExpiryDate: createdMember.documentExpiryDate || "",
        school: createdMember.education || "",
        grade: createdMember.grade || "",
        institution: createdMember.institution || "",
        course: createdMember.course || "",
        funding: createdMember.funding || "",
        meals: createdMember.meals || "",
        notes: createdMember.notes || "",
      };

      setMembers((prev) => {
        const updatedMembers = prev.filter((m) => m.id !== mappedMember.id);
        console.log("Adding new member:", mappedMember);
        return [...updatedMembers, mappedMember];
      });
      setIsAddMemberOpen(false);
      setSelectedRelation(""); // Reset relationship
      toast({
        title: "Член семьи добавлен",
        description: "Новый член семьи успешно добавлен",
        variant: "default",
      });
    } catch (err: any) {
      console.error("Error adding family member:", err);
      let errorMessage = err.message || "Не удалось добавить члена семьи";
      if (err.message.includes("Family not found")) {
        errorMessage = "Семья не найдена.";
      } else if (err.message.includes("document number already exists")) {
        errorMessage = "Член семьи с таким ИИН уже существует.";
      } else if (err.message.includes("Invalid status")) {
        errorMessage = "Неверный статус. Выберите: Взрослый, Студент, Школьник, Дошкольник.";
      } else if (err.message.includes("Relationship is required")) {
        errorMessage = "Выберите родственную связь.";
      } else if (err.message.includes("Invalid data provided")) {
        errorMessage = "Неверные данные. Пожалуйста, проверьте введенную информацию.";
      }
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5555/api/family-members/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete family member");
      }

      setMembers((prev) => prev.filter((member) => member.id !== id));
      toast({
        title: "Член семьи удален",
        description: "Член семьи успешно удален из списка",
        variant: "default",
      });
    } catch (err: any) {
      console.error("Error deleting family member:", err);
      toast({
        title: "Ошибка",
        description: err.message || "Не удалось удалить члена семьи",
        variant: "destructive",
      });
    }
  };

  const handleViewMember = (member: FamilyMember) => {
    router.push(`/family-member/${member.id}?role=${role}&familyId=${family.id}`);
  };

  const handleUploadDocuments = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploadOpen(false);
    toast({
      title: "Документы загружены",
      description: "Документы успешно загружены",
      variant: "default",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Школьник":
        return <Badge className="bg-blue-600">Школьник</Badge>;
      case "Дошкольник":
        return <Badge className="bg-green-600">Дошкольник</Badge>;
      case "Студент":
        return <Badge className="bg-purple-600">Студент</Badge>;
      case "Взрослый":
        return <Badge variant="outline">Взрослый</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredMembers = activeFilter === "all" ? members : members.filter((member) => member.status === activeFilter);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <p>Загрузка членов семьи...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Члены семьи: {family.name}</CardTitle>
          <div className="flex space-x-2">
            <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Добавить члена семьи
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Добавить члена семьи</DialogTitle>
                  <DialogDescription>Заполните информацию о новом члене семьи для {family.name}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddMember}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">ФИО</Label>
                      <Input
                        id="name"
                        required
                        placeholder="Иванов Иван Иванович"
                        onInvalid={(e) => e.currentTarget.setCustomValidity("Введите имя и фамилию")}
                        onInput={(e) => e.currentTarget.setCustomValidity("")}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="iin">ИИН</Label>
                      <Input
                        id="iin"
                        required
                        placeholder="12 цифр"
                        pattern="\d{12}"
                        onInvalid={(e) => e.currentTarget.setCustomValidity("ИИН должен состоять из 12 цифр")}
                        onInput={(e) => e.currentTarget.setCustomValidity("")}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="relation">Родственная связь</Label>
                      <Select
                        name="relation"
                        value={selectedRelation}
                        onValueChange={(value) => {
                          console.log("Selected relationship:", value);
                          setSelectedRelation(value);
                        }}
                        required
                      >
                        <SelectTrigger id="relation">
                          <SelectValue placeholder="Выберите связь" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mother">Мать</SelectItem>
                          <SelectItem value="father">Отец</SelectItem>
                          <SelectItem value="son">Сын</SelectItem>
                          <SelectItem value="daughter">Дочь</SelectItem>
                          <SelectItem value="grandmother">Бабушка</SelectItem>
                          <SelectItem value="grandfather">Дедушка</SelectItem>
                          <SelectItem value="guardian">Опекун</SelectItem>
                          <SelectItem value="other">Другое</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="age">Возраст</Label>
                      <Input
                        id="age"
                        type="number"
                        required
                        placeholder="Возраст в годах"
                        min="0"
                        max="150"
                        onInvalid={(e) => e.currentTarget.setCustomValidity("Введите возраст от 0 до 150 лет")}
                        onInput={(e) => e.currentTarget.setCustomValidity("")}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="registrationAddress">Адрес прописки</Label>
                      <Input id="registrationAddress" placeholder="Введите адрес прописки" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="gender">Пол</Label>
                      <Select name="gender" defaultValue="male">
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Выберите пол" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Мужской</SelectItem>
                          <SelectItem value="female">Женский</SelectItem>
                          <SelectItem value="other">Другое</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Статус</Label>
                      <Select
                        value={selectedStatus}
                        onValueChange={(value) => {
                          console.log("Selected status:", value);
                          setSelectedStatus(value);
                        }}
                        name="status"
                        required
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
                    </div>
                    {selectedStatus === "Взрослый" && (
                      <>
                        <div className="grid gap-2">
                          <Label htmlFor="idCardNumber">Номер удостоверения личности</Label>
                          <Input id="idCardNumber" placeholder="Введите номер удостоверения" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="idCardNotes">Примечания к удостоверению</Label>
                          <Input id="idCardNotes" placeholder="Например: утеряно, сгорело и т.д." />
                        </div>
                      </>
                    )}
                    {selectedStatus === "Школьник" && (
                      <>
                        <div className="grid gap-2">
                          <Label htmlFor="school">Школа</Label>
                          <Input id="school" placeholder="Например: СОШ №25" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="grade">Класс</Label>
                          <Input id="grade" placeholder="Например: 6" />
                        </div>
                      </>
                    )}
                    {selectedStatus === "Студент" && (
                      <>
                        <div className="grid gap-2">
                          <Label htmlFor="institution">Учебное заведение</Label>
                          <Input id="institution" placeholder="Например: КазНУ" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="course">Курс</Label>
                          <Input id="course" placeholder="Например: 2" type="number" min="1" max="6" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="funding">Форма обучения</Label>
                          <Select name="funding" defaultValue="budget">
                            <SelectTrigger id="funding">
                              <SelectValue placeholder="Выберите форму обучения" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="budget">Бюджет</SelectItem>
                              <SelectItem value="paid">Платное</SelectItem>
                              <SelectItem value="grant">Грант</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                    {selectedStatus === "Дошкольник" && (
                      <div className="grid gap-2">
                        <Label htmlFor="meals">Питание</Label>
                        <Select name="meals" defaultValue="free">
                          <SelectTrigger id="meals">
                            <SelectValue placeholder="Выберите тип питания" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Бесплатное</SelectItem>
                            <SelectItem value="paid">Платное</SelectItem>
                            <SelectItem value="none">Не получает</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      onClick={() => console.log("Submit button clicked")}
                    >
                      Добавить
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Tabs defaultValue="all" onValueChange={setActiveFilter}>
            <TabsList className="w-full">
              <TabsTrigger value="all" className="family-tab">Все</TabsTrigger>
              <TabsTrigger value="Взрослый" className="family-tab">Взрослые</TabsTrigger>
              <TabsTrigger value="Студент" className="family-tab">Студенты</TabsTrigger>
              <TabsTrigger value="Школьник" className="family-tab">Школьники</TabsTrigger>
              <TabsTrigger value="Дошкольник" className="family-tab">Дошкольники</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Фильтры
          </Button>
        </div>
        <div className="rounded-md border hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ФИО</TableHead>
                <TableHead>ИИН</TableHead>
                <TableHead>Родственная связь</TableHead>
                <TableHead>Возраст</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.iin}</TableCell>
                  <TableCell>{member.relation}</TableCell>
                  <TableCell>{member.age}</TableCell>
                  <TableCell>{getStatusBadge(member.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleViewMember(member)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {member.status === "Студент" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedMember(member);
                            setIsUploadOpen(true);
                          }}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteMember(member.id)}
                        disabled={member.id === members[0]?.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mobile-support-cards md:hidden">
          {filteredMembers.map((member) => (
            <div key={member.id} className="mobile-table-card">
              <div className="mobile-table-card-header">
                <div className="mobile-table-card-title">{member.name}</div>
                {getStatusBadge(member.status)}
              </div>
              <div className="mobile-table-card-row">
                <div className="mobile-table-card-label">ИИН:</div>
                <div className="mobile-table-card-value">{member.iin}</div>
              </div>
              <div className="mobile-table-card-row">
                <div className="mobile-table-card-label">Родственная связь:</div>
                <div className="mobile-table-card-value">{member.relation}</div>
              </div>
              <div className="mobile-table-card-row">
                <div className="mobile-table-card-label">Возраст:</div>
                <div className="mobile-table-card-value">{member.age}</div>
              </div>
              <div className="mobile-table-card-actions">
                <Button variant="outline" size="sm" onClick={() => handleViewMember(member)}>
                  <Eye className="mr-1 h-4 w-4" />
                  Просмотр
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="mr-1 h-4 w-4" />
                  Изменить
                </Button>
                {member.status === "Студент" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedMember(member);
                      setIsUploadOpen(true);
                    }}
                  >
                    <Upload className="mr-1 h-4 w-4" />
                    Документы
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteMember(member.id)}
                  disabled={member.id === members[0]?.id}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Удалить
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Загрузка документов</DialogTitle>
              <DialogDescription>Загрузите фотографию и сканы документов для {selectedMember?.name}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUploadDocuments}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="photo">Фотография</Label>
                  <Input id="photo" type="file" accept="image/*,.pdf,.doc,.docx" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="idCard">Удостоверение личности</Label>
                  <Input id="idCard" type="file" accept="image/*,.pdf,.doc,.docx" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="studentCard">Студенческий билет</Label>
                  <Input id="studentCard" type="file" accept="image/*,.pdf,.doc,.docx" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="transcript">Транскрипт</Label>
                  <Input id="transcript" type="file" accept="image/*,.pdf,.doc,.docx" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="otherDocs">Другие документы</Label>
                  <Input id="otherDocs" type="file" accept="image/*,.pdf,.doc,.docx" multiple />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Загрузить</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}