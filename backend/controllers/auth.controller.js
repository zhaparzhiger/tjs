const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "vnos";

console.log("authController: JWT_SECRET:", JWT_SECRET);

const roleMap = {
    "Администратор": "admin",
    "Школа": "school",
    "Район": "district",
    "Мобильная группа": "mobile",
    "Полиция": "police",
    "Здравоохранение": "health",
    "Регион": "regional",
    "Социальная служба": "social",
};

const login = async(req, res) => {
    try {
        const { iin, password } = req.body;

        if (!iin || !password) {
            return res.status(400).json({ message: "ИИН и пароль обязательны" });
        }

        const user = await prisma.user.findUnique({
            where: { iin },
        });

        if (!user) {
            return res.status(401).json({ message: "Неверные учетные данные" });
        }

        if (!user.isActive) {
            return res.status(401).json({ message: "Аккаунт заблокирован" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Неверные учетные данные" });
        }

        await prisma.user.update({
            where: { iin },
            data: { lastLogin: new Date() },
        });

        const normalizedRole = roleMap[user.role] || user.role.toLowerCase();

        const token = jwt.sign({
                id: user.id,
                iin: user.iin,
                role: normalizedRole,
                region: user.region,
                district: user.district,
                city: user.city,
            },
            JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION || "24h" }
        );

        const { password: _, ...userWithoutPassword } = user;

        console.log("Login response:", { token, user: {...userWithoutPassword, role: normalizedRole } });

        res.status(200).json({
            message: "Вход выполнен успешно",
            token,
            user: {...userWithoutPassword, role: normalizedRole },
        });
    } catch (error) {
        console.error("Ошибка в login controller:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

const getProfile = async(req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
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
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        const normalizedRole = roleMap[user.role] || user.role.toLowerCase();

        res.status(200).json({...user, role: normalizedRole });
    } catch (error) {
        console.error("Ошибка в getProfile controller:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

const changePassword = async(req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
        });

        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Текущий пароль неверный" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({
            where: { id: req.user.id },
            data: { password: hashedPassword },
        });

        res.status(200).json({ message: "Пароль успешно изменен" });
    } catch (error) {
        console.error("Ошибка в changePassword controller:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

module.exports = {
    login,
    getProfile,
    changePassword,
};