export type UserRole =
  | "admin"
  | "school"
  | "district"
  | "mobile"
  | "police"
  | "health"
  | "regional"
  | "social"
  | "ADMIN"
  | "SCHOOL"
  | "DISTRICT"
  | "MOBILE"
  | "POLICE"
  | "HEALTH"
  | "REGIONAL"
  | "SOCIAL";

interface RolePermissions {
  canViewDocuments: boolean;
  canViewMap: boolean;
  canViewStatistics: boolean;
  canViewReports: boolean;
  canManageUsers: boolean;
  canExportData: boolean;
  canManageSettings: boolean;
  canAddFamily: boolean; // Added for FamiliesPage
}

interface RoleConfig {
  displayName: string;
  permissions: RolePermissions;
}

export const roleConfigs: Record<UserRole, RoleConfig> = {
  admin: {
    displayName: "Администратор",
    permissions: {
      canViewDocuments: true,
      canViewMap: true,
      canViewStatistics: true,
      canViewReports: true,
      canManageUsers: true,
      canExportData: true,
      canManageSettings: true,
      canAddFamily: true,
    },
  },
  school: {
    displayName: "Школа",
    permissions: {
      canViewDocuments: true,
      canViewMap: false,
      canViewStatistics: false,
      canViewReports: false,
      canManageUsers: false,
      canExportData: false,
      canManageSettings: false,
      canAddFamily: false,
    },
  },
  district: {
    displayName: "Район",
    permissions: {
      canViewDocuments: true,
      canViewMap: true,
      canViewStatistics: true,
      canViewReports: true,
      canManageUsers: false,
      canExportData: true,
      canManageSettings: false,
      canAddFamily: true,
    },
  },
  mobile: {
    displayName: "Мобильная группа",
    permissions: {
      canViewDocuments: true,
      canViewMap: true,
      canViewStatistics: false,
      canViewReports: false,
      canManageUsers: false,
      canExportData: false,
      canManageSettings: false,
      canAddFamily: false,
    },
  },
  police: {
    displayName: "Полиция",
    permissions: {
      canViewDocuments: true,
      canViewMap: true,
      canViewStatistics: false,
      canViewReports: true,
      canManageUsers: false,
      canExportData: false,
      canManageSettings: false,
      canAddFamily: false,
    },
  },
  health: {
    displayName: "Здравоохранение",
    permissions: {
      canViewDocuments: true,
      canViewMap: false,
      canViewStatistics: false,
      canViewReports: true,
      canManageUsers: false,
      canExportData: false,
      canManageSettings: false,
      canAddFamily: false,
    },
  },
  regional: {
    displayName: "Регион",
    permissions: {
      canViewDocuments: true,
      canViewMap: true,
      canViewStatistics: true,
      canViewReports: true,
      canManageUsers: false,
      canExportData: true,
      canManageSettings: false,
      canAddFamily: true,
    },
  },
  social: {
    displayName: "Социальная служба",
    permissions: {
      canViewDocuments: true,
      canViewMap: false,
      canViewStatistics: false,
      canViewReports: true,
      canManageUsers: false,
      canExportData: false,
      canManageSettings: false,
      canAddFamily: true, // Allow social role to add families
    },
  },
  // Uppercase roles
  ADMIN: {
    displayName: "Администратор",
    permissions: {
      canViewDocuments: true,
      canViewMap: true,
      canViewStatistics: true,
      canViewReports: true,
      canManageUsers: true,
      canExportData: true,
      canManageSettings: true,
      canAddFamily: true,
    },
  },
  SCHOOL: {
    displayName: "Школа",
    permissions: {
      canViewDocuments: true,
      canViewMap: false,
      canViewStatistics: false,
      canViewReports: false,
      canManageUsers: false,
      canExportData: false,
      canManageSettings: false,
      canAddFamily: false,
    },
  },
  DISTRICT: {
    displayName: "Район",
    permissions: {
      canViewDocuments: true,
      canViewMap: true,
      canViewStatistics: true,
      canViewReports: true,
      canManageUsers: false,
      canExportData: true,
      canManageSettings: false,
      canAddFamily: true,
    },
  },
  MOBILE: {
    displayName: "Мобильная группа",
    permissions: {
      canViewDocuments: true,
      canViewMap: true,
      canViewStatistics: false,
      canViewReports: false,
      canManageUsers: false,
      canExportData: false,
      canManageSettings: false,
      canAddFamily: false,
    },
  },
  POLICE: {
    displayName: "Полиция",
    permissions: {
      canViewDocuments: true,
      canViewMap: true,
      canViewStatistics: false,
      canViewReports: true,
      canManageUsers: false,
      canExportData: false,
      canManageSettings: false,
      canAddFamily: false,
    },
  },
  HEALTH: {
    displayName: "Здравоохранение",
    permissions: {
      canViewDocuments: true,
      canViewMap: false,
      canViewStatistics: false,
      canViewReports: true,
      canManageUsers: false,
      canExportData: false,
      canManageSettings: false,
      canAddFamily: false,
    },
  },
  REGIONAL: {
    displayName: "Регион",
    permissions: {
      canViewDocuments: true,
      canViewMap: true,
      canViewStatistics: true,
      canViewReports: true,
      canManageUsers: false,
      canExportData: true,
      canManageSettings: false,
      canAddFamily: true,
    },
  },
  SOCIAL: {
    displayName: "Социальная служба",
    permissions: {
      canViewDocuments: true,
      canViewMap: false,
      canViewStatistics: false,
      canViewReports: true,
      canManageUsers: false,
      canExportData: false,
      canManageSettings: false,
      canAddFamily: true,
    },
  },
};