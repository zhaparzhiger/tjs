import { FamilyMember } from "@/types/models";

export class FamilyService {
  static async getFamilyMemberById(id: string): Promise<FamilyMember | null> {
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      console.error("Invalid ID format:", id);
      return null;
    }
    const token = localStorage.getItem("auth_token");
    if (!token) {
      console.error("No auth token found");
      return null;
    }
    try {
      const response = await fetch(`http://localhost:5555/api/family-members/${id}`, {
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

  static async updateFamilyMember(id: string, data: Partial<FamilyMember>): Promise<FamilyMember | null> {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      console.error("No auth token found");
      return null;
    }
    try {
      const nameParts = data.name?.trim().split(/\s+/).filter(Boolean) || [];
      const firstName = nameParts[0] || "";
      const lastName = nameParts[1] || "";
      const middleName = nameParts.slice(2).join(" ") || null;

      const payload = {
        firstName,
        lastName,
        middleName,
        documentNumber: data.iin,
        relationship: data.relation,
        birthDate: data.age
          ? new Date(new Date().setFullYear(new Date().getFullYear() - data.age)).toISOString()
          : null,
      };

      const response = await fetch(`http://localhost:5555/api/family-members/${id}`, {
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
        status: data.status || "Взрослый",
      };
    } catch (error) {
      console.error("Error updating family member:", error);
      return null;
    }
  }
}