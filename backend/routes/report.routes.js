const express = require("express")
const router = express.Router()
const {
  generateFamiliesReport,
  generateFamilyMembersReport,
  generateSupportReport,
  generateAnalyticsReport,
} = require("../controllers/report.controller")
const { verifyToken } = require("../middleware/auth")

// All routes require authentication
router.use(verifyToken)

// Routes
router.get("/families", generateFamiliesReport)
router.get("/members", generateFamilyMembersReport)
router.get("/support", generateSupportReport)
router.get("/analytics", generateAnalyticsReport)

// New route to re-generate a report
router.post("/regenerate", async (req, res) => {
  try {
    const { type, format, params } = req.body
    const endpointMap = {
      families: generateFamiliesReport,
      members: generateFamilyMembersReport,
      support: generateSupportReport,
      analytics: generateAnalyticsReport,
    }

    const generateFunction = endpointMap[type]
    if (!generateFunction) {
      return res.status(400).json({ message: "Invalid report type" })
    }

    // Simulate query parameters
    req.query = {
      format: format || "excel",
      district: params.district,
      startDate: params.startDate,
      endDate: params.endDate,
    }

    // Call the appropriate report generation function
    await generateFunction(req, res)
  } catch (error) {
    console.error("Error in regenerate report:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router