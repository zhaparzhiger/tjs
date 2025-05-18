"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, setToken, removeToken, getUserFromToken } from "@/lib/auth";

interface User {
  id: string;
  iin: string;
  fullName?: string;
  role: string;
  region?: string;
  district?: string;
  city?: string;
  permissions?: string[];
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (iin: string, password: string) => Promise<{ user: User }>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ user: null }),
  logout: () => {},
  error: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getToken();
        console.log("initAuth: token:", token);
        if (token) {
          const userData = getUserFromToken(token);
          console.log("initAuth: userData:", userData);
          if (userData) {
            setUser(userData);
          } else {
            console.log("Invalid or expired token");
            removeToken();
          }
        } else {
          console.log("No token found");
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
      } finally {
        setIsLoading(false);
        console.log("initAuth: isLoading:", false, "user:", user);
      }
    };

    initAuth();
  }, []);

  const login = async (iin: string, password: string) => {
    setIsLoading(true);
    setError(null);

    console.log("Attempting login with IIN:", iin, "password:", password.replace(/./g, "*"));

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5555/api";
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ iin, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ошибка входа");
      }

      const { token, user: userData } = data;
      console.log("Login: received userData:", userData);

      setToken(token);
      setUser(userData);

      console.log("Login successful, redirecting to dashboard with role:", userData.role);

      router.push(`/dashboard?role=${userData.role}`);
      return { user: userData };
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Ошибка входа");
      throw err;
    } finally {
      setIsLoading(false);
      console.log("Login function completed");
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    router.push("/login");
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};