const bcrypt = require("bcryptjs")
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
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

    res.status(200).json(users)
  } catch (error) {
    console.error("Error in getAllUsers controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id },
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
    console.error("Error in getUserById controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Create a new user (admin only)
const createUser = async (req, res) => {
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
      message: "User created successfully",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Error in createUser controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { fullName, email, phone, role, region, district, city, position, isActive } = req.body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" })
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        fullName,
        email,
        phone,
        role,
        region,
        district,
        city,
        position,
        isActive,
      },
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

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error in updateUser controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Reset user password (admin only)
const resetPassword = async (req, res) => {
  try {
    const { id } = req.params
    const { newPassword } = req.body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" })
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // Update password
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    })

    res.status(200).json({ message: "Password reset successfully" })
  } catch (error) {
    console.error("Error in resetPassword controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" })
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    })

    res.status(200).json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error in deleteUser controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get users by role
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params

    const users = await prisma.user.findMany({
      where: { role },
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

    res.status(200).json(users)
  } catch (error) {
    console.error("Error in getUsersByRole controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get users by region
const getUsersByRegion = async (req, res) => {
  try {
    const { region } = req.params

    const users = await prisma.user.findMany({
      where: { region },
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

    res.status(200).json(users)
  } catch (error) {
    console.error("Error in getUsersByRegion controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  resetPassword,
  deleteUser,
  getUsersByRole,
  getUsersByRegion,
}
