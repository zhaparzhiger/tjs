import type { SupportMeasure } from "@/types/models";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5555/api";

// Map frontend categories to backend types
const categoryToTypeMap: { [key: string]: string[] } = {
  social: ["asp", "zhp", "one-time", "fuel", "charity", "employment", "ssu"],
  education: ["vseobuch", "psychology", "kindergarten", "school"],
  health: ["attachment", "disability", "treatment", "ambulatory", "stationary", "medical-facility"],
  police: ["prevention", "registration", "involvement-act"],
  legal: ["restrictions", "deprivation", "kdn"],
  charity: ["financial", "material", "clothing", "food", "school-supplies"],
};

// Map backend types to frontend categories
const typeToCategoryMap: { [key: string]: string } = Object.entries(categoryToTypeMap).reduce(
  (acc, [category, types]) => {
    types.forEach((type) => {
      acc[type] = category;
    });
    return acc;
  },
  {} as { [key: string]: string },
);

// Map frontend status to backend status
const statusMap: { [key: string]: string } = {
  provided: "completed",
  "in-progress": "in-progress",
  rejected: "cancelled",
};

// Reverse status map for display
const reverseStatusMap: { [key: string]: string } = {
  completed: "Оказано",
  "in-progress": "В процессе",
  cancelled: "Отказано",
};

export const FamilyService = {
  async getFamilySupport(familyId: string): Promise<SupportMeasure[]> {
    if (!familyId) {
      throw new Error("Family ID is required");
    }

    const response = await fetch(`${API_BASE_URL}/family/${familyId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
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
      category: typeToCategoryMap[measure.type] || "other",
      type: measure.type,
      amount: measure.cost ? (measure.cost / 1000).toString() : "0",
      date: new Date(measure.startDate).toLocaleDateString("ru-RU"),
      status: reverseStatusMap[measure.status] || measure.status,
      notes: measure.notes || "",
      createdBy: measure.createdBy?.fullName || measure.createdBy?.username || "Unknown",
    }));
  },

  async addSupportMeasure(
    measure: Omit<SupportMeasure, "id" | "createdAt">,
    userId: string,
  ): Promise<SupportMeasure> {
    const payload = {
      familyId: measure.familyId,
      type: measure.type,
      description: measure.notes || `Support measure: ${measure.type}`,
      startDate: measure.date ? new Date(measure.date).toISOString() : new Date().toISOString(),
      status: statusMap[measure.status.toLowerCase()] || "in-progress",
      provider: "System", // Replace with actual provider if available
      cost: measure.amount ? parseFloat(measure.amount) * 1000 : null,
      notes: measure.notes || null,
      createdById: userId,
    };

    const response = await fetch(`${API_BASE_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add support measure");
    }

    const createdMeasure = await response.json();
    return {
      id: createdMeasure.supportMeasure.id,
      familyId: createdMeasure.supportMeasure.familyId,
      category: typeToCategoryMap[createdMeasure.supportMeasure.type] || "other",
      type: createdMeasure.supportMeasure.type,
      amount: createdMeasure.supportMeasure.cost
        ? (createdMeasure.supportMeasure.cost / 1000).toString()
        : "0",
      date: new Date(createdMeasure.supportMeasure.startDate).toLocaleDateString("ru-RU"),
      status: reverseStatusMap[createdMeasure.supportMeasure.status] || createdMeasure.supportMeasure.status,
      notes: createdMeasure.supportMeasure.notes || "",
      createdBy:
        createdMeasure.supportMeasure.createdBy?.fullName ||
        createdMeasure.supportMeasure.createdBy?.username ||
        "Unknown",
    };
  },

  async updateSupportMeasure(measure: SupportMeasure, userId: string): Promise<SupportMeasure> {
    const payload = {
      type: measure.type,
      description: measure.notes || `Support measure: ${measure.type}`,
      startDate: measure.date ? new Date(measure.date).toISOString() : undefined,
      status: statusMap[measure.status.toLowerCase()] || "in-progress",
      provider: "System", // Replace with actual provider if available
      cost: measure.amount ? parseFloat(measure.amount) * 1000 : null,
      notes: measure.notes || null,
    };

    const response = await fetch(`${API_BASE_URL}/${measure.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update support measure");
    }

    const updatedMeasure = await response.json();
    return {
      id: updatedMeasure.supportMeasure.id,
      familyId: updatedMeasure.supportMeasure.familyId,
      category: typeToCategoryMap[updatedMeasure.supportMeasure.type] || "other",
      type: updatedMeasure.supportMeasure.type,
      amount: updatedMeasure.supportMeasure.cost
        ? (updatedMeasure.supportMeasure.cost / 1000).toString()
        : "0",
      date: new Date(updatedMeasure.supportMeasure.startDate).toLocaleDateString("ru-RU"),
      status: reverseStatusMap[updatedMeasure.supportMeasure.status] || updatedMeasure.supportMeasure.status,
      notes: updatedMeasure.supportMeasure.notes || "",
      createdBy:
        updatedMeasure.supportMeasure.createdBy?.fullName ||
        updatedMeasure.supportMeasure.createdBy?.username ||
        "Unknown",
    };
  },

  async deleteSupportMeasure(measureId: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/${measureId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete support measure");
    }

    return true;
  },
};