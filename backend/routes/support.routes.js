const express = require("express")
const router = express.Router()
const {
  getFamilySupport,
  getSupportMeasureById,
  createSupportMeasure,
  updateSupportMeasure,
  deleteSupportMeasure,
  getSupportMeasuresByType,
  getSupportMeasuresByStatus,
} = require("../controllers/support.controller")
const { verifyToken, checkRegionAccess, filterFamiliesByAccess } = require("../middleware/auth")

// All routes require authentication
router.use(verifyToken)

// Apply access control middleware to all routes
router.use(checkRegionAccess)
router.use(filterFamiliesByAccess)

// Routes
router.get("/family/:familyId", getFamilySupport)
router.get("/type/:type", getSupportMeasuresByType)
router.get("/status/:status", getSupportMeasuresByStatus)
router.get("/:id", getSupportMeasureById)
router.post("/", createSupportMeasure)
router.put("/:id", updateSupportMeasure)
router.delete("/:id", deleteSupportMeasure)

module.exports = router
