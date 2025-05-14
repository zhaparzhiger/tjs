import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtDecode } from "jwt-decode"

interface DecodedToken {
  id: string
  username: string
  role: string
  exp: number
}

// Проверка валидности токена
const isTokenValid = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token)
    const currentTime = Date.now() / 1000

    return decoded.exp > currentTime
  } catch {
    return false
  }
}

export function middleware(request: NextRequest) {
  // Получаем токен из cookie
  const token = request.cookies.get("auth_token")?.value

  // Проверяем, авторизован ли пользователь
  const isAuthenticated = token && isTokenValid(token)

  // Получаем текущий путь
  const { pathname } = request.nextUrl

  // Если пользователь не авторизован и пытается получить доступ к защищенной странице
  if (!isAuthenticated && pathname !== "/login" && !pathname.startsWith("/_next") && !pathname.startsWith("/api")) {
    // Перенаправляем на страницу входа
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // Если пользователь авторизован и пытается получить доступ к странице входа
  if (isAuthenticated && pathname === "/login") {
    // Перенаправляем на дашборд
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// Указываем, для каких путей должен срабатывать middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
