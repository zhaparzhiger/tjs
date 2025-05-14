const express = require("express")
const router = express.Router()
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  resetPassword,
  deleteUser,
  getUsersByRole,
  getUsersByRegion,
} = require("../controllers/user.controller")
const { verifyToken, isAdmin, hasRegionalAccess } = require("../middleware/auth")

// All routes require authentication
router.use(verifyToken)

// Admin only routes
router.post("/", isAdmin, createUser)
router.put("/:id/reset-password", isAdmin, resetPassword)
router.delete("/:id", isAdmin, deleteUser)

// Regional access routes
router.get("/", hasRegionalAccess, getAllUsers)
router.get("/role/:role", hasRegionalAccess, getUsersByRole)
router.get("/region/:region", hasRegionalAccess, getUsersByRegion)
router.get("/:id", hasRegionalAccess, getUserById)
router.put("/:id", hasRegionalAccess, updateUser)

module.exports = router
