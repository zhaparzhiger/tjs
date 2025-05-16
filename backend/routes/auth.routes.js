const express = require("express");
const router = express.Router();
const { login, getProfile, changePassword } = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth");

router.post("/login", login);
router.get("/profile", verifyToken, getProfile);
router.post("/change-password", verifyToken, changePassword);

module.exports = router;