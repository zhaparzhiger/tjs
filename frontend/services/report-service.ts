import { getFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage-utils"

// Типы отчетов
export type ReportType = "families" | "children" | "support" | "analytics"

// Интерфейс отчета
export interface Report {
  id: number
  name: string
  description: string
  type: string
  date: string
  author: string
  fileUrl?: string
}

// Сервис для работы с отчетами
export const ReportService = {
  // Получение всех отчетов
  getReports(): Report[] {
    return getFromStorage<Report[]>(STORAGE_KEYS.REPORTS, [])
  },

  // Получение отчета по ID
  getReportById(id: number): Report | undefined {
    const reports = this.getReports()
    return reports.find((report) => report.id === id)
  },

  // Создание нового отчета
  createReport(report: Omit<Report, "id">): Report {
    const reports = this.getReports()

    // Генерация ID
    const newId = reports.length > 0 ? Math.max(...reports.map((r) => r.id)) + 1 : 1

    // Создание нового отчета
    const newReport: Report = {
      ...report,
      id: newId,
    }

    // Сохранение в localStorage
    saveToStorage(STORAGE_KEYS.REPORTS, [...reports, newReport])

    return newReport
  },

  // Обновление отчета
  updateReport(id: number, report: Partial<Report>): Report | null {
    const reports = this.getReports()
    const index = reports.findIndex((r) => r.id === id)

    if (index === -1) return null

    // Обновление отчета
    const updatedReport: Report = {
      ...reports[index],
      ...report,
    }

    reports[index] = updatedReport

    // Сохранение в localStorage
    saveToStorage(STORAGE_KEYS.REPORTS, reports)

    return updatedReport
  },

  // Удаление отчета
  deleteReport(id: number): boolean {
    const reports = this.getReports()
    const filteredReports = reports.filter((r) => r.id !== id)

    if (filteredReports.length === reports.length) return false

    // Сохранение в localStorage
    saveToStorage(STORAGE_KEYS.REPORTS, filteredReports)

    return true
  },
}
