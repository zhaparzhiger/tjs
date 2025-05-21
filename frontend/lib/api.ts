// Base API configuration for making requests to the backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5555/api"

// Helper function to get the auth token from localStorage
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

// Generic fetch function with authentication
export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getToken()

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `API error: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error)
    throw error
  }
}

// Authentication API
export const AuthAPI = {
  login: async (username: string, password: string) => {
    return fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })
  },

  register: async (userData: any) => {
    return fetchAPI("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  getProfile: async () => {
    return fetchAPI("/auth/profile")
  },

  logout: () => {
    localStorage.removeItem("token")
  },
}

// Family API
export const FamilyAPI = {
  getAllFamilies: async () => {
    return fetchAPI("/families")
  },

  getFamilyById: async (id: string) => {
    return fetchAPI(`/families/${id}`)
  },

  getFamilyHistory: async (id: string) => {
    return fetchAPI(`/families/${id}/history`)
  },

  createFamily: async (familyData: any) => {
    return fetchAPI("/families", {
      method: "POST",
      body: JSON.stringify(familyData),
    })
  },

  updateFamily: async (id: string, familyData: any) => {
    return fetchAPI(`/families/${id}`, {
      method: "PUT",
      body: JSON.stringify(familyData),
    })
  },

  deleteFamily: async (id: string) => {
    return fetchAPI(`/families/${id}`, {
      method: "DELETE",
    })
  },

  getFamiliesByStatus: async (status: string) => {
    return fetchAPI(`/families/status/${status}`)
  },

  getFamiliesByRiskLevel: async (riskLevel: string) => {
    return fetchAPI(`/families/risk/${riskLevel}`)
  },

  searchFamilies: async (query: string) => {
    return fetchAPI(`/families/search?query=${encodeURIComponent(query)}`)
  },
}

// Family Member API
export const FamilyMemberAPI = {
  getMembersByFamilyId: async (familyId: string) => {
    return fetchAPI(`/family-members/family/${familyId}`)
  },

  getMemberById: async (id: string) => {
    return fetchAPI(`/family-members/${id}`)
  },

  createMember: async (memberData: any) => {
    return fetchAPI("/family-members", {
      method: "POST",
      body: JSON.stringify(memberData),
    })
  },

  updateMember: async (id: string, memberData: any) => {
    return fetchAPI(`/family-members/${id}`, {
      method: "PUT",
      body: JSON.stringify(memberData),
    })
  },

  deleteMember: async (id: string) => {
    return fetchAPI(`/family-members/${id}`, {
      method: "DELETE",
    })
  },

  searchMembers: async (query: string) => {
    return fetchAPI(`/family-members/search?query=${encodeURIComponent(query)}`)
  },
}

// Support Measures API
export const SupportAPI = {
  getSupportByFamilyId: async (familyId: string) => {
    return fetchAPI(`/support/family/${familyId}`)
  },

  getSupportById: async (id: string) => {
    return fetchAPI(`/support/${id}`)
  },

  getSupportByType: async (type: string) => {
    return fetchAPI(`/support/type/${type}`)
  },

  getSupportByStatus: async (status: string) => {
    return fetchAPI(`/support/status/${status}`)
  },

  createSupport: async (supportData: any) => {
    return fetchAPI("/support", {
      method: "POST",
      body: JSON.stringify(supportData),
    })
  },

  updateSupport: async (id: string, supportData: any) => {
    return fetchAPI(`/support/${id}`, {
      method: "PUT",
      body: JSON.stringify(supportData),
    })
  },

  deleteSupport: async (id: string) => {
    return fetchAPI(`/support/${id}`, {
      method: "DELETE",
    })
  },
}

// Document API
export const DocumentAPI = {
  getAllDocuments: async () => {
    return fetchAPI("/documents")
  },

  getDocumentsByFamilyId: async (familyId: string) => {
    return fetchAPI(`/documents/family/${familyId}`)
  },

  getDocumentById: async (id: string) => {
    return fetchAPI(`/documents/${id}`)
  },

  uploadDocument: async (formData: FormData) => {
    const token = getToken()
    const headers = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: "POST",
      headers,
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `API error: ${response.status}`)
    }

    return response.json()
  },

  deleteDocument: async (id: string) => {
    return fetchAPI(`/documents/${id}`, {
      method: "DELETE",
    })
  },
}
