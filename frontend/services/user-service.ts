import type { User } from "@/types/models"
import { getFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage-utils"

// Сервис для работы с пользователями

type UserRole = "admin" | "user"

export const UserService = {
  // Получение всех пользователей
  getAllUsers(): User[] {
    return getFromStorage<User[]>(STORAGE_KEYS.USERS, [])
  },

  // Получение пользователя по ID
  getUserById(id: number): User | null {
    const users = this.getAllUsers()
    return users.find((user) => user.id === id) || null
  },

  // Добавление нового пользователя
  addUser(user: Omit<User, "id">): User {
    const users = this.getAllUsers()

    // Генерация ID
    const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1

    // Создание нового пользователя
    const newUser: User = {
      ...user,
      id: newId,
    }

    // Сохранение в localStorage
    saveToStorage(STORAGE_KEYS.USERS, [...users, newUser])

    return newUser
  },

  // Обновление пользователя
  updateUser(id: number, user: Partial<User>): User | null {
    const users = this.getAllUsers()
    const index = users.findIndex((u) => u.id === id)

    if (index === -1) return null

    // Обновление пользователя
    const updatedUser: User = {
      ...users[index],
      ...user,
    }

    users[index] = updatedUser

    // Сохранение в localStorage
    saveToStorage(STORAGE_KEYS.USERS, users)

    return updatedUser
  },

  // Удаление пользователя
  deleteUser(id: number): boolean {
    const users = this.getAllUsers()
    const filteredUsers = users.filter((u) => u.id !== id)

    if (filteredUsers.length === users.length) return false

    // Сохранение в localStorage
    saveToStorage(STORAGE_KEYS.USERS, filteredUsers)

    return true
  },

  // Add the missing getUserRole function
  getUserRole(userId: number): UserRole {
    const user = this.getUserById(userId)
    return user?.role || "admin" // Default to admin if user not found
  },
}
