const express = require("express")
const router = express.Router()
const {
  getAllFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
  deleteFamily,
  getFamiliesByStatus,
  getFamiliesByRiskLevel,
  getFamilyHistory,
  searchFamilies,
} = require("../controllers/family.controller")
const { verifyToken, checkRegionAccess, filterFamiliesByAccess, isAdmin } = require("../middleware/auth")

// All routes require authentication
router.use(verifyToken)

// Apply access control middleware to all routes
router.use(checkRegionAccess)
router.use(filterFamiliesByAccess)

// Routes
router.get("/", getAllFamilies)
router.get("/status/:status", getFamiliesByStatus)
router.get("/risk/:riskLevel", getFamiliesByRiskLevel)
router.get("/search", searchFamilies)
router.get("/:id", getFamilyById)
router.get("/:id/history", getFamilyHistory)
router.post("/", createFamily)
router.put("/:id", updateFamily)
router.delete("/:id", isAdmin, deleteFamily)

module.exports = router
