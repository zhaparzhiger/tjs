const jwt = require("jsonwebtoken")
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const JWT_SECRET = "vnos"

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "No token provided" })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" })
  }
}

// Middleware to check if user has admin role
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Requires admin role" })
  }
  next()
}

// Middleware to check if user has regional access
const hasRegionalAccess = (req, res, next) => {
  if (req.user.role === "admin" || req.user.role === "REGIONAL") {
    return next()
  }
  return res.status(403).json({ message: "Requires regional access" })
}

// Middleware to check if user has district access
const hasDistrictAccess = (req, res, next) => {
  if (["admin", "REGIONAL", "DISTRICT"].includes(req.user.role)) {
    return next()
  }
  return res.status(403).json({ message: "Requires district access" })
}

// Middleware to check if user has access to specific region
const checkRegionAccess = async (req, res, next) => {
  try {
      
    // Admin has access to all regions
    if (req.user.role === "admin") {
      return next()
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Regional users can only access their region
    if (req.user.role === "REGIONAL") {
      req.userRegion = user.region
      return next()
    }

    // District users can only access their district
    if (req.user.role === "DISTRICT") {
      if (!user.district) {
        return res.status(403).json({ message: "User has no assigned district" })
      }
      req.userRegion = user.region
      req.userDistrict = user.district
      return next()
    }

    // School, mobile, police, health users can only access their city/district
    if (["SCHOOL", "MOBILE", "POLICE", "HEALTH"].includes(req.user.role)) {
      if (!user.district || !user.city) {
        return res.status(403).json({ message: "User has no assigned district or city" })
      }
      req.userRegion = user.region
      req.userDistrict = user.district
      req.userCity = user.city
      return next()
    }

    return res.status(403).json({ message: "Insufficient permissions" })
  } catch (error) {
    console.error("Error in checkRegionAccess middleware:", error)
    return res.status(500).json({ message: "Server error" })
  }
}

// Middleware to filter families based on user's access level
const filterFamiliesByAccess = async (req, res, next) => {
  try {
    if (req.user.role === "admin") {
      // Admin can see all families
      return next()
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Set filter based on user role and location
    if (req.user.role === "REGIONAL") {
      req.familyFilter = { region: user.region }
    } else if (req.user.role === "DISTRICT") {
      req.familyFilter = {
        region: user.region,
        district: user.district,
      }
    } else {
      // School, mobile, police, health users
      req.familyFilter = {
        region: user.region,
        district: user.district,
        city: user.city,
      }
    }

    next()
  } catch (error) {
    console.error("Error in filterFamiliesByAccess middleware:", error)
    return res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  verifyToken,
  isAdmin,
  hasRegionalAccess,
  hasDistrictAccess,
  checkRegionAccess,
  filterFamiliesByAccess,
}
