const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "vnos";

console.log("middleware/auth: JWT_SECRET:", JWT_SECRET);

const roleMap = {
    "Администратор": "admin",
    "администратор": "admin",
    "Полиция": "police",
    "Социальная сфера": "social",
    "Социальная служба": "social",
    "Образование": "school",
    "Здравоохранение": "health",
    "Ш unprotected routesкола": "school",
    "Район": "district",
    "Мобильная группа": "mobile",
    "Регион": "regional",
    "ADMIN": "admin",
    "REGIONAL": "regional",
    "DISTRICT": "district",
    "SCHOOL": "school",
    "MOBILE": "mobile",
    "POLICE": "police",
    "HEALTH": "health",
};

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("verifyToken: authHeader:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("verifyToken: No token provided or invalid format");
        return res.status(401).json({ message: "No token provided or invalid format" });
    }

    const token = authHeader.split(" ")[1];
    console.log("verifyToken: token:", token);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("verifyToken: decoded:", decoded);

        const normalizedRole = roleMap[decoded.role] || decoded.role.toLowerCase();
        req.user = {...decoded, role: normalizedRole };
        console.log("verifyToken: normalizedRole:", normalizedRole, "req.user:", req.user);

        next();
    } catch (error) {
        console.error("verifyToken error:", error.name, error.message);
        return res.status(401).json({ message: "Invalid token", error: error.message });
    }
};

const isAdmin = (req, res, next) => {
    console.log("isAdmin: req.user:", req.user);
    if (req.user.role !== "admin") {
        console.log("isAdmin: Requires admin role, current role:", req.user.role);
        return res.status(403).json({ message: "Requires admin role" });
    }
    next();
};

const hasRegionalAccess = (req, res, next) => {
    console.log("hasRegionalAccess: req.user:", req.user);
    if (["admin", "regional"].includes(req.user.role)) {
        return next();
    }
    return res.status(403).json({ message: "Requires regional access" });
};

const hasDistrictAccess = (req, res, next) => {
    console.log("hasDistrictAccess: req.user:", req.user);
    if (["admin", "regional", "district"].includes(req.user.role)) {
        return next();
    }
    return res.status(403).json({ message: "Requires district access" });
};

const checkRegionAccess = async(req, res, next) => {
    try {
        console.log("checkRegionAccess: req.user:", req.user);
        if (req.user.role === "admin") {
            return next();
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (req.user.role === "regional") {
            req.userRegion = user.region;
            return next();
        }

        if (req.user.role === "district") {
            if (!user.district) {
                return res.status(403).json({ message: "User has no assigned district" });
            }
            req.userRegion = user.region;
            req.userDistrict = user.district;
            return next();
        }

        if (["school", "mobile", "police", "health", "social"].includes(req.user.role)) {
            if (!user.district || !user.city) {
                return res.status(403).json({ message: "User has no assigned district or city" });
            }
            req.userRegion = user.region;
            req.userDistrict = user.district;
            req.userCity = user.city;
            return next();
        }

        return res.status(403).json({ message: "Insufficient permissions" });
    } catch (error) {
        console.error("Error in checkRegionAccess middleware:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

const filterFamiliesByAccess = async(req, res, next) => {
    try {
        console.log("filterFamiliesByAccess: req.user:", req.user);
        if (req.user.role === "admin") {
            return next();
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (req.user.role === "regional") {
            req.familyFilter = { region: user.region };
        } else if (req.user.role === "district") {
            req.familyFilter = {
                region: user.region,
                district: user.district,
            };
        } else {
            req.familyFilter = {
                region: user.region,
                district: user.district,
                city: user.city,
            };
        }

        next();
    } catch (error) {
        console.error("Error in filterFamiliesByAccess middleware:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    verifyToken,
    isAdmin,
    hasRegionalAccess,
    hasDistrictAccess,
    checkRegionAccess,
    filterFamiliesByAccess,
};