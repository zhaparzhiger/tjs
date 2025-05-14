// Типы данных для работы с моделями

// Семья
export interface Family {
  id: number
  name: string
  iin: string
  address: string
  registrationAddress?: string
  status: string
  statusReason?: string
  tzhsReason?: string
  nbReason?: string
  inspectionStatus?: string
  familyType?: string
  children: number
  housingType?: string
  employment?: string
  workplace?: string
  familyIncome?: string
  needsSupport?: boolean
  needsEducation?: boolean
  needsHealth?: boolean
  needsPolice?: boolean
  hasDisability?: boolean
  isActive?: boolean
  inactiveReason?: string
  notes?: string
  lastUpdate?: string
  createdAt?: string
  createdBy?: string
  updatedAt?: string
  updatedBy?: string
}

// Член семьи
export interface FamilyMember {
  id: number
  familyId: number
  name: string
  iin: string
  relation: string
  age: number
  status: string
  registrationAddress?: string
  idCardNumber?: string
  idCardIssueDate?: string
  idCardExpiryDate?: string
  idCardNotes?: string
  school?: string
  grade?: string
  institution?: string
  course?: string
  funding?: string
  meals?: string
  preschool?: string
  freeTextbooks?: boolean
  freeMeals?: boolean
  needsSupport?: boolean
  needsKindergarten?: boolean
  specialNeeds?: boolean
  hasDisability?: boolean
  chronicIllness?: boolean
  needsMedicalCare?: boolean
  medicalNotes?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

// Документ члена семьи
export interface MemberDocument {
  id: number
  memberId: number
  type: string
  name: string
  fileUrl: string
  fileType: string
  uploadDate: string
  uploadedBy: string
}

// Мера поддержки
export interface SupportMeasure {
  id: number
  familyId: number
  category: string
  type: string
  amount: string
  date: string
  status: string
  notes?: string
  createdAt: string
  createdBy: string
  updatedAt?: string
  updatedBy?: string
}

// Документ
export interface Document {
  id: number
  familyId?: number
  memberId?: number
  name: string
  type: string
  fileUrl: string
  fileSize?: number
  fileType?: string
  uploadDate: string
  uploadedBy: string
  description?: string
  tags?: string[]
  isPublic?: boolean
}

// Запись в истории
export interface HistoryRecord {
  id: number
  familyId: number
  memberId?: number
  action: string
  description: string
  date: string
  user: string
  details?: any
}

// Пользователь
export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  permissions?: string[]
  lastLogin?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export type UserRole = "admin" | "district" | "school" | "social" | "police" | "health" | "regional" | "mobile"

// Отчет
export interface Report {
  id: number
  name: string
  description: string
  type: string
  date: string
  author: string
  fileUrl?: string
}

// Уведомление
export interface Notification {
  id: number
  title: string
  description: string
  type: string
  priority: "low" | "medium" | "high"
  targetRoles?: UserRole[]
  isRead?: boolean
  createdAt: string
  expiresAt?: string
  actionUrl?: string
  relatedId?: number
  relatedType?: string
}

export interface ExportHistory {
  id: string
  exportedBy: string
  exportedAt: string
  type: string
  filters?: any
  fileUrl?: string
  status: "completed" | "failed" | "in-progress"
  error?: string
}
