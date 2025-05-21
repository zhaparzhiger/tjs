const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

// Get family statistics by region
const getFamilyStatsByRegion = async (req, res) => {
  try {
    // Apply filter based on user's access level (set by middleware)
    const filter = req.familyFilter || {}

    // Group by region and count
    const regionStats = await prisma.family.groupBy({
      by: ["region"],
      where: filter,
      _count: {
        _all: true,
      },
    })

    // Format the response
    const formattedStats = regionStats.map((stat) => ({
      region: stat.region,
      count: stat._count._all,
    }))

    res.status(200).json(formattedStats)
  } catch (error) {
    console.error("Error in getFamilyStatsByRegion controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}
const getFamilyTypeStats = async (req, res) => {
  try {
    // Get family types statistics
    const familyTypes = await prisma.family.groupBy({
      by: ["familyType"],
      _count: {
        id: true,
      },
      where: req.familyFilter || {}, // Apply access filters if present
    })

    // Transform the data for the frontend
    const result = familyTypes.map((item) => ({
      type: item.familyType || "Не указан",
      count: item._count.id,
    }))

    res.status(200).json(result)
  } catch (error) {
    console.error("Error fetching family type statistics:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

// Add this function to get accurate children count by district
const getFamilyStatsByDistrict = async (req, res) => {
  try {
    // Get families grouped by district
    const districtStats = await prisma.family.groupBy({
      by: ["district"],
      _count: {
        id: true,
      },
      where: req.familyFilter || {}, // Apply access filters if present
    })

    // For each district, count the children
    const result = await Promise.all(
      districtStats.map(async (district) => {
        // Get all families in this district
        const families = await prisma.family.findMany({
          where: {
            district: district.district,
            ...req.familyFilter,
          },
          select: {
            id: true,
          },
        })

        const familyIds = families.map((f) => f.id)

        // Count children in these families (members with status Школьник, Дошкольник, or Студент)
        const childrenCount = await prisma.familyMember.count({
          where: {
            familyId: { in: familyIds },
            status: { in: ["Школьник", "Дошкольник", "Студент"] },
          },
        })

        return {
          district: district.district || "Не указан",
          count: district._count.id,
          children: childrenCount,
        }
      }),
    )

    res.status(200).json(result)
  } catch (error) {
    console.error("Error fetching district statistics:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}
// Get family statistics by district


// Get family statistics by risk level
const getFamilyStatsByRiskLevel = async (req, res) => {
  try {
    // Apply filter based on user's access level (set by middleware)
    const filter = req.familyFilter || {}

    // Group by risk level and count
    const riskLevelStats = await prisma.family.groupBy({
      by: ["riskLevel"],
      where: filter,
      _count: {
        _all: true,
      },
    })

    // Format the response
    const formattedStats = riskLevelStats.map((stat) => ({
      riskLevel: stat.riskLevel,
      count: stat._count._all,
    }))

    res.status(200).json(formattedStats)
  } catch (error) {
    console.error("Error in getFamilyStatsByRiskLevel controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get family statistics by status
const getFamilyStatsByStatus = async (req, res) => {
  try {
    // Apply filter based on user's access level (set by middleware)
    const filter = req.familyFilter || {}

    // Group by status and count
    const statusStats = await prisma.family.groupBy({
      by: ["status"],
      where: filter,
      _count: {
        _all: true,
      },
    })

    // Format the response
    const formattedStats = statusStats.map((stat) => ({
      status: stat.status,
      count: stat._count._all,
    }))

    res.status(200).json(formattedStats)
  } catch (error) {
    console.error("Error in getFamilyStatsByStatus controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get support measure statistics by type
const getSupportStatsByType = async (req, res) => {
  try {
    // Get families user has access to
    let familyFilter = {}
    if (req.familyFilter) {
      const accessibleFamilies = await prisma.family.findMany({
        where: req.familyFilter,
        select: { id: true },
      })

      const familyIds = accessibleFamilies.map((family) => family.id)
      familyFilter = { familyId: { in: familyIds } }
    }

    // Group by type and count
    const typeStats = await prisma.supportMeasure.groupBy({
      by: ["type"],
      where: familyFilter,
      _count: {
        _all: true,
      },
    })

    // Format the response
    const formattedStats = typeStats.map((stat) => ({
      type: stat.type,
      count: stat._count._all,
    }))

    res.status(200).json(formattedStats)
  } catch (error) {
    console.error("Error in getSupportStatsByType controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get support measure statistics by status
const getSupportStatsByStatus = async (req, res) => {
  try {
    // Get families user has access to
    let familyFilter = {}
    if (req.familyFilter) {
      const accessibleFamilies = await prisma.family.findMany({
        where: req.familyFilter,
        select: { id: true },
      })

      const familyIds = accessibleFamilies.map((family) => family.id)
      familyFilter = { familyId: { in: familyIds } }
    }

    // Group by status and count
    const statusStats = await prisma.supportMeasure.groupBy({
      by: ["status"],
      where: familyFilter,
      _count: {
        _all: true,
      },
    })

    // Format the response
    const formattedStats = statusStats.map((stat) => ({
      status: stat.status,
      count: stat._count._all,
    }))

    res.status(200).json(formattedStats)
  } catch (error) {
    console.error("Error in getSupportStatsByStatus controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get family member statistics by age groups
const getFamilyMemberStatsByAge = async (req, res) => {
  try {
    // Get families user has access to
    let familyFilter = {}
    if (req.familyFilter) {
      const accessibleFamilies = await prisma.family.findMany({
        where: req.familyFilter,
        select: { id: true },
      })

      const familyIds = accessibleFamilies.map((family) => family.id)
      familyFilter = { familyId: { in: familyIds } }
    }

    // Get all family members
    const familyMembers = await prisma.familyMember.findMany({
      where: familyFilter,
      select: {
        birthDate: true,
      },
    })

    // Calculate age for each member
    const now = new Date()
    const ageGroups = {
      "0-6": 0,
      "7-14": 0,
      "15-18": 0,
      "19-35": 0,
      "36-60": 0,
      "60+": 0,
    }

    familyMembers.forEach((member) => {
      const birthDate = new Date(member.birthDate)
      const age = now.getFullYear() - birthDate.getFullYear()

      // Adjust age if birthday hasn't occurred yet this year
      const monthDiff = now.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
        age--
      }

      const currentAge = age
      if (currentAge <= 6) ageGroups["0-6"]++
      else if (currentAge <= 14) ageGroups["7-14"]++
      else if (currentAge <= 18) ageGroups["15-18"]++
      else if (currentAge <= 35) ageGroups["19-35"]++
      else if (currentAge <= 60) ageGroups["36-60"]++
      else ageGroups["60+"]++
    })

    // Format the response
    const formattedStats = Object.entries(ageGroups).map(([ageGroup, count]) => ({
      ageGroup,
      count,
    }))

    res.status(200).json(formattedStats)
  } catch (error) {
    console.error("Error in getFamilyMemberStatsByAge controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Apply filter based on user's access level (set by middleware)
    const filter = req.familyFilter || {}

    // Get families user has access to
    let familyFilter = {}
    if (req.familyFilter) {
      const accessibleFamilies = await prisma.family.findMany({
        where: req.familyFilter,
        select: { id: true },
      })

      const familyIds = accessibleFamilies.map((family) => family.id)
      familyFilter = { familyId: { in: familyIds } }
    }

    // Count total families
    const totalFamilies = await prisma.family.count({
      where: filter,
    })

    // Count families by risk level
    const familiesByRiskLevel = await prisma.family.groupBy({
      by: ["riskLevel"],
      where: filter,
      _count: true,
    })

    // Count families by status
    const familiesByStatus = await prisma.family.groupBy({
      by: ["status"],
      where: filter,
      _count: true,
    })

    // Count total family members
    const totalFamilyMembers = await prisma.familyMember.count({
      where: familyFilter,
    })

    // Count total support measures
    const totalSupportMeasures = await prisma.supportMeasure.count({
      where: familyFilter,
    })

    // Count support measures by status
    const supportMeasuresByStatus = await prisma.supportMeasure.groupBy({
      by: ["status"],
      where: familyFilter,
      _count: true,
    })

    // Count support measures by type
    const supportMeasuresByType = await prisma.supportMeasure.groupBy({
      by: ["type"],
      where: familyFilter,
      _count: true,
    })

    // Get recent families
    const recentFamilies = await prisma.family.findMany({
      where: filter,
      orderBy: {
        lastUpdate: "desc",
      },
      take: 5,
      select: {
        id: true,
        caseNumber: true,
        familyName: true,
        status: true,
        riskLevel: true,
        lastUpdate: true,
      },
    })

    // Get recent support measures
    const recentSupportMeasures = await prisma.supportMeasure.findMany({
      where: familyFilter,
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        family: {
          select: {
            id: true,
            caseNumber: true,
            familyName: true,
          },
        },
      },
    })

    res.status(200).json({
      totalFamilies,
      familiesByRiskLevel,
      familiesByStatus,
      totalFamilyMembers,
      totalSupportMeasures,
      supportMeasuresByStatus,
      supportMeasuresByType,
      recentFamilies,
      recentSupportMeasures,
    })
  } catch (error) {
    console.error("Error in getDashboardStats controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  getFamilyStatsByRegion,
  getFamilyStatsByRiskLevel,
  getFamilyStatsByStatus,
  getSupportStatsByType,
  getSupportStatsByStatus,
  getFamilyMemberStatsByAge,
  getDashboardStats,
  getFamilyTypeStats,
  getFamilyStatsByDistrict,
}
