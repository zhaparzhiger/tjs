const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

// Get all support measures for a family
const getFamilySupport = async (req, res) => {
  try {
    const { familyId } = req.params

    // Check if family exists
    const family = await prisma.family.findUnique({
      where: { id: familyId },
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

    const supportMeasures = await prisma.supportMeasure.findMany({
      where: { familyId },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
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
      },
      orderBy: {
        startDate: "desc",
      },
    })

    res.status(200).json(supportMeasures)
  } catch (error) {
    console.error("Error in getFamilySupport controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get support measure by ID
const getSupportMeasureById = async (req, res) => {
  try {
    const { id } = req.params

    const supportMeasure = await prisma.supportMeasure.findUnique({
      where: { id },
      include: {
        family: true,
        member: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
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
      },
    })

    if (!supportMeasure) {
      return res.status(404).json({ message: "Support measure not found" })
    }

    // Check if user has access to this family
    if (req.familyFilter) {
      const hasAccess = Object.entries(req.familyFilter).every(([key, value]) => supportMeasure.family[key] === value)
      if (!hasAccess) {
        return res.status(403).json({ message: "You do not have access to this support measure" })
      }
    }

    res.status(200).json(supportMeasure)
  } catch (error) {
    console.error("Error in getSupportMeasureById controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Create a new support measure
const createSupportMeasure = async (req, res) => {
  try {
    const {
      familyId,
      memberId,
      type,
      description,
      startDate,
      endDate,
      status,
      provider,
      result,
      notes,
      priority,
      cost,
      fundingSource,
      contactPerson,
      contactPhone,
      contactEmail,
      frequency,
      location,
      followUpDate,
      evaluationDate,
      effectiveness,
    } = req.body

    // Check if family exists
    const family = await prisma.family.findUnique({
      where: { id: familyId },
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

    // Check if member exists if memberId is provided
    if (memberId) {
      const member = await prisma.familyMember.findUnique({
        where: { id: memberId },
      })

      if (!member) {
        return res.status(404).json({ message: "Family member not found" })
      }

      if (member.familyId !== familyId) {
        return res.status(400).json({ message: "Family member does not belong to this family" })
      }
    }

    // Create new support measure
    const newSupportMeasure = await prisma.supportMeasure.create({
      data: {
        familyId,
        memberId,
        type,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status,
        provider,
        result,
        notes,
        priority,
        cost,
        fundingSource,
        contactPerson,
        contactPhone,
        contactEmail,
        frequency,
        location,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        evaluationDate: evaluationDate ? new Date(evaluationDate) : null,
        effectiveness,
        createdBy: {
          connect: { id: req.user.id },
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
        member: true,
      },
    })

    // Update family history
    await prisma.familyHistory.create({
      data: {
        familyId,
        action: "support_added",
        description: `New support measure added: ${type}`,
        userId: req.user.id,
      },
    })

    // Update family lastUpdate
    await prisma.family.update({
      where: { id: familyId },
      data: {
        updatedBy: {
          connect: { id: req.user.id },
        },
      },
    })

    res.status(201).json({
      message: "Support measure created successfully",
      supportMeasure: newSupportMeasure,
    })
  } catch (error) {
    console.error("Error in createSupportMeasure controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Update support measure
const updateSupportMeasure = async (req, res) => {
  try {
    const { id } = req.params
    const {
      type,
      description,
      startDate,
      endDate,
      status,
      provider,
      result,
      notes,
      priority,
      cost,
      fundingSource,
      contactPerson,
      contactPhone,
      contactEmail,
      frequency,
      location,
      followUpDate,
      evaluationDate,
      effectiveness,
    } = req.body

    // Check if support measure exists
    const existingSupportMeasure = await prisma.supportMeasure.findUnique({
      where: { id },
      include: { family: true },
    })

    if (!existingSupportMeasure) {
      return res.status(404).json({ message: "Support measure not found" })
    }

    // Check if user has access to this family
    if (req.familyFilter) {
      const hasAccess = Object.entries(req.familyFilter).every(
        ([key, value]) => existingSupportMeasure.family[key] === value,
      )
      if (!hasAccess) {
        return res.status(403).json({ message: "You do not have access to this support measure" })
      }
    }

    // Update support measure
    const updatedSupportMeasure = await prisma.supportMeasure.update({
      where: { id },
      data: {
        type,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : null,
        status,
        provider,
        result,
        notes,
        priority,
        cost,
        fundingSource,
        contactPerson,
        contactPhone,
        contactEmail,
        frequency,
        location,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        evaluationDate: evaluationDate ? new Date(evaluationDate) : null,
        effectiveness,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        member: true,
      },
    })

    // Update family history
    await prisma.familyHistory.create({
      data: {
        familyId: existingSupportMeasure.familyId,
        action: "support_updated",
        description: `Support measure updated: ${type}`,
        userId: req.user.id,
      },
    })

    // Update family lastUpdate
    await prisma.family.update({
      where: { id: existingSupportMeasure.familyId },
      data: {
        updatedBy: {
          connect: { id: req.user.id },
        },
      },
    })

    res.status(200).json({
      message: "Support measure updated successfully",
      supportMeasure: updatedSupportMeasure,
    })
  } catch (error) {
    console.error("Error in updateSupportMeasure controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Delete support measure
const deleteSupportMeasure = async (req, res) => {
  try {
    const { id } = req.params

    // Check if support measure exists
    const existingSupportMeasure = await prisma.supportMeasure.findUnique({
      where: { id },
      include: { family: true },
    })

    if (!existingSupportMeasure) {
      return res.status(404).json({ message: "Support measure not found" })
    }

    // Check if user has access to this family
    if (req.familyFilter) {
      const hasAccess = Object.entries(req.familyFilter).every(
        ([key, value]) => existingSupportMeasure.family[key] === value,
      )
      if (!hasAccess) {
        return res.status(403).json({ message: "You do not have access to this support measure" })
      }
    }

    // Delete support measure
    await prisma.supportMeasure.delete({
      where: { id },
    })

    // Update family history
    await prisma.familyHistory.create({
      data: {
        familyId: existingSupportMeasure.familyId,
        action: "support_removed",
        description: `Support measure removed: ${existingSupportMeasure.type}`,
        userId: req.user.id,
      },
    })

    // Update family lastUpdate
    await prisma.family.update({
      where: { id: existingSupportMeasure.familyId },
      data: {
        updatedBy: {
          connect: { id: req.user.id },
        },
      },
    })

    res.status(200).json({ message: "Support measure deleted successfully" })
  } catch (error) {
    console.error("Error in deleteSupportMeasure controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get support measures by type
const getSupportMeasuresByType = async (req, res) => {
  try {
    const { type } = req.params

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

    const supportMeasures = await prisma.supportMeasure.findMany({
      where: {
        ...familyFilter,
        type,
      },
      include: {
        family: {
          select: {
            id: true,
            caseNumber: true,
            familyName: true,
            region: true,
            district: true,
            city: true,
          },
        },
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    })

    res.status(200).json(supportMeasures)
  } catch (error) {
    console.error("Error in getSupportMeasuresByType controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get support measures by status
const getSupportMeasuresByStatus = async (req, res) => {
  try {
    const { status } = req.params

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

    const supportMeasures = await prisma.supportMeasure.findMany({
      where: {
        ...familyFilter,
        status,
      },
      include: {
        family: {
          select: {
            id: true,
            caseNumber: true,
            familyName: true,
            region: true,
            district: true,
            city: true,
          },
        },
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    })

    res.status(200).json(supportMeasures)
  } catch (error) {
    console.error("Error in getSupportMeasuresByStatus controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  getFamilySupport,
  getSupportMeasureById,
  createSupportMeasure,
  updateSupportMeasure,
  deleteSupportMeasure,
  getSupportMeasuresByType,
  getSupportMeasuresByStatus,
}
