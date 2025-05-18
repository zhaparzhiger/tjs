const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function getFamilyMembers(req, res) {
  const { familyId } = req.params
  if (!familyId || familyId === 'undefined') {
    return res.status(400).json({ message: 'Invalid or missing familyId' })
  }

  try {
    const family = await prisma.family.findUnique({
      where: { id: familyId },
    })
    if (!family) {
      return res.status(404).json({ message: 'Family not found' })
    }

    const members = await prisma.familyMember.findMany({
      where: { familyId },
    })

    return res.status(200).json(members)
  } catch (error) {
    console.error('Error fetching family members:', error)
    if (error.code === 'P2023') {
      return res.status(400).json({ message: 'Malformed familyId provided' })
    }
    return res.status(500).json({ message: 'Internal server error' })
  }
}

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
                iin: true,
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
                iin: true,
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

async function createFamilyMember(req, res) {
  try {
    const {
      familyId,
      firstName,
      lastName,
      middleName,
      documentNumber,
      documentType,
      documentIssueDate,
      documentExpiryDate,
      birthDate,
      gender,
      relationship,
      registrationAddress,
      education,
      grade,
      institution,
      course,
      funding,
      meals,
      notes,
      status,
      isActive = true,
      citizenship,
      ethnicity,
      maritalStatus,
      phoneNumber,
      email,
      isHeadOfHousehold,
      primaryCaregiver,
      incomeAmount,
      incomeSource,
      medicalInsurance,
      chronicConditions,
      allergies,
      medications,
    } = req.body

    if (!familyId || !firstName || !lastName || !documentNumber) {
      return res.status(400).json({ message: 'Required fields: familyId, firstName, lastName, documentNumber' })
    }
    if (!relationship) {
      return res.status(400).json({ message: 'Relationship is required' })
    }
    if (!/^\d{12}$/.test(documentNumber)) {
      return res.status(400).json({ message: 'Document number must be 12 digits' })
    }
    const validRelationships = [
      "mother",
      "father",
      "son",
      "daughter",
      "grandmother",
      "grandfather",
      "guardian",
      "other",
    ]
    if (!relationship || !validRelationships.includes(relationship)) {
      return res.status(400).json({
        message: `Invalid relationship: must be one of ${validRelationships.join(", ")}`,
      })
    }
    if (!status || !["Взрослый", "Студент", "Школьник", "Дошкольник"].includes(status)) {
      return res.status(400).json({ message: 'Invalid status: must be Взрослый, Студент, Школьник, or Дошкольник' })
    }

    const family = await prisma.family.findUnique({ where: { id: familyId } })
    if (!family) {
      return res.status(404).json({ message: 'Family not found' })
    }

    const existingMember = await prisma.familyMember.findUnique({
      where: { documentNumber },
    })
    if (existingMember) {
      return res.status(400).json({ message: 'A family member with this document number already exists' })
    }

    const familyMember = await prisma.familyMember.create({
      data: {
        family: { connect: { id: familyId } },
        firstName,
        lastName,
        middleName: middleName || null,
        documentNumber,
        documentType: documentType || null,
        documentIssueDate: documentIssueDate ? new Date(documentIssueDate) : null,
        documentExpiryDate: documentExpiryDate ? new Date(documentExpiryDate) : null,
        birthDate: birthDate ? new Date(birthDate) : null,
        gender: gender || null,
        relationship,
        registrationAddress: registrationAddress || null,
        education: education || null,
        grade: grade || null,
        institution: institution || null,
        course: course || null,
        funding: funding || null,
        meals: meals || null,
        notes: notes || null,
        status,
        isActive,
        citizenship: citizenship || null,
        ethnicity: ethnicity || null,
        maritalStatus: maritalStatus || null,
        phoneNumber: phoneNumber || null,
        email: email || null,
        isHeadOfHousehold: isHeadOfHousehold || false,
        primaryCaregiver: primaryCaregiver || false,
        incomeAmount: incomeAmount || null,
        incomeSource: incomeSource || null,
        medicalInsurance: medicalInsurance || null,
        chronicConditions: chronicConditions || [],
        allergies: allergies || [],
        medications: medications || [],
      },
      include: { family: true },
    })

    await prisma.familyHistory.create({
      data: {
        familyId,
        action: "Добавление члена семьи",
        description: `Добавлен член семьи '${firstName} ${lastName}'`,
        userId: req.user.id,
      },
    })

    await prisma.family.update({
      where: { id: familyId },
      data: {
        updatedBy: {
          connect: { id: req.user.id },
        },
      },
    })

    res.status(201).json(familyMember)
  } catch (error) {
    console.error('Create family member error:', error)
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'A family member with this document number already exists' })
    }
    if (error.name === 'PrismaClientValidationError') {
      return res.status(400).json({ message: `Invalid data provided: ${error.message}` })
    }
    res.status(500).json({ message: 'Internal server error' })
  }
}

const updateFamilyMember = async (req, res) => {
  try {
    const { id } = req.params
        
    console.log("Id of the family is", id)
    
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
      citizenship,
      ethnicity,
      maritalStatus,
      phoneNumber,
      email,
      isHeadOfHousehold,
      primaryCaregiver,
      incomeAmount,
      incomeSource,
      medicalInsurance,
      chronicConditions,
      allergies,
      medications,
    } = req.body

    const existingMember = await prisma.familyMember.findUnique({
      where: { id },
      include: { family: true },
    })

    if (!existingMember) {
      return res.status(404).json({ message: "Family member not found" })
    }

    if (req.familyFilter) {
      const hasAccess = Object.entries(req.familyFilter).every(([key, value]) => existingMember.family[key] === value)
      if (!hasAccess) {
        return res.status(403).json({ message: "You do not have access to this family member" })
      }
    }

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
        citizenship,
        ethnicity,
        maritalStatus,
        phoneNumber,
        email,
        isHeadOfHousehold,
        primaryCaregiver,
        incomeAmount,
        incomeSource,
        medicalInsurance,
        chronicConditions,
        allergies,
        medications,
      },
    })

    await prisma.familyHistory.create({
      data: {
        familyId: existingMember.familyId,
        action: "Обновление члена семьи",
        description: `Обновлен член семьи '${firstName} ${lastName}'`,
        userId: req.user.id,
      },
    })

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

const deleteFamilyMember = async (req, res) => {
  try {
    const { id } = req.params
    const existingMember = await prisma.familyMember.findUnique({
      where: { id },
      include: { family: true },
    })

    if (!existingMember) {
      return res.status(404).json({ message: "Family member not found" })
    }

    if (req.familyFilter) {
      const hasAccess = Object.entries(req.familyFilter).every(([key, value]) => existingMember.family[key] === value)
      if (!hasAccess) {
        return res.status(403).json({ message: "You do not have access to this family member" })
      }
    }

    await prisma.familyMember.delete({
      where: { id },
    })

    await prisma.familyHistory.create({
      data: {
        familyId: existingMember.familyId,
        action: "Удаление члена семьи",
        description: `Удален член семьи '${existingMember.firstName} ${existingMember.lastName}'`,
        userId: req.user.id,
      },
    })

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

const searchFamilyMembers = async (req, res) => {
  try {
    const { query } = req.query
    if (!query) {
      return res.status(400).json({ message: "Search query is required" })
    }

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