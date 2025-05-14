"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Edit, Trash2, UserPlus, Eye, Filter, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { UserRole } from "@/types/roles"
import { FamilyService } from "@/services/family-service"
import type { FamilyMember } from "@/types/models"

interface FamilyMembersExtendedProps {
  family: any
  role: UserRole
}

export function FamilyMembersExtended({ family, role }: FamilyMembersExtendedProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState("all")
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null)
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    // Получаем членов семьи из localStorage
    const loadedMembers = FamilyService.getFamilyMembers(family.id)

    // Если нет данных, используем демо-данные
    if (loadedMembers.length === 0) {
      return [
        {
          id: 1,
          familyId: family.id,
          name: family.name,
          iin: family.iin,
          relation: "Мать",
          age: 35,
          status: "Взрослый",
          idCardNumber: "123456789",
          idCardIssueDate: "01.01.2020",
          idCardExpiryDate: "01.01.2030",
          registrationAddress: "г. Павлодар, ул. Ленина, 1",
        },
        {
          id: 2,
          familyId: family.id,
          name: "Иванов Сергей Петрович",
          iin: "790823456789",
          relation: "Отец",
          age: 38,
          status: "Взрослый",
          idCardNumber: "987654321",
          idCardIssueDate: "01.01.2019",
          idCardExpiryDate: "01.01.2029",
          registrationAddress: "г. Павлодар, ул. Ленина, 1",
        },
        {
          id: 3,
          familyId: family.id,
          name: "Иванова Анна Сергеевна",
          iin: "120512345678",
          relation: "Дочь",
          age: 12,
          status: "Школьник",
          school: "СОШ №25",
          grade: "6",
          registrationAddress: "г. Павлодар, ул. Ленина, 1",
        },
        {
          id: 4,
          familyId: family.id,
          name: "Иванов Алексей Сергеевич",
          iin: "150823456789",
          relation: "Сын",
          age: 8,
          status: "Школьник",
          school: "СОШ №25",
          grade: "2",
          registrationAddress: "г. Павлодар, ул. Ленина, 1",
        },
        {
          id: 5,
          familyId: family.id,
          name: "Иванова Екатерина Сергеевна",
          iin: "190512345678",
          relation: "Дочь",
          age: 4,
          status: "Дошкольник",
          registrationAddress: "г. Павлодар, ул. Ленина, 1",
        },
        {
          id: 6,
          familyId: family.id,
          name: "Иванов Михаил Сергеевич",
          iin: "050512345678",
          relation: "Сын",
          age: 20,
          status: "Студент",
          institution: "Павлодарский государственный университет",
          course: "3 курс, Информационные технологии",
          funding: "Грант",
          registrationAddress: "г. Павлодар, ул. Ленина, 1",
        },
      ]
    }

    return loadedMembers
  })

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()

    // Получаем данные из формы
    const form = e.target as HTMLFormElement
    const name = (form.querySelector("#name") as HTMLInputElement).value
    const iin = (form.querySelector("#iin") as HTMLInputElement).value
    const relation = (form.querySelector("#relation") as HTMLSelectElement).value
    const age = Number.parseInt((form.querySelector("#age") as HTMLInputElement).value)
    const status = (form.querySelector("#status") as HTMLSelectElement).value
    const registrationAddress = (form.querySelector("#registrationAddress") as HTMLInputElement).value

    // Создаем нового члена семьи
    const newMember: Omit<FamilyMember, "id"> = {
      familyId: family.id,
      name,
      iin,
      relation,
      age,
      status,
      registrationAddress,
    }

    // Добавляем данные удостоверения для взрослых
    if (status === "Взрослый") {
      newMember.idCardNumber = (form.querySelector("#idCardNumber") as HTMLInputElement)?.value
      newMember.idCardIssueDate = (form.querySelector("#idCardIssueDate") as HTMLInputElement)?.value
      newMember.idCardExpiryDate = (form.querySelector("#idCardExpiryDate") as HTMLInputElement)?.value
      newMember.idCardNotes = (form.querySelector("#idCardNotes") as HTMLTextAreaElement)?.value
    }

    // Добавляем дополнительные поля в зависимости от статуса
    if (status === "Школьник") {
      newMember.school = (form.querySelector("#school") as HTMLInputElement)?.value
      newMember.grade = (form.querySelector("#grade") as HTMLInputElement)?.value
    } else if (status === "Студент") {
      newMember.institution = (form.querySelector("#institution") as HTMLInputElement)?.value
      newMember.course = (form.querySelector("#course") as HTMLInputElement)?.value
      newMember.funding = (form.querySelector("#funding") as HTMLSelectElement)?.value
    } else if (status === "Дошкольник") {
      newMember.meals = (form.querySelector("#meals") as HTMLSelectElement)?.value
    }

    // Сохраняем члена семьи в localStorage
    const member = FamilyService.addFamilyMember(newMember)

    setMembers([...members, member])
    setIsAddMemberOpen(false)
    toast({
      title: "Член семьи добавлен",
      description: "Новый член семьи успешно добавлен",
    })
  }

  const handleDeleteMember = (id: number) => {
    // Удаляем члена семьи из localStorage
    FamilyService.deleteFamilyMember(id)

    setMembers(members.filter((member) => member.id !== id))
    toast({
      title: "Член семьи удален",
      description: "Член семьи успешно удален из списка",
    })
  }

  const handleViewMember = (member: FamilyMember) => {
    // Сохраняем выбранного члена семьи в localStorage для просмотра
    localStorage.setItem("selectedFamilyMember", JSON.stringify(member))

    // Переходим на страницу члена семьи
    router.push(`/family-member/${member.id}?role=${role}&familyId=${family.id}`)
  }

  const handleUploadDocuments = (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploadOpen(false)
    toast({
      title: "Документы загружены",
      description: "Документы успешно загружены",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Школьник":
        return <Badge className="bg-blue-600">Школьник</Badge>
      case "Дошкольник":
        return <Badge className="bg-green-600">Дошкольник</Badge>
      case "Студент":
        return <Badge className="bg-purple-600">Студент</Badge>
      case "Взрослый":
        return <Badge variant="outline">Взрослый</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const [selectedStatus, setSelectedStatus] = useState("Взрослый")

  // Фильтрация членов семьи
  const filteredMembers = activeFilter === "all" ? members : members.filter((member) => member.status === activeFilter)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Члены семьи</CardTitle>
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
                  <DialogDescription>Заполните информацию о новом члене семьи</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddMember}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">ФИО</Label>
                      <Input id="name" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="iin">ИИН</Label>
                      <Input id="iin" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="relation">Родственная связь</Label>
                      <Select defaultValue="mother">
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
                      <Input id="age" type="number" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="registrationAddress">Адрес прописки</Label>
                      <Input id="registrationAddress" placeholder="Введите адрес прописки" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Статус</Label>
                      <Select defaultValue={selectedStatus} onValueChange={setSelectedStatus}>
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
                          <Label htmlFor="idCardIssueDate">Дата выдачи</Label>
                          <Input id="idCardIssueDate" placeholder="ДД.ММ.ГГГГ" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="idCardExpiryDate">Дата окончания</Label>
                          <Input id="idCardExpiryDate" placeholder="ДД.ММ.ГГГГ" />
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
                          <Input id="course" placeholder="Например: 2" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="funding">Форма обучения</Label>
                          <Select defaultValue="budget">
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
                        <Select defaultValue="free">
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
                    <Button type="submit">Добавить</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="scrollable-tabs-container">
            <div className="family-tabs-container">
              <Tabs defaultValue="adults" className="w-full">
                <div className="family-tabs-list">
                  <TabsList className="w-full">
                    <TabsTrigger value="adults" className="family-tab">
                      Взрослые
                    </TabsTrigger>
                    <TabsTrigger value="students" className="family-tab">
                      Студенты
                    </TabsTrigger>
                    <TabsTrigger value="schoolchildren" className="family-tab">
                      Школьники
                    </TabsTrigger>
                    <TabsTrigger value="preschoolers" className="family-tab">
                      Дошкольники
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="adults">{/* Содержимое вкладки */}</TabsContent>

                {/* Остальные TabsContent */}
              </Tabs>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Фильтры
            </Button>
          </div>
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
                            setSelectedMember(member)
                            setIsUploadOpen(true)
                          }}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteMember(member.id)}
                        disabled={member.id === 1} // Prevent deleting the main parent
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
                      setSelectedMember(member)
                      setIsUploadOpen(true)
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
                  disabled={member.id === 1}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Удалить
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Диалог загрузки документов для студента */}
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Загрузка документов</DialogTitle>
              <DialogDescription>Загрузите фотографии и сканы документов для {selectedMember?.name}</DialogDescription>
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
  )
}
