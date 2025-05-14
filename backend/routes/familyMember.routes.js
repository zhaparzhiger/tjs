const express = require("express")
const router = express.Router()
const {
  getFamilyMembers,
  getFamilyMemberById,
  createFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  searchFamilyMembers,
} = require("../controllers/familyMember.controller")
const { verifyToken, checkRegionAccess, filterFamiliesByAccess } = require("../middleware/auth")

// All routes require authentication
router.use(verifyToken)

// Apply access control middleware to all routes
router.use(checkRegionAccess)
router.use(filterFamiliesByAccess)

// Routes
router.get("/family/:familyId", getFamilyMembers)
router.get("/search", searchFamilyMembers)
router.get("/:id", getFamilyMemberById)
router.post("/", createFamilyMember)
router.put("/:id", updateFamilyMember)
router.delete("/:id", deleteFamilyMember)

module.exports = router
