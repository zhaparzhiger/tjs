"use client"

import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { HelpCircle, Search, FileText, MessageCircle, Phone, Mail } from "lucide-react"
import { useState } from "react"
import type { UserRole } from "@/types/roles"

export default function HelpPage() {
  const searchParams = useSearchParams()
  const role = (searchParams.get("role") as UserRole) || "admin"
  const [searchTerm, setSearchTerm] = useState("")

  const faqItems = [
    {
      question: "Как добавить новую семью в систему?",
      answer:
        "Для добавления новой семьи перейдите в раздел 'Семьи', нажмите кнопку 'Добавить семью' и заполните все необходимые поля в форме. После заполнения нажмите 'Сохранить'.",
    },
    {
      question: "Как сформировать отчет?",
      answer:
        "Перейдите в раздел 'Отчеты', выберите тип отчета, укажите необходимые параметры и нажмите кнопку 'Сформировать отчет'. После формирования вы сможете просмотреть, распечатать или скачать отчет.",
    },
    {
      question: "Как изменить статус семьи?",
      answer:
        "Откройте карточку семьи, перейдите на вкладку 'Основная информация', нажмите кнопку 'Редактировать', измените статус в выпадающем списке и нажмите 'Сохранить'.",
    },
    {
      question: "Как загрузить документы в систему?",
      answer:
        "Перейдите в раздел 'Документы', нажмите кнопку 'Загрузить документ', выберите файл на вашем компьютере, укажите тип документа и нажмите 'Загрузить'.",
    },
    {
      question: "Как настроить уведомления?",
      answer:
        "Перейдите в раздел 'Настройки', выберите вкладку 'Уведомления' и настройте параметры получения уведомлений по вашему усмотрению.",
    },
  ]

  const filteredFaqItems = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <DashboardLayout role={role}>
      <div className="flex-1 space-y-4 animate-fade-in">
        <Card className="enhanced-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center">
              <HelpCircle className="mr-2 h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-xl font-bold">Справка</CardTitle>
                <CardDescription>Руководство пользователя и часто задаваемые вопросы</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative w-full max-w-md mx-auto mb-6">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по справке..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>

            <Tabs defaultValue="faq" className="space-y-4">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="faq">Часто задаваемые вопросы</TabsTrigger>
                <TabsTrigger value="guide">Руководство пользователя</TabsTrigger>
                <TabsTrigger value="support">Техническая поддержка</TabsTrigger>
              </TabsList>

              <TabsContent value="faq" className="space-y-4 animate-fade-in">
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqItems.length > 0 ? (
                    filteredFaqItems.map((item, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger>{item.question}</AccordionTrigger>
                        <AccordionContent>{item.answer}</AccordionContent>
                      </AccordionItem>
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">По вашему запросу ничего не найдено</p>
                    </div>
                  )}
                </Accordion>
              </TabsContent>

              <TabsContent value="guide" className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="enhanced-card">
                    <CardHeader>
                      <CardTitle className="text-lg">Начало работы</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Основные принципы работы с системой для новых пользователей
                      </p>
                      <Button variant="outline" className="w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        Открыть руководство
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="enhanced-card">
                    <CardHeader>
                      <CardTitle className="text-lg">Работа с семьями</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Добавление, редактирование и управление данными о семьях
                      </p>
                      <Button variant="outline" className="w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        Открыть руководство
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="enhanced-card">
                    <CardHeader>
                      <CardTitle className="text-lg">Формирование отчетов</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Создание, настройка и экспорт различных типов отчетов
                      </p>
                      <Button variant="outline" className="w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        Открыть руководство
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="enhanced-card">
                    <CardHeader>
                      <CardTitle className="text-lg">Работа с документами</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Загрузка, просмотр и управление документами в системе
                      </p>
                      <Button variant="outline" className="w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        Открыть руководство
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="enhanced-card">
                    <CardHeader>
                      <CardTitle className="text-lg">Статистика и аналитика</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Работа с графиками, диаграммами и аналитическими данными
                      </p>
                      <Button variant="outline" className="w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        Открыть руководство
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="enhanced-card">
                    <CardHeader>
                      <CardTitle className="text-lg">Администрирование</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Управление пользователями, ролями и настройками системы
                      </p>
                      <Button variant="outline" className="w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        Открыть руководство
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="support" className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="enhanced-card">
                    <CardHeader>
                      <CardTitle className="text-lg">Техническая поддержка</CardTitle>
                      <CardDescription>Свяжитесь с нами, если у вас возникли проблемы</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 mr-3 text-primary" />
                        <div>
                          <p className="font-medium">Телефон поддержки</p>
                          <p className="text-sm text-muted-foreground">+7 (727) 123-45-67</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 mr-3 text-primary" />
                        <div>
                          <p className="font-medium">Email поддержки</p>
                          <p className="text-sm text-muted-foreground">support@tzhs-db.kz</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="h-5 w-5 mr-3 text-primary" />
                        <div>
                          <p className="font-medium">Онлайн-чат</p>
                          <p className="text-sm text-muted-foreground">Доступен в рабочие дни с 9:00 до 18:00</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="enhanced-card">
                    <CardHeader>
                      <CardTitle className="text-lg">Отправить запрос в поддержку</CardTitle>
                      <CardDescription>Опишите вашу проблему, и мы свяжемся с вами</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-4">
                        <div className="grid gap-2">
                          <label htmlFor="subject" className="text-sm font-medium">
                            Тема
                          </label>
                          <Input id="subject" placeholder="Укажите тему запроса" />
                        </div>
                        <div className="grid gap-2">
                          <label htmlFor="description" className="text-sm font-medium">
                            Описание проблемы
                          </label>
                          <textarea
                            id="description"
                            rows={4}
                            className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Подробно опишите вашу проблему"
                          ></textarea>
                        </div>
                        <Button className="w-full">Отправить запрос</Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
