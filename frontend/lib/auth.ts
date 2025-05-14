import { jwtDecode } from "jwt-decode"
import Cookies from "js-cookie"

interface DecodedToken {
  id: string
  username: string
  role: string
  exp: number
  [key: string]: any
}

// Сохранение токена в localStorage и cookie
export const setToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token)

    // Также сохраняем в cookie для middleware
    Cookies.set("auth_token", token, {
      expires: 1, // 1 день
      path: "/",
      sameSite: "lax",
    })

    // Сохраняем данные пользователя для быстрого доступа
    try {
      const decoded = jwtDecode<DecodedToken>(token)
      localStorage.setItem("auth_user", JSON.stringify(decoded))
    } catch (error) {
      console.error("Error decoding token:", error)
    }
  }
}

// Получение токена из localStorage
export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token")
  }
  return null
}

// Удаление токена из localStorage и cookie
export const removeToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
    Cookies.remove("auth_token", { path: "/" })
  }
}

// Проверка валидности токена
export const isTokenValid = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token)
    const currentTime = Date.now() / 1000

    return decoded.exp > currentTime
  } catch {
    return false
  }
}

// Получение данных пользователя из токена
export const getUserFromToken = (token: string) => {
  try {
    if (!token) return null

    // Проверяем валидность токена
    if (!isTokenValid(token)) {
      return null
    }

    const decoded = jwtDecode<DecodedToken>(token)

    // Логируем данные пользователя для отладки
    console.log("Decoded token:", decoded)

    return {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      ...decoded,
    }
  } catch (error) {
    console.error("Error getting user from token:", error)
    return null
  }
}

// Проверка аутентификации
export const isAuthenticated = (): boolean => {
  const token = getToken()
  return !!token && isTokenValid(token)
}

// Получение роли пользователя
export const getUserRole = (): string | null => {
  try {
    const token = getToken()
    if (!token) return null

    const decoded = jwtDecode<DecodedToken>(token)
    return decoded.role
  } catch {
    return null
  }
}
