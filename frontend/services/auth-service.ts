import { setAuthToken, setAuthUser, getAuthToken, clearAuth, getAuthHeaders, type AuthUser } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5555/api"

export const AuthService = {
  // Функция для входа в систему
  async login(username: string, password: string): Promise<AuthUser> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Ошибка входа в систему")
      }

      const data = await response.json()

      // Сохраняем токен и данные пользователя
      setAuthToken(data.token)
      setAuthUser(data.user)

      console.log("Login successful, user data:", data.user)

      return data.user
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  },

  // Функция для выхода из системы
  logout(): void {
    clearAuth()
  },

  // Функция для получения профиля пользователя
  async getProfile(): Promise<AuthUser> {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Ошибка получения профиля")
      }

      const userData = await response.json()

      // Обновляем данные пользователя в localStorage
      setAuthUser(userData)

      return userData
    } catch (error) {
      console.error("Get profile error:", error)
      throw error
    }
  },

  // Функция для смены пароля
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Ошибка смены пароля")
      }
    } catch (error) {
      console.error("Change password error:", error)
      throw error
    }
  },

  // Функция для проверки токена
  async validateToken(): Promise<boolean> {
    const token = getAuthToken()

    if (!token) {
      return false
    }

    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      })

      return response.ok
    } catch (error) {
      console.error("Token validation error:", error)
      return false
    }
  },
}
