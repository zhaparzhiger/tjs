const express = require("express")
const router = express.Router()
const {
  getFamilyStatsByRegion,
  getFamilyStatsByDistrict,
  getFamilyStatsByRiskLevel,
  getFamilyStatsByStatus,
  getSupportStatsByType,
  getSupportStatsByStatus,
  getFamilyMemberStatsByAge,
  getDashboardStats,
  getFamilyTypeStats,
} = require("../controllers/statistics.controller")
const { verifyToken, checkRegionAccess, filterFamiliesByAccess } = require("../middleware/auth")

// All routes require authentication
router.use(verifyToken)

// Apply access control middleware to all routes
router.use(checkRegionAccess)
router.use(filterFamiliesByAccess)

// Routes
router.get("/dashboard", getDashboardStats)
router.get("/families/region", getFamilyStatsByRegion)
router.get("/families/district", getFamilyStatsByDistrict)
router.get("/families/risk", getFamilyStatsByRiskLevel)
router.get("/families/status", getFamilyStatsByStatus)
router.get("/support/type", getSupportStatsByType)
router.get("/support/status", getSupportStatsByStatus)
router.get("/members/age", getFamilyMemberStatsByAge)
// Family type statistics
router.get("/families/type", getFamilyTypeStats)

// Replace your existing district route with this one
router.get("/families/district", getFamilyStatsByDistrict)
module.exports = router
