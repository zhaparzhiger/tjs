const express = require("express")
const router = express.Router()
const {
  generateFamiliesReport,
  generateFamilyMembersReport,
  generateSupportReport,
  generateAnalyticsReport,
} = require("../controllers/report.controller")
const { verifyToken, checkRegionAccess, filterFamiliesByAccess } = require("../middleware/auth")

// All routes require authentication
router.use(verifyToken)

// Apply access control middleware to all routes
router.use(checkRegionAccess)
router.use(filterFamiliesByAccess)

// Routes
router.get("/families", generateFamiliesReport)
router.get("/members", generateFamilyMembersReport)
router.get("/support", generateSupportReport)
router.get("/analytics", generateAnalyticsReport)

module.exports = router
