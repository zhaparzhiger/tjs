"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getToken, setToken, removeToken, getUserFromToken } from "@/lib/auth"

interface User {
  id: string
  username: string
  fullName?: string
  email?: string
  role: string
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  error: string | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  error: null,
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getToken()
        if (token) {
          const userData = getUserFromToken(token)
          if (userData) {
            console.log("Auth initialized with user:", userData)
            setUser(userData)
          } else {
            console.log("Invalid or expired token")
            removeToken()
          }
        } else {
          console.log("No token found")
        }
      } catch (err) {
        console.error("Error initializing auth:", err)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (username: string, password: string) => {
    setIsLoading(true)
    setError(null)

    console.log("Attempting login with:", username, password.replace(/./g, "*"))

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5555/api"
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Ошибка входа")
      }

      const { token, user: userData } = data

      // Сохраняем токен
      setToken(token)

      // Устанавливаем пользователя
      setUser(userData)

      console.log("Login successful, redirecting to dashboard with role:", userData.role)

      // Перенаправляем на дашборд
      router.push(`/dashboard?role=${userData.role.toLowerCase()}`)
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Ошибка входа")
    } finally {
      setIsLoading(false)
      console.log("Login function completed")
    }
  }

  const logout = () => {
    removeToken()
    setUser(null)
    router.push("/login")
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    error,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
