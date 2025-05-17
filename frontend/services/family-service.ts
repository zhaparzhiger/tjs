import type { Family, FamilyMember, SupportMeasure } from "@/types/models";

const API_BASE_URL = "http://localhost:5555/api";

export class FamilyService {
  // Helper to get auth token
  private static getAuthToken(): string | null {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      console.error("No auth token found");
      return null;
    }
    return token;
  }

  // Helper to validate MongoDB ObjectId
  private static isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  // Family Member Methods
  static async getFamilyMemberById(id: string): Promise<FamilyMember | null> {
    if (!this.isValidObjectId(id)) {
      console.error("Invalid ID format:", id);
      return null;
    }
    const token = this.getAuthToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/family-members/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch family member: ${response.status}`);
      }
      const data = await response.json();
      return {
        id: data.id,
        familyId: data.familyId,
        name: `${data.firstName} ${data.lastName}${data.middleName ? ` ${data.middleName}` : ""}`,
        iin: data.documentNumber || "",
        relation: data.relationship || "Не указано",
        age: data.birthDate
          ? Math.floor(
              (new Date().getTime() - new Date(data.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365)
            )
          : 0,
        status: data.status || "Взрослый",
      };
    } catch (error) {
      console.error("Error fetching family member:", error);
      throw error;
    }
  }

  static async addFamilyMember(data: Partial<FamilyMember>): Promise<FamilyMember | null> {
    const token = this.getAuthToken();
    if (!token) return null;

    try {
      const nameParts = data.name?.trim().split(/\s+/).filter(Boolean) || [];
      const payload = {
        familyId: data.familyId,
        firstName: nameParts[0] || "",
        lastName: nameParts[1] || "",
        middleName: nameParts.slice(2).join(" ") || null,
        documentNumber: data.iin || null,
        relationship: data.relation || "Не указано",
        birthDate: data.age
          ? new Date(new Date().setFullYear(new Date().getFullYear() - data.age)).toISOString()
          : null,
        status: data.status || "Взрослый",
      };

      const response = await fetch(`${API_BASE_URL}/family-members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add family member");
      }
      const newData = await response.json();
      return {
        id: newData.id,
        familyId: newData.familyId,
        name: `${newData.firstName} ${newData.lastName}${newData.middleName ? ` ${newData.middleName}` : ""}`,
        iin: newData.documentNumber || "",
        relation: newData.relationship || "Не указано",
        age: newData.birthDate
          ? Math.floor(
              (new Date().getTime() - new Date(newData.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365)
            )
          : 0,
        status: newData.status || "Взрослый",
      };
    } catch (error) {
      console.error("Error adding family member:", error);
      throw error;
    }
  }

  static async updateFamilyMember(id: string, data: Partial<FamilyMember>): Promise<FamilyMember | null> {
    if (!this.isValidObjectId(id)) {
      console.error("Invalid ID format:", id);
      return null;
    }
    const token = this.getAuthToken();
    if (!token) return null;

    try {
      const nameParts = data.name?.trim().split(/\s+/).filter(Boolean) || [];
      const payload = {
        firstName: nameParts[0] || "",
        lastName: nameParts[1] || "",
        middleName: nameParts.slice(2).join(" ") || null,
        documentNumber: data.iin || null,
        relationship: data.relation || "Не указано",
        birthDate: data.age
          ? new Date(new Date().setFullYear(new Date().getFullYear() - data.age)).toISOString()
          : null,
        status: data.status || "Взрослый",
      };

      const response = await fetch(`${API_BASE_URL}/family-members/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update family member");
      }
      const updatedData = await response.json();
      return {
        id: updatedData.id,
        familyId: updatedData.familyId,
        name: `${updatedData.firstName} ${updatedData.lastName}${updatedData.middleName ? ` ${updatedData.middleName}` : ""}`,
        iin: updatedData.documentNumber || "",
        relation: updatedData.relationship || "Не указано",
        age: updatedData.birthDate
          ? Math.floor(
              (new Date().getTime() - new Date(updatedData.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365)
            )
          : 0,
        status: updatedData.status || "Взрослый",
      };
    } catch (error) {
      console.error("Error updating family member:", error);
      throw error;
    }
  }

  static async deleteFamilyMember(id: string): Promise<void> {
    if (!this.isValidObjectId(id)) {
      console.error("Invalid ID format:", id);
      throw new Error("Invalid ID format");
    }
    const token = this.getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
      const response = await fetch(`${API_BASE_URL}/family-members/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete family member");
      }
    } catch (error) {
      console.error("Error deleting family member:", error);
      throw error;
    }
  }

  // Support Measure Methods
  static async getFamilySupport(familyId: string): Promise<SupportMeasure[]> {
    if (!this.isValidObjectId(familyId)) {
      console.error("Invalid family ID format:", familyId);
      throw new Error("Invalid family ID format");
    }
    const token = this.getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
      const response = await fetch(`${API_BASE_URL}/support/family/${familyId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch support measures");
      }
      const data = await response.json();
      return data.map((measure: any) => ({
        id: measure.id,
        familyId: measure.familyId,
        category: measure.category || "social",
        type: measure.type,
        amount: measure.cost?.toString() || "0",
        date: new Date(measure.startDate).toISOString(),
        status: measure.status === "completed" ? "Оказано" : measure.status === "in-progress" ? "В процессе" : "Отказано",
        notes: measure.notes || "",
        createdBy: measure.createdBy?.fullName || measure.createdBy?.username || "Unknown",
        createdAt: new Date(measure.createdAt).toISOString(),
      }));
    } catch (error) {
      console.error("Error fetching support measures:", error);
      throw error;
    }
  }

  static async addSupportMeasure(measure: Omit<SupportMeasure, "id" | "createdAt">, userId: string): Promise<SupportMeasure> {
    const token = this.getAuthToken();
    if (!token) throw new Error("No auth token found");
  
    if (!this.isValidObjectId(measure.familyId)) {
      console.error("Invalid familyId:", measure.familyId);
      throw new Error("Invalid family ID format");
    }
  
    try {
      const payload = {
        familyId: measure.familyId,
        category: measure.category.toLowerCase(),
        type: measure.type,
        description: measure.notes || "No description provided",
        cost: parseFloat(measure.amount) || 0,
        startDate: measure.date,
        status: measure.status === "Оказано" ? "completed" : measure.status === "В процессе" ? "in-progress" : "cancelled",
        notes: measure.notes || "",
        createdById: userId,
      };
  
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5555/api";
      if (!API_BASE_URL) {
        console.error("API_BASE_URL is not defined");
        throw new Error("API base URL is not configured");
      }
  
      const url = `${API_BASE_URL}/support`;
      console.log("addSupportMeasure URL:", url);
      console.log("addSupportMeasure payload:", payload);
  
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
  
      let errorData;
      if (!response.ok) {
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
          console.error("Non-JSON response:", errorData);
        }
        console.error("addSupportMeasure response error:", errorData);
        throw new Error(errorData.message || `Failed to create support measure: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log("addSupportMeasure response data:", data);
  
      if (!data.supportMeasure) {
        console.error("Response missing supportMeasure:", data);
        throw new Error("Invalid response: supportMeasure not found");
      }
  
      const supportMeasure = data.supportMeasure;
      const createdMeasure: SupportMeasure = {
        id: supportMeasure.id,
        familyId: supportMeasure.familyId,
        category: supportMeasure.category ? supportMeasure.category.toLowerCase() : measure.category.toLowerCase(),
        type: supportMeasure.type,
        amount: supportMeasure.cost?.toString() || "0",
        date: new Date(supportMeasure.startDate).toISOString(),
        status: supportMeasure.status === "completed" ? "Оказано" : supportMeasure.status === "in-progress" ? "В процессе" : "Отказано",
        notes: supportMeasure.notes || supportMeasure.description || "",
        createdBy: supportMeasure.createdBy?.fullName || supportMeasure.createdBy?.username || "Unknown",
        createdAt: new Date(supportMeasure.createdAt).toISOString(),
      };
      console.log("Created support measure:", createdMeasure);
      return createdMeasure;
    } catch (error) {
      console.error("Error adding support measure:", error);
      throw error;
    }
  }

  static async updateSupportMeasure(measure: SupportMeasure, userId: string): Promise<SupportMeasure> {
    const token = this.getAuthToken();
    if (!token) throw new Error("No auth token found");
  
    if (!this.isValidObjectId(measure.familyId) || !this.isValidObjectId(measure.id)) {
      console.error("Invalid IDs:", { familyId: measure.familyId, measureId: measure.id });
      throw new Error("Invalid family or measure ID format");
    }
  
    try {
      const payload = {
        familyId: measure.familyId,
        category: measure.category.toLowerCase(),
        type: measure.type,
        description: measure.notes || "No description provided",
        cost: parseFloat(measure.amount) || 0,
        startDate: measure.date,
        status: measure.status === "Оказано" ? "completed" : measure.status === "В процессе" ? "in-progress" : "cancelled",
        notes: measure.notes || "",
        createdById: userId,
      };
  
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5555/api";
      const url = `${API_BASE_URL}/support/${measure.id}`;
      console.log("updateSupportMeasure URL:", url);
      console.log("updateSupportMeasure payload:", payload);
  
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
          console.error("Non-JSON response:", errorData);
        }
        console.error("updateSupportMeasure response error:", errorData);
        throw new Error(errorData.message || `Failed to update support measure: ${response.status}`);
      }
  
      const data = await response.json();
      if (!data.supportMeasure) {
        console.error("Response missing supportMeasure:", data);
        throw new Error("Invalid response: supportMeasure not found");
      }
  
      const supportMeasure = data.supportMeasure;
      const updatedMeasure: SupportMeasure = {
        id: supportMeasure.id,
        familyId: supportMeasure.familyId,
        category: supportMeasure.category ? supportMeasure.category.toLowerCase() : measure.category.toLowerCase(),
        type: supportMeasure.type,
        amount: supportMeasure.cost?.toString() || "0",
        date: new Date(supportMeasure.startDate).toISOString(),
        status: supportMeasure.status === "completed" ? "Оказано" : supportMeasure.status === "in-progress" ? "В процессе" : "Отказано",
        notes: supportMeasure.notes || supportMeasure.description || "",
        createdBy: supportMeasure.createdBy?.fullName || supportMeasure.createdBy?.username || "Unknown",
        createdAt: new Date(supportMeasure.createdAt).toISOString(),
      };
      console.log("Updated support measure:", updatedMeasure);
      return updatedMeasure;
    } catch (error) {
      console.error("Error updating support measure:", error);
      throw error;
    }
  }

  static async deleteSupportMeasure(measureId: string): Promise<void> {
    if (!this.isValidObjectId(measureId)) {
      console.error("Invalid support measure ID format:", measureId);
      throw new Error("Invalid support measure ID format");
    }
    const token = this.getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
      const response = await fetch(`${API_BASE_URL}/support/${measureId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete support measure");
      }
    } catch (error) {
      console.error("Error deleting support measure:", error);
      throw error;
    }
  }

  // Family Methods
  static async getFamilyById(id: string): Promise<Family | null> {
    if (!this.isValidObjectId(id)) {
      console.error("Invalid family ID format:", id);
      return null;
    }
    const token = this.getAuthToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/families/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch family");
      }
      const data = await response.json();
      return {
        id: data.id,
        name: data.familyName,
        iin: data.caseNumber,
        address: data.address,
        registrationAddress: data.registrationAddress || data.address,
        status: data.status,
        statusReason: data.statusReason || "",
        tzhsReason: data.tzhsReason || "",
        nbReason: data.nbReason || "",
        inspectionStatus: data.inspectionStatus || "not-inspected",
        familyType: data.familyType || "full",
        children: data._count?.members || 0,
        housingType: data.housingType || "apartment",
        employment: data.employment || "employed-official",
        workplace: data.workplace || "",
        familyIncome: data.familyIncome || "",
        needsSupport: data.needsSupport || false,
        needsEducation: data.needsEducation || false,
        needsHealth: data.needsHealth || false,
        needsPolice: data.needsPolice || false,
        hasDisability: data.hasDisability || false,
        isActive: data.isActive !== false,
        inactiveReason: data.inactiveReason || "",
        notes: data.notes || "",
        lastUpdate: new Date(data.lastUpdate).toLocaleDateString(),
      };
    } catch (error) {
      console.error("Error fetching family:", error);
      throw error;
    }
  }

  static async addFamily(data: Partial<Family>): Promise<Family | null> {
    const token = this.getAuthToken();
    if (!token) return null;

    try {
      const payload = {
        familyName: data.name,
        caseNumber: data.iin,
        address: data.address,
        registrationAddress: data.registrationAddress,
        status: data.status,
        statusReason: data.statusReason,
        tzhsReason: data.tzhsReason,
        nbReason: data.nbReason,
        inspectionStatus: data.inspectionStatus,
        familyType: data.familyType,
        housingType: data.housingType,
        employment: data.employment,
        workplace: data.workplace,
        familyIncome: data.familyIncome,
        needsSupport: data.needsSupport,
        needsEducation: data.needsEducation,
        needsHealth: data.needsHealth,
        needsPolice: data.needsPolice,
        hasDisability: data.hasDisability,
        isActive: data.isActive,
        inactiveReason: data.inactiveReason,
        notes: data.notes,
      };

      const response = await fetch(`${API_BASE_URL}/families`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add family");
      }
      const newData = await response.json();
      return {
        id: newData.id,
        name: newData.familyName,
        iin: newData.caseNumber,
        address: newData.address,
        registrationAddress: newData.registrationAddress || newData.address,
        status: newData.status,
        statusReason: newData.statusReason || "",
        tzhsReason: newData.tzhsReason || "",
        nbReason: newData.nbReason || "",
        inspectionStatus: newData.inspectionStatus || "not-inspected",
        familyType: newData.familyType || "full",
        children: newData._count?.members || 0,
        housingType: newData.housingType || "apartment",
        employment: newData.employment || "employed-official",
        workplace: newData.workplace || "",
        familyIncome: newData.familyIncome || "",
        needsSupport: newData.needsSupport || false,
        needsEducation: newData.needsEducation || false,
        needsHealth: newData.needsHealth || false,
        needsPolice: newData.needsPolice || false,
        hasDisability: newData.hasDisability || false,
        isActive: newData.isActive !== false,
        inactiveReason: newData.inactiveReason || "",
        notes: newData.notes || "",
        lastUpdate: new Date(newData.lastUpdate).toLocaleDateString(),
      };
    } catch (error) {
      console.error("Error adding family:", error);
      throw error;
    }
  }

  static async updateFamily(id: string, data: Partial<Family>): Promise<Family | null> {
    if (!this.isValidObjectId(id)) {
      console.error("Invalid family ID format:", id);
      return null;
    }
    const token = this.getAuthToken();
    if (!token) return null;

    try {
      const payload = {
        familyName: data.name,
        caseNumber: data.iin,
        address: data.address,
        registrationAddress: data.registrationAddress,
        status: data.status,
        statusReason: data.statusReason,
        tzhsReason: data.tzhsReason,
        nbReason: data.nbReason,
        inspectionStatus: data.inspectionStatus,
        familyType: data.familyType,
        housingType: data.housingType,
        employment: data.employment,
        workplace: data.workplace,
        familyIncome: data.familyIncome,
        needsSupport: data.needsSupport,
        needsEducation: data.needsEducation,
        needsHealth: data.needsHealth,
        needsPolice: data.needsPolice,
        hasDisability: data.hasDisability,
        isActive: data.isActive,
        inactiveReason: data.inactiveReason,
        notes: data.notes,
      };

      const response = await fetch(`${API_BASE_URL}/families/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update family");
      }
      const updatedData = await response.json();
      return {
        id: updatedData.id,
        name: updatedData.familyName,
        iin: updatedData.caseNumber,
        address: updatedData.address,
        registrationAddress: updatedData.registrationAddress || updatedData.address,
        status: updatedData.status,
        statusReason: updatedData.statusReason || "",
        tzhsReason: updatedData.tzhsReason || "",
        nbReason: updatedData.nbReason || "",
        inspectionStatus: updatedData.inspectionStatus || "not-inspected",
        familyType: updatedData.familyType || "full",
        children: updatedData._count?.members || 0,
        housingType: updatedData.housingType || "apartment",
        employment: updatedData.employment || "employed-official",
        workplace: updatedData.workplace || "",
        familyIncome: updatedData.familyIncome || "",
        needsSupport: updatedData.needsSupport || false,
        needsEducation: updatedData.needsEducation || false,
        needsHealth: updatedData.needsHealth || false,
        needsPolice: updatedData.needsPolice || false,
        hasDisability: updatedData.hasDisability || false,
        isActive: updatedData.isActive !== false,
        inactiveReason: updatedData.inactiveReason || "",
        notes: updatedData.notes || "",
        lastUpdate: new Date(updatedData.lastUpdate).toLocaleDateString(),
      };
    } catch (error) {
      console.error("Error updating family:", error);
      throw error;
    }
  }

  static async deleteFamily(id: string): Promise<void> {
    if (!this.isValidObjectId(id)) {
      console.error("Invalid family ID format:", id);
      throw new Error("Invalid family ID format");
    }
    const token = this.getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
      const response = await fetch(`${API_BASE_URL}/families/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete family");
      }
    } catch (error) {
      console.error("Error deleting family:", error);
      throw error;
    }
  }
}