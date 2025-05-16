import { FamilyMember, SupportMeasure } from "@/types/models";

const API_BASE_URL = "http://localhost:5555/api"; // Adjust as needed

const getAuthHeaders = () => {
  const token = localStorage.getItem("auth_token"); // Assuming token is stored in localStorage
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const ApiService = {
  // Family Members
  getFamilyMembers: async (familyId: string): Promise<FamilyMember[]> => {
    const response = await fetch(`${API_BASE_URL}/family-members/family/${familyId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch family members");
    }
    return response.json();
  },

  getFamilyMemberById: async (id: string): Promise<FamilyMember> => {
    const response = await fetch(`${API_BASE_URL}/family-members/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch family member");
    }
    return response.json();
  },

  createFamilyMember: async (member: Partial<FamilyMember>): Promise<FamilyMember> => {
    const response = await fetch(`${API_BASE_URL}/family-members`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(member),
    });
    if (!response.ok) {
      throw new Error("Failed to create family member");
    }
    return response.json();
  },

  updateFamilyMember: async (id: string, member: Partial<FamilyMember>): Promise<FamilyMember> => {
    const response = await fetch(`${API_BASE_URL}/family-members/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(member),
    });
    if (!response.ok) {
      throw new Error("Failed to update family member");
    }
    return response.json();
  },

  deleteFamilyMember: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/family-members/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to delete family member");
    }
  },

  // Support Measures
  getFamilySupport: async (familyId: string): Promise<SupportMeasure[]> => {
    const response = await fetch(`${API_BASE_URL}/support/family/${familyId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch support measures");
    }
    return response.json();
  },

  getSupportMeasureById: async (id: string): Promise<SupportMeasure> => {
    const response = await fetch(`${API_BASE_URL}/support/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch support measure");
    }
    return response.json();
  },

  createSupportMeasure: async (measure: Partial<SupportMeasure>): Promise<SupportMeasure> => {
    const response = await fetch(`${API_BASE_URL}/support`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(measure),
    });
    if (!response.ok) {
      throw new Error("Failed to create support measure");
    }
    return response.json();
  },

  updateSupportMeasure: async (id: string, measure: Partial<SupportMeasure>): Promise<SupportMeasure> => {
    const response = await fetch(`${API_BASE_URL}/support/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(measure),
    });
    if (!response.ok) {
      throw new Error("Failed to update support measure");
    }
    return response.json();
  },

  deleteSupportMeasure: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/support/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to delete support measure");
    }
  },

  getSupportMeasuresByType: async (type: string): Promise<SupportMeasure[]> => {
    const response = await fetch(`${API_BASE_URL}/support/type/${type}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch support measures by type");
    }
    return response.json();
  },

  getSupportMeasuresByStatus: async (status: string): Promise<SupportMeasure[]> => {
    const response = await fetch(`${API_BASE_URL}/support/status/${status}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch support measures by status");
    }
    return response.json();
  },
};