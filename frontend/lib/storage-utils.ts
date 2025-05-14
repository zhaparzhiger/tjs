// Ключи для localStorage
export const STORAGE_KEYS = {
  USERS: "users",
  FAMILIES: "families",
  FAMILY_MEMBERS: "family_members",
  SUPPORT_MEASURES: "support_measures",
  DOCUMENTS: "documents",
  HISTORY: "history",
  NOTIFICATIONS: "notifications",
  SETTINGS: "settings",
}

// Функция для получения данных из localStorage
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue

  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error)
    return defaultValue
  }
}

// Функция для сохранения данных в localStorage
export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error)
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error)
  }
}
