const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

// Get all family members for a family
const getFamilyMembers = async (req, res) => {
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

    const members = await prisma.familyMember.findMany({
      where: { familyId },
      include: {
        supportMeasures: true,
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

    res.status(200).json(members)
  } catch (error) {
    console.error("Error in getFamilyMembers controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get family member by ID
const getFamilyMemberById = async (req, res) => {
  try {
    const { id } = req.params

    const member = await prisma.familyMember.findUnique({
      where: { id },
      include: {
        family: true,
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
      },
    })

    if (!member) {
      return res.status(404).json({ message: "Family member not found" })
    }

    // Check if user has access to this family
    if (req.familyFilter) {
      const hasAccess = Object.entries(req.familyFilter).every(([key, value]) => member.family[key] === value)
      if (!hasAccess) {
        return res.status(403).json({ message: "You do not have access to this family member" })
      }
    }

    res.status(200).json(member)
  } catch (error) {
    console.error("Error in getFamilyMemberById controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Create a new family member
const createFamilyMember = async (req, res) => {
  try {
    const {
      familyId,
      firstName,
      lastName,
      middleName,
      birthDate,
      gender,
      relationship,
      documentType,
      documentNumber,
      education,
      employment,
      healthStatus,
      disabilities,
      specialNeeds,
      notes,
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

    // Create new family member
    const newMember = await prisma.familyMember.create({
      data: {
        familyId,
        firstName,
        lastName,
        middleName,
        birthDate: new Date(birthDate),
        gender,
        relationship,
        documentType,
        documentNumber,
        education,
        employment,
        healthStatus,
        disabilities,
        specialNeeds,
        notes,
        isActive: true,
      },
    })

    // Update family history
    await prisma.familyHistory.create({
      data: {
        familyId,
        action: "member_added",
        description: `New family member added: ${firstName} ${lastName}`,
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
      message: "Family member created successfully",
      member: newMember,
    })
  } catch (error) {
    console.error("Error in createFamilyMember controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Update family member
const updateFamilyMember = async (req, res) => {
  try {
    const { id } = req.params
    const {
      firstName,
      lastName,
      middleName,
      birthDate,
      gender,
      relationship,
      documentType,
      documentNumber,
      education,
      employment,
      healthStatus,
      disabilities,
      specialNeeds,
      notes,
      isActive,
    } = req.body

    // Check if family member exists
    const existingMember = await prisma.familyMember.findUnique({
      where: { id },
      include: { family: true },
    })

    if (!existingMember) {
      return res.status(404).json({ message: "Family member not found" })
    }

    // Check if user has access to this family
    if (req.familyFilter) {
      const hasAccess = Object.entries(req.familyFilter).every(([key, value]) => existingMember.family[key] === value)
      if (!hasAccess) {
        return res.status(403).json({ message: "You do not have access to this family member" })
      }
    }

    // Update family member
    const updatedMember = await prisma.familyMember.update({
      where: { id },
      data: {
        firstName,
        lastName,
        middleName,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        gender,
        relationship,
        documentType,
        documentNumber,
        education,
        employment,
        healthStatus,
        disabilities,
        specialNeeds,
        notes,
        isActive,
      },
    })

    // Update family history
    await prisma.familyHistory.create({
      data: {
        familyId: existingMember.familyId,
        action: "member_updated",
        description: `Family member updated: ${firstName} ${lastName}`,
        userId: req.user.id,
      },
    })

    // Update family lastUpdate
    await prisma.family.update({
      where: { id: existingMember.familyId },
      data: {
        updatedBy: {
          connect: { id: req.user.id },
        },
      },
    })

    res.status(200).json({
      message: "Family member updated successfully",
      member: updatedMember,
    })
  } catch (error) {
    console.error("Error in updateFamilyMember controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Delete family member
const deleteFamilyMember = async (req, res) => {
  try {
    const { id } = req.params

    // Check if family member exists
    const existingMember = await prisma.familyMember.findUnique({
      where: { id },
      include: { family: true },
    })

    if (!existingMember) {
      return res.status(404).json({ message: "Family member not found" })
    }

    // Check if user has access to this family
    if (req.familyFilter) {
      const hasAccess = Object.entries(req.familyFilter).every(([key, value]) => existingMember.family[key] === value)
      if (!hasAccess) {
        return res.status(403).json({ message: "You do not have access to this family member" })
      }
    }

    // Delete family member
    await prisma.familyMember.delete({
      where: { id },
    })

    // Update family history
    await prisma.familyHistory.create({
      data: {
        familyId: existingMember.familyId,
        action: "member_removed",
        description: `Family member removed: ${existingMember.firstName} ${existingMember.lastName}`,
        userId: req.user.id,
      },
    })

    // Update family lastUpdate
    await prisma.family.update({
      where: { id: existingMember.familyId },
      data: {
        updatedBy: {
          connect: { id: req.user.id },
        },
      },
    })

    res.status(200).json({ message: "Family member deleted successfully" })
  } catch (error) {
    console.error("Error in deleteFamilyMember controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Search family members
const searchFamilyMembers = async (req, res) => {
  try {
    const { query } = req.query

    if (!query) {
      return res.status(400).json({ message: "Search query is required" })
    }

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

    const members = await prisma.familyMember.findMany({
      where: {
        ...familyFilter,
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { middleName: { contains: query, mode: "insensitive" } },
          { documentNumber: { contains: query, mode: "insensitive" } },
        ],
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
      },
    })

    res.status(200).json(members)
  } catch (error) {
    console.error("Error in searchFamilyMembers controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  getFamilyMembers,
  getFamilyMemberById,
  createFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  searchFamilyMembers,
}
