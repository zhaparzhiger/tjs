import type { Family, FamilyMember, SupportMeasure } from "@/types/models"
import { getFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage-utils"

const FAMILIES_KEY = "families"
const FAMILY_MEMBERS_KEY = "family_members"
const SUPPORT_MEASURES_KEY = "support_measures"

// Получение всех семей
const getAllFamilies = (): Family[] => {
  return getFromStorage<Family[]>(STORAGE_KEYS.FAMILIES, [])
}

// Получение семьи по ID
const getFamilyById = (id: number): Family | null => {
  const families = getAllFamilies()
  return families.find((family) => family.id === id) || null
}

// Добавление новой семьи
const addFamily = (family: Omit<Family, "id">): Family => {
  const families = getAllFamilies()
  const newId = families.length > 0 ? Math.max(...families.map((f) => f.id)) + 1 : 1

  const newFamily: Family = {
    ...family,
    id: newId,
  }

  const updatedFamilies = [...families, newFamily]
  saveToStorage(STORAGE_KEYS.FAMILIES, updatedFamilies)
  return newFamily
}

// Обновление семьи
const updateFamily = (id: number, updatedFields: Partial<Family>, user = "System") => {
  const families = getAllFamilies()
  const familyIndex = families.findIndex((f) => f.id === id)

  if (familyIndex === -1) {
    return null
  }

  const updatedFamily: Family = {
    ...families[familyIndex],
    ...updatedFields,
    lastUpdate: new Date().toLocaleDateString("ru-RU"),
    updatedBy: user,
  }

  families[familyIndex] = updatedFamily
  saveToStorage(STORAGE_KEYS.FAMILIES, families)
  return updatedFamily
}

// Удаление семьи
const deleteFamily = (id: number): boolean => {
  const families = getAllFamilies()
  const filteredFamilies = families.filter((family) => family.id !== id)

  if (filteredFamilies.length === families.length) return false

  saveToStorage(STORAGE_KEYS.FAMILIES, filteredFamilies)
  return true
}

// Получение всех членов семьи
const getFamilyMembers = (familyId: number): FamilyMember[] => {
  const familyMembers = getFromStorage<FamilyMember[]>(STORAGE_KEYS.FAMILY_MEMBERS, [])
  return familyMembers.filter((member) => member.familyId === familyId)
}

// Добавление члена семьи
const addFamilyMember = (member: Omit<FamilyMember, "id">): FamilyMember => {
  const familyMembers = getFromStorage<FamilyMember[]>(STORAGE_KEYS.FAMILY_MEMBERS, [])
  const newId = familyMembers.length > 0 ? Math.max(...familyMembers.map((m) => m.id)) + 1 : 1

  const newMember: FamilyMember = {
    ...member,
    id: newId,
  }

  const updatedFamilyMembers = [...familyMembers, newMember]
  saveToStorage(STORAGE_KEYS.FAMILY_MEMBERS, updatedFamilyMembers)
  return newMember
}

// Обновление члена семьи
const updateFamilyMember = (id: number, updatedFields: Partial<FamilyMember>): FamilyMember | null => {
  const familyMembers = getFromStorage<FamilyMember[]>(STORAGE_KEYS.FAMILY_MEMBERS, [])
  const memberIndex = familyMembers.findIndex((member) => member.id === id)

  if (memberIndex === -1) {
    return null
  }

  const updatedMember: FamilyMember = {
    ...familyMembers[memberIndex],
    ...updatedFields,
  }

  familyMembers[memberIndex] = updatedMember
  saveToStorage(STORAGE_KEYS.FAMILY_MEMBERS, familyMembers)
  return updatedMember
}

// Удаление члена семьи
const deleteFamilyMember = (id: number): boolean => {
  const familyMembers = getFromStorage<FamilyMember[]>(STORAGE_KEYS.FAMILY_MEMBERS, [])
  const filteredFamilyMembers = familyMembers.filter((member) => member.id !== id)

  if (filteredFamilyMembers.length === familyMembers.length) return false

  saveToStorage(STORAGE_KEYS.FAMILY_MEMBERS, filteredFamilyMembers)
  return true
}

// Получение всех мер поддержки для семьи
const getFamilySupport = (familyId: number): SupportMeasure[] => {
  const supportMeasures = getFromStorage<SupportMeasure[]>(STORAGE_KEYS.SUPPORT_MEASURES, [])
  return supportMeasures.filter((measure) => measure.familyId === familyId)
}

// Добавление меры поддержки
const addSupportMeasure = (measure: Omit<SupportMeasure, "id" | "createdAt">, user: string): SupportMeasure => {
  const supportMeasures = getFromStorage<SupportMeasure[]>(STORAGE_KEYS.SUPPORT_MEASURES, [])
  const newId = supportMeasures.length > 0 ? Math.max(...supportMeasures.map((m) => m.id)) + 1 : 1

  const newMeasure: SupportMeasure = {
    ...measure,
    id: newId,
    createdAt: new Date().toLocaleDateString("ru-RU"),
    createdBy: user,
  }

  const updatedSupportMeasures = [...supportMeasures, newMeasure]
  saveToStorage(STORAGE_KEYS.SUPPORT_MEASURES, updatedSupportMeasures)
  return newMeasure
}

// Обновление меры поддержки
const updateSupportMeasure = (id: number, updatedFields: Partial<SupportMeasure>): SupportMeasure | null => {
  const supportMeasures = getFromStorage<SupportMeasure[]>(STORAGE_KEYS.SUPPORT_MEASURES, [])
  const measureIndex = supportMeasures.findIndex((measure) => measure.id === id)

  if (measureIndex === -1) {
    return null
  }

  const updatedMeasure: SupportMeasure = {
    ...supportMeasures[measureIndex],
    ...updatedFields,
  }

  supportMeasures[measureIndex] = updatedMeasure
  saveToStorage(STORAGE_KEYS.SUPPORT_MEASURES, supportMeasures)
  return updatedMeasure
}

// Удаление меры поддержки
const deleteSupportMeasure = (id: number): boolean => {
  const supportMeasures = getFromStorage<SupportMeasure[]>(STORAGE_KEYS.SUPPORT_MEASURES, [])
  const filteredSupportMeasures = supportMeasures.filter((measure) => measure.id !== id)

  if (filteredSupportMeasures.length === supportMeasures.length) return false

  saveToStorage(STORAGE_KEYS.SUPPORT_MEASURES, filteredSupportMeasures)
  return true
}

// Восстановление семьи
const restoreFamily = (id: number): Family | null => {
  const families = getAllFamilies()
  const familyIndex = families.findIndex((family) => family.id === id)

  if (familyIndex === -1) {
    return null
  }

  const restoredFamily: Family = {
    ...families[familyIndex],
    isActive: true,
    inactiveReason: "",
  }

  families[familyIndex] = restoredFamily
  saveToStorage(STORAGE_KEYS.FAMILIES, families)
  return restoredFamily
}

const getFamilyMemberById = (id: number): FamilyMember | null => {
  const familyMembers = getFromStorage<FamilyMember[]>(STORAGE_KEYS.FAMILY_MEMBERS, [])
  return familyMembers.find((member) => member.id === id) || null
}

export const FamilyService = {
  getAllFamilies,
  getFamilyById,
  addFamily,
  updateFamily,
  deleteFamily,
  getFamilyMembers,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  getFamilySupport,
  addSupportMeasure,
  updateSupportMeasure,
  deleteSupportMeasure,
  restoreFamily,
  getFamilyMemberById,
}
