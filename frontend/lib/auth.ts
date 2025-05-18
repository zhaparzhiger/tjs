import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

interface DecodedToken {
  id: string;
  iin: string;
  role: string;
  region?: string;
  district?: string;
  city?: string;
  exp: number;
  [key: string]: any;
}

// Сохранение токена в localStorage и cookie
export const setToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);

    // Также сохраняем в cookie для middleware
    Cookies.set("auth_token", token, {
      expires: 1, // 1 день
      path: "/",
      sameSite: "lax",
    });

    // Сохраняем данные пользователя для быстрого доступа
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      console.log("setToken: decoded user:", decoded);
      localStorage.setItem("auth_user", JSON.stringify(decoded));
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }
};

// Получение токена из localStorage
export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
};

// Удаление токена из localStorage и cookie
export const removeToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    Cookies.remove("auth_token", { path: "/" });
  }
};

// Проверка валидности токена
export const isTokenValid = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    console.log("isTokenValid: decoded:", decoded, "valid:", decoded.exp > currentTime);
    return decoded.exp > currentTime;
  } catch (error) {
    console.error("isTokenValid error:", error);
    return false;
  }
};

// Получение данных пользователя из токена
export const getUserFromToken = (token: string) => {
  try {
    if (!token) {
      console.log("getUserFromToken: no token provided");
      return null;
    }

    // Проверяем валидность токена
    if (!isTokenValid(token)) {
      console.log("getUserFromToken: token is invalid");
      return null;
    }

    const decoded = jwtDecode<DecodedToken>(token);

    // Логируем данные пользователя для отладки
    console.log("getUserFromToken: decoded token:", decoded);

    return {
      id: decoded.id,
      iin: decoded.iin,
      role: decoded.role,
      region: decoded.region,
      district: decoded.district,
      city: decoded.city,
      ...decoded,
    };
  } catch (error) {
    console.error("getUserFromToken error:", error);
    return null;
  }
};

// Проверка аутентификации
export const isAuthenticated = (): boolean => {
  const token = getToken();
  const isValid = !!token && isTokenValid(token);
  console.log("isAuthenticated: token:", token, "isValid:", isValid);
  return isValid;
};

// Получение роли пользователя
export const getUserRole = (): string | null => {
  try {
    const token = getToken();
    if (!token) {
      console.log("getUserRole: no token");
      return null;
    }

    const decoded = jwtDecode<DecodedToken>(token);
    console.log("getUserRole: role:", decoded.role);
    return decoded.role;
  } catch (error) {
    console.error("getUserRole error:", error);
    return null;
  }
};