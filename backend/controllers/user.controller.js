const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const roleMap = {
  "Администратор": "admin",
  "администратор": "admin",
  "Полиция": "police",
  "Социальная сфера": "social",
  "Образование": "school",
  "Здравоохранение": "health",
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        iin: true,
        fullName: true,
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
    });

    // Нормализуем роли в ответе
    const normalizedUsers = users.map((user) => ({
      ...user,
      role: roleMap[user.role] || user.role.toLowerCase(),
    }));

    res.status(200).json(normalizedUsers);
  } catch (error) {
    console.error("Error in getAllUsers controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        iin: true,
        fullName: true,
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
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Нормализуем роль
    const normalizedUser = {
      ...user,
      role: roleMap[user.role] || user.role.toLowerCase(),
    };

    res.status(200).json(normalizedUser);
  } catch (error) {
    console.error("Error in getUserById controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new user (admin only)
const createUser = async (req, res) => {
  try {
    const { iin, password, fullName, phone, role, region, district, city, position } = req.body;

    // Validate IIN (12 digits)
    if (!/^\d{12}$/.test(iin)) {
      return res.status(400).json({ message: "ИИН должен состоять из 12 цифр" });
    }

    // Check if IIN already exists
    const existingUser = await prisma.user.findUnique({
      where: { iin },
    });

    if (existingUser) {
      return res.status(400).json({ message: "ИИН уже существует" });
    }

    // Validate and normalize role
    const validRoles = ["Администратор", "Полиция", "Социальная сфера", "Образование", "Здравоохранение"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Недопустимая роль" });
    }
    const normalizedRole = roleMap[role] || role.toLowerCase();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        iin,
        password: hashedPassword,
        fullName,
        phone,
        role: normalizedRole,
        region,
        district,
        city,
        position,
        isActive: true,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: "Пользователь успешно создан",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error in createUser controller:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, role, region, district, city, position, isActive } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    // Validate and normalize role
    let normalizedRole = existingUser.role;
    if (role) {
      const validRoles = ["Администратор", "Полиция", "Социальная сфера", "Образование", "Здравоохранение"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Недопустимая роль" });
      }
      normalizedRole = roleMap[role] || role.toLowerCase();
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        fullName,
        phone,
        role: normalizedRole,
        region,
        district,
        city,
        position,
        isActive,
      },
      select: {
        id: true,
        iin: true,
        fullName: true,
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
    });

    res.status(200).json({
      message: "Пользователь успешно обновлен",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateUser controller:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// Reset user password (admin only)
const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "Пароль успешно сброшен" });
  } catch (error) {
    console.error("Error in resetPassword controller:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    res.status(200).json({ message: "Пользователь успешно удален" });
  } catch (error) {
    console.error("Error in deleteUser controller:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// Get users by role
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    // Validate role
    const validRoles = ["Администратор", "Полиция", "Социальная сфера", "Образование", "Здравоохранение"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Недопустимая роль" });
    }

    const users = await prisma.user.findMany({
      where: { role: roleMap[role] || role },
      select: {
        id: true,
        iin: true,
        fullName: true,
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
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUsersByRole controller:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// Get users by region
const getUsersByRegion = async (req, res) => {
  try {
    const { region } = req.params;

    const users = await prisma.user.findMany({
      where: { region },
      select: {
        id: true,
        iin: true,
        fullName: true,
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
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUsersByRegion controller:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  resetPassword,
  deleteUser,
  getUsersByRole,
  getUsersByRegion,
};