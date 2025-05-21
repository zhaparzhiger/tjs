import { fetchFromAPI } from "./api"

// Types for statistics data
export interface RegionStat {
  region: string
  count: number
  children?: number
}

export interface DistrictStat {
  district: string
  count: number
  children?: number
}

export interface RiskLevelStat {
  riskLevel: string
  count: number
}

export interface StatusStat {
  status: string
  count: number
}

export interface SupportTypeStat {
  type: string
  count: number
}

export interface SupportStatusStat {
  status: string
  count: number
}

export interface AgeStat {
  ageGroup: string
  count: number
}

export interface DashboardStats {
  totalFamilies: number
  familiesByRiskLevel: { riskLevel: string; _count: number }[]
  familiesByStatus: { status: string; _count: number }[]
  totalFamilyMembers: number
  totalSupportMeasures: number
  supportMeasuresByStatus: { status: string; _count: number }[]
  supportMeasuresByType: { type: string; _count: number }[]
  recentFamilies: any[]
  recentSupportMeasures: any[]
}

// Statistics API service
const statisticsService = {
  // Get dashboard overview statistics
  getDashboardStats: () => fetchFromAPI<DashboardStats>("/statistics/dashboard"),

  // Get family statistics by region
  getFamilyStatsByRegion: () => fetchFromAPI<RegionStat[]>("/statistics/families/region"),

  // Get family statistics by district
  getFamilyStatsByDistrict: () => fetchFromAPI<DistrictStat[]>("/statistics/families/district"),

  // Get family statistics by risk level
  getFamilyStatsByRiskLevel: () => fetchFromAPI<RiskLevelStat[]>("/statistics/families/risk"),

  // Get family statistics by status
  getFamilyStatsByStatus: () => fetchFromAPI<StatusStat[]>("/statistics/families/status"),

  // Get support statistics by type
  getSupportStatsByType: () => fetchFromAPI<SupportTypeStat[]>("/statistics/support/type"),

  // Get support statistics by status
  getSupportStatsByStatus: () => fetchFromAPI<SupportStatusStat[]>("/statistics/support/status"),

  // Get family member statistics by age
  getFamilyMemberStatsByAge: () => fetchFromAPI<AgeStat[]>("/statistics/members/age"),
}

export default statisticsService
