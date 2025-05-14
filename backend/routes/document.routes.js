const express = require("express")
const router = express.Router()
const {
  getAllDocuments,
  getFamilyDocuments,
  getDocumentById,
  uploadDocument,
  deleteDocument,
} = require("../controllers/document.controller")
const { verifyToken, checkRegionAccess, filterFamiliesByAccess } = require("../middleware/auth")

// All routes require authentication
router.use(verifyToken)

// Apply access control middleware to all routes
router.use(checkRegionAccess)
router.use(filterFamiliesByAccess)

// Routes
router.get("/", getAllDocuments)
router.get("/family/:familyId", getFamilyDocuments)
router.get("/:id", getDocumentById)
router.post("/upload", uploadDocument)
router.delete("/:id", deleteDocument)

module.exports = router
