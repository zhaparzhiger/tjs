"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, Users, Home, School, HeartPulse } from "lucide-react"
import { cn } from "@/lib/utils"

export function StatisticsCards() {
  const stats = [
    {
      title: "Всего семей в ТЖС",
      value: "1,248",
      change: "+8",
      period: "за последнюю неделю",
      trend: "up",
      icon: Home,
      color: "bg-blue-500",
    },
    {
      title: "Неблагополучные семьи",
      value: "324",
      change: "-2",
      period: "за последнюю неделю",
      trend: "down",
      icon: Users,
      color: "bg-red-500",
    },
    {
      title: "Дети в ТЖС",
      value: "3,427",
      change: "+24",
      period: "за последнюю неделю",
      trend: "up",
      icon: School,
      color: "bg-green-500",
    },
    {
      title: "Оказано мер поддержки",
      value: "8,942",
      change: "+342",
      period: "за последний месяц",
      trend: "up",
      icon: HeartPulse,
      color: "bg-purple-500",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={stat.title} className="shadow-sm border border-border" style={{ animationDelay: `${index * 0.1}s` }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={cn("p-2 rounded-full", stat.color)}>
              <stat.icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stat.trend === "up" ? (
                <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span className={cn(stat.trend === "up" ? "text-green-500" : "text-red-500")}>{stat.change}</span>
              <span className="ml-1">{stat.period}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
