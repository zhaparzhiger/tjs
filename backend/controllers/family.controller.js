const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

// Get all families with access control
const getAllFamilies = async (req, res) => {
  try {
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
      statusReason,
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

    const existingFamily = await prisma.family.findUnique({
      where: { caseNumber },
    })

    if (existingFamily) {
      return res.status(400).json({ message: "Case number already exists" })
    }

    const newFamily = await prisma.family.create({
      data: {
        caseNumber,
        familyName,
        address,
        region,
        district,
        city,
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
        createdBy: {
          connect: { id: req.user.id },
        },
        updatedBy: {
          connect: { id: req.user.id },
        },
        history: {
          create: {
            action: "Создание записи",
            description: "Создана запись о семье",
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

    const existingFamily = await prisma.family.findUnique({
      where: { id },
    })

    if (!existingFamily) {
      return res.status(404).json({ message: "Family not found" })
    }

    if (req.familyFilter) {
      const hasAccess = Object.entries(req.familyFilter).every(([key, value]) => existingFamily[key] === value)
      if (!hasAccess) {
        return res.status(403).json({ message: "You do not have access to this family" })
      }
    }

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

    let historyAction = "Изменение данных"
    let historyDescription = "Обновлена информация о семье"

    if (existingFamily.status !== status) {
      historyAction = "Изменение статуса"
      historyDescription = `Статус изменен с '${existingFamily.status}' на '${status}'`
    } else if (existingFamily.isActive !== isActive) {
      historyAction = isActive ? "Активация записи" : "Деактивация записи"
      historyDescription = isActive ? "Запись о семье активирована" : `Запись о семье деактивирована. Причина: ${inactiveReason}`
    }

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

    const existingFamily = await prisma.family.findUnique({
      where: { id },
    })

    if (!existingFamily) {
      return res.status(404).json({ message: "Family not found" })
    }

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

    const existingFamily = await prisma.family.findUnique({
      where: { id },
    })

    if (!existingFamily) {
      return res.status(404).json({ message: "Family not found" })
    }

    if (req.familyFilter) {
      const hasAccess = Object.entries(req.familyFilter).every(([key, value]) => existingFamily[key] === value)
      if (!hasAccess) {
        return res.status(403).json({ message: "You do not have access to this family" })
      }
    }

    const history = await prisma.familyHistory.findMany({
      where: { familyId: id },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    })

    // Format history for frontend
    const formattedHistory = history.map((entry) => ({
      id: entry.id,
      date: new Date(entry.timestamp).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      user: entry.user.fullName,
      action: entry.action,
      details: entry.description,
    }))

    res.status(200).json(formattedHistory)
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