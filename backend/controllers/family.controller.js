const { PrismaClient } = require("@prisma/client")
const {ObjectId} = require("mongodb")
const prisma = new PrismaClient()

// Get all families with access control
const getAllFamilies = async (req, res) => {
  try {
    // Apply filter based on user's access level (set by middleware)
    const filter = req.familyFilter || {}

    const families = await prisma.family.findMany({
      where: filter,
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        _count: {
          select: {
            members: true,
            supportMeasures: true,
            documents: true,
          },
        },
      },
      orderBy: {
        lastUpdate: "desc",
      },
    })

    res.status(200).json(families)
  } catch (error) {
    console.error("Error in getAllFamilies controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get family by ID
const getFamilyById = async (req, res) => {
  try {
    const { id } = req.params

    const family = await prisma.family.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        members: true,
        supportMeasures: {
          include: {
            createdBy: {
              select: {
                id: true,
                username: true,
                fullName: true,
              },
            },
          },
        },
        documents: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                username: true,
                fullName: true,
              },
            },
          },
        },
        history: {
          orderBy: {
            timestamp: "desc",
          },
        },
      },
    })

    if (!family) {
      return res.status(404).json({ message: "Family not found" })
    }

    // Check if user has access to this family
    if (req.familyFilter) {
      const hasAccess = Object.entries(req.familyFilter).every(([key, value]) => family[key] === value)
      if (!hasAccess) {
        return res.status(403).json({ message: "You do not have access to this family" })
      }
    }

    res.status(200).json(family)
  } catch (error) {
    console.error("Error in getFamilyById controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Create a new family
const createFamily = async (req, res) => {
  try {
    const {
      caseNumber,
      familyName,
      address,
      region,
      district,
      city,
      status,
      riskLevel,
      riskFactors,
      registrationDate,
      notes,
      contactPhone,
      contactEmail,
      housingType,
      incomeSource,
      monthlyIncome,
      socialBenefits,
      children,
      employment,
      familyType,
      inspectionStatus,
      registrationAddress,
       settingReason,
      tzhsReason,
      nbReason,
      familyIncome,
      needsSupport,
      needsEducation,
      needsHealth,
      needsPolice,
      hasDisability,
      workplace,
      referralSource,
      primaryLanguage,
      hasInterpreterNeeded,
    } = req.body

    // Check if user has access to create family in this region/district
    if (req.familyFilter) {
      if (req.familyFilter.region && req.familyFilter.region !== region) {
        return res.status(403).json({ message: "You can only create families in your region" })
      }
      if (req.familyFilter.district && req.familyFilter.district !== district) {
        return res.status(403).json({ message: "You can only create families in your district" })
      }
      if (req.familyFilter.city && req.familyFilter.city !== city) {
        return res.status(403).json({ message: "You can only create families in your city" })
      }
    }

    // Check if case number already exists
    const existingFamily = await prisma.family.findUnique({
      where: { caseNumber },
    })

    if (existingFamily) {
      return res.status(400).json({ message: "Case number already exists" })
    }

    // Create new family
    const newFamily = await prisma.family.create({
      data: {
        caseNumber,
        familyName,
          familyType,
          children,
          settingReason,
          tzhsReason,
          nbReason,
            familyIncome,
        address,
        region,
        district,
        city,
          workplace,
        status,
        riskLevel,
        riskFactors,
        registrationDate: new Date(registrationDate),
        notes,
        isActive: true,
        contactPhone,
        contactEmail,
        housingType,
        incomeSource,
        monthlyIncome,
        socialBenefits,
        referralSource,
        primaryLanguage,
        hasInterpreterNeeded,
          needsSupport,
          needsEducation,
          needsHealth,
          needsPolice,
          hasDisability,
        createdBy: {
          connect: { id: req.user.id },
        },
        updatedBy: {
          connect: { id: req.user.id },
        },
        history: {
          create: {
            action: "created",
            description: "Family record created",
            userId: req.user.id,
          },
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    })

    res.status(201).json({
      message: "Family created successfully",
      family: newFamily,
    })
  } catch (error) {
    console.error("Error in createFamily controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Update family
const updateFamily = async (req, res) => {
  try {
    const { id } = req.params
    console.log("Id of the family is", id)
    const {
      familyName,
      address,
      region,
      district,
      city,
      status,
      riskLevel,
      riskFactors,
      notes,
      children,
      settingReason,
        nbReason,
        tzhsReason,
        inspectionStatus,
        employment,
        workplace,
        familyIncome,
        needsSupport,
        needsEducation,
        needsHealth,
        needsPolice,
        hasDisability,
      isActive,
      inactiveReason,
      contactPhone,
      contactEmail,
      housingType,
      incomeSource,
      monthlyIncome,
      socialBenefits,
      referralSource,
      primaryLanguage,
      hasInterpreterNeeded,
    } = req.body

    // Check if family exists
    const existingFamily = await prisma.family.findUnique({
      where: { id },
    })

    if (!existingFamily) {
      return res.status(404).json({ message: "Family not found" })
    }

    // Check if user has access to this family
    if (req.familyFilter) {
      const hasAccess = Object.entries(req.familyFilter).every(([key, value]) => existingFamily[key] === value)
      if (!hasAccess) {
        return res.status(403).json({ message: "You do not have access to this family" })
      }
    }

    // Check if user has access to update to this region/district
    if (req.familyFilter) {
      if (req.familyFilter.region && req.familyFilter.region !== region) {
        return res.status(403).json({ message: "You can only update families in your region" })
      }
      if (req.familyFilter.district && req.familyFilter.district !== district) {
        return res.status(403).json({ message: "You can only update families in your district" })
      }
      if (req.familyFilter.city && req.familyFilter.city !== city) {
        return res.status(403).json({ message: "You can only update families in your city" })
      }
    }

    // Create history entry for status change if applicable
    let historyAction = "updated"
    let historyDescription = "Family information updated"

    if (existingFamily.status !== status) {
      historyAction = "status_changed"
      historyDescription = `Status changed from ${existingFamily.status} to ${status}`
    } else if (existingFamily.isActive !== isActive) {
      historyAction = isActive ? "activated" : "deactivated"
      historyDescription = isActive ? "Family record activated" : `Family record deactivated. Reason: ${inactiveReason}`
    }

    // Update family
    const updatedFamily = await prisma.family.update({
      where: { id },
      data: {
        familyName,
        address,
        region,
        district,
        city,
        status,
        riskLevel,
        riskFactors,
        children,
        settingReason,
            nbReason,
          tzhsReason,
          inspectionStatus,
          employment,
          workplace,
          familyIncome,
          needsSupport,
            needsEducation,
            needsHealth,
            needsPolice,
            hasDisability,
        notes,
        isActive,
        inactiveReason,
        contactPhone,
        contactEmail,
        housingType,
        incomeSource,
        monthlyIncome,
        socialBenefits,
        referralSource,
        primaryLanguage,
        hasInterpreterNeeded,
        updatedBy: {
          connect: { id: req.user.id },
        },
        history: {
          create: {
            action: historyAction,
            description: historyDescription,
            userId: req.user.id,
          },
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    })

    res.status(200).json({
      message: "Family updated successfully",
      family: updatedFamily,
    })
  } catch (error) {
    console.error("Error in updateFamily controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Delete family (admin only)
const deleteFamily = async (req, res) => {
  try {
    const { id } = req.params

    // Check if family exists
    const existingFamily = await prisma.family.findUnique({
      where: { id },
    })

    if (!existingFamily) {
      return res.status(404).json({ message: "Family not found" })
    }

    // Delete family and all related records (cascade delete configured in schema)
    await prisma.family.delete({
      where: { id },
    })

    res.status(200).json({ message: "Family deleted successfully" })
  } catch (error) {
    console.error("Error in deleteFamily controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get families by status
const getFamiliesByStatus = async (req, res) => {
  try {
    const { status } = req.params

    // Apply filter based on user's access level (set by middleware)
    const filter = {
      ...req.familyFilter,
      status,
    }

    const families = await prisma.family.findMany({
      where: filter,
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        _count: {
          select: {
            members: true,
            supportMeasures: true,
          },
        },
      },
      orderBy: {
        lastUpdate: "desc",
      },
    })

    res.status(200).json(families)
  } catch (error) {
    console.error("Error in getFamiliesByStatus controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get families by risk level
const getFamiliesByRiskLevel = async (req, res) => {
  try {
    const { riskLevel } = req.params

    // Apply filter based on user's access level (set by middleware)
    const filter = {
      ...req.familyFilter,
      riskLevel,
    }

    const families = await prisma.family.findMany({
      where: filter,
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        _count: {
          select: {
            members: true,
            supportMeasures: true,
          },
        },
      },
      orderBy: {
        lastUpdate: "desc",
      },
    })

    res.status(200).json(families)
  } catch (error) {
    console.error("Error in getFamiliesByRiskLevel controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get family history
const getFamilyHistory = async (req, res) => {
  try {
    const { id } = req.params

    // Check if family exists
    const existingFamily = await prisma.family.findUnique({
      where: { id },
    })

    if (!existingFamily) {
      return res.status(404).json({ message: "Family not found" })
    }

    // Check if user has access to this family
    if (req.familyFilter) {
      const hasAccess = Object.entries(req.familyFilter).every(([key, value]) => existingFamily[key] === value)
      if (!hasAccess) {
        return res.status(403).json({ message: "You do not have access to this family" })
      }
    }

    const history = await prisma.familyHistory.findMany({
      where: { familyId: id },
      orderBy: {
        timestamp: "desc",
      },
    })

    res.status(200).json(history)
  } catch (error) {
    console.error("Error in getFamilyHistory controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Search families
const searchFamilies = async (req, res) => {
  try {
    const { query } = req.query

    if (!query) {
      return res.status(400).json({ message: "Search query is required" })
    }

    // Apply filter based on user's access level (set by middleware)
    const filter = {
      ...req.familyFilter,
      OR: [
        { familyName: { contains: query, mode: "insensitive" } },
        { caseNumber: { contains: query, mode: "insensitive" } },
        { address: { contains: query, mode: "insensitive" } },
      ],
    }

    const families = await prisma.family.findMany({
      where: filter,
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        _count: {
          select: {
            members: true,
            supportMeasures: true,
          },
        },
      },
      orderBy: {
        lastUpdate: "desc",
      },
    })

    res.status(200).json(families)
  } catch (error) {
    console.error("Error in searchFamilies controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  getAllFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
  deleteFamily,
  getFamiliesByStatus,
  getFamiliesByRiskLevel,
  getFamilyHistory,
  searchFamilies,
}
