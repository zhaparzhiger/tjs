const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const JWT_SECRET = "vnos"

// Register a new user
const register = async (req, res) => {
  try {
    const { username, password, fullName, email, phone, role, region, district, city, position } = req.body

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        fullName,
        email,
        phone,
        role,
        region,
        district,
        city,
        position,
        isActive: true,
      },
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser

    res.status(201).json({
      message: "User registered successfully",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Error in register controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Login user
const login = async (req, res) => {
  try {
    const { username, password } = req.body

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: "Account is disabled" })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        region: user.region,
        district: user.district,
        city: user.city,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    res.status(200).json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Error in login controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        region: true,
        district: true,
        city: true,
        position: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json(user)
  } catch (error) {
    console.error("Error in getProfile controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" })
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    })

    res.status(200).json({ message: "Password changed successfully" })
  } catch (error) {
    console.error("Error in changePassword controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  register,
  login,
  getProfile,
  changePassword,
}
