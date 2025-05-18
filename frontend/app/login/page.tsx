"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user, isLoading } = useAuth();
  const [iin, setIin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Карта для преобразования ролей
  const roleMap: { [key: string]: string } = {
    "Администратор": "admin",
    "Школа": "school",
    "Район": "district",
    "Мобильная группа": "mobile",
    "Полиция": "police",
    "Здравоохранение": "health",
    "Регион": "regional",
    "Социальная служба": "social",
  };

  useEffect(() => {
    console.log("LoginPage: isAuthenticated:", isAuthenticated, "user:", user);
    if (!isLoading && isAuthenticated && user?.role) {
      const role = roleMap[user.role] || user.role.toLowerCase();
      router.push(`/dashboard?role=${role}`);
    }
  }, [isAuthenticated, user, isLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Валидация ИИН
    if (!/^\d{12}$/.test(iin)) {
      setError("ИИН должен состоять из 12 цифр");
      setLoading(false);
      return;
    }

    try {
      console.log("Attempting login with:", iin);
      const response = await login(iin, password);
      const userData = response?.user;
      if (userData?.role) {
        const role = roleMap[userData.role] || userData.role.toLowerCase();
        router.push(`/dashboard?role=${role}`);
      } else {
        throw new Error("Роль пользователя не определена");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error instanceof Error ? error.message : "Неверный ИИН или пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-xl animate-fade-in">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="relative w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 22V12H15V22"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Единая база данных семей в ТЖС</CardTitle>
          <CardDescription className="text-center">Введите ваши учетные данные для входа в систему</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4 animate-shake">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="iin">ИИН</Label>
                <Input
                  id="iin"
                  type="text"
                  value={iin}
                  onChange={(e) => setIin(e.target.value)}
                  required
                  autoComplete="off"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full transition-all duration-200" disabled={loading}>
                {loading ? "Вход..." : "Войти"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-sm text-center text-muted-foreground mt-2">
            Свяжитесь с администратором для получения учетных данных
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}