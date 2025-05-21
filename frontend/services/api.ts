import { getAuthToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5555/api"

interface FetchOptions extends RequestInit {
  auth?: boolean
}
async function fetchFromAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Include cookies for authentication
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error)
    throw error
  }
}

export { fetchFromAPI }
export async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { auth = true, ...fetchOptions } = options
  const headers = new Headers(fetchOptions.headers)

  // Set default headers
  if (!headers.has("Content-Type") && !(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  // Add auth token if required
  if (auth) {
    const token = getAuthToken()
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
  }

  const url = `${API_URL}${endpoint}`

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  })

  // Handle non-JSON responses
  const contentType = response.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "An error occurred")
    }

    return data as T
  }

  if (!response.ok) {
    throw new Error("An error occurred")
  }

  return (await response.text()) as unknown as T
}

export const api = {
  get: <T>(endpoint: string, options: FetchOptions = {}) =>
    fetchApi<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, data: any, options: FetchOptions = {}) =>
    fetchApi<T>(endpoint, {
      ...options,
      method: "POST", 
      body: JSON.stringify(data) 
    }),
  
  put: <T>(endpoint: string, data: any, options: FetchOptions = {}) => 
    fetchApi<T>(endpoint, { 
      ...options, 
      method: "PUT", 
      body: JSON.stringify(data) 
    }),
  
  delete: <T>(endpoint: string, options: FetchOptions = {}) => 
    fetchApi<T>(endpoint, { ...options, method: "DELETE" }),
}
