const express = require("express")
const router = express.Router()
const { register, login, getProfile, changePassword } = require("../controllers/auth.controller")
const { verifyToken, isAdmin } = require("../middleware/auth")

// Public routes
router.post("/login", login)

// Protected routes
router.post("/register", verifyToken, isAdmin, register)
router.get("/profile", verifyToken, getProfile)
router.post("/change-password", verifyToken, changePassword)

module.exports = router
