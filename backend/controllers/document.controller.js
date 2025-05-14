const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const multer = require("multer")
const path = require("path")
const fs = require("fs")

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads")
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, file.fieldname + "-" + uniqueSuffix + ext)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
    ]

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Invalid file type. Only PDF, Word, Excel, and image files are allowed."))
    }
  },
}).single("file")

// Get all documents
const getAllDocuments = async (req, res) => {
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

    const documents = await prisma.document.findMany({
      where: familyFilter,
      include: {
        family: {
          select: {
            id: true,
            caseNumber: true,
            familyName: true,
          },
        },
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        supportMeasure: {
          select: {
            id: true,
            type: true,
            description: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        uploadDate: "desc",
      },
    })

    res.status(200).json(documents)
  } catch (error) {
    console.error("Error in getAllDocuments controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get documents for a family
const getFamilyDocuments = async (req, res) => {
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

    const documents = await prisma.document.findMany({
      where: { familyId },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        supportMeasure: {
          select: {
            id: true,
            type: true,
            description: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        uploadDate: "desc",
      },
    })

    res.status(200).json(documents)
  } catch (error) {
    console.error("Error in getFamilyDocuments controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get document by ID
const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        family: true,
        member: true,
        supportMeasure: true,
        uploadedBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    })

    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    // Check if user has access to this family
    if (req.familyFilter && document.family) {
      const hasAccess = Object.entries(req.familyFilter).every(([key, value]) => document.family[key] === value)
      if (!hasAccess) {
        return res.status(403).json({ message: "You do not have access to this document" })
      }
    }

    res.status(200).json(document)
  } catch (error) {
    console.error("Error in getDocumentById controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Upload a new document
const uploadDocument = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message })
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    try {
      const { title, type, familyId, memberId, supportId, notes } = req.body

      // Check if family exists if familyId is provided
      if (familyId) {
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
      }

      // Check if member exists if memberId is provided
      if (memberId) {
        const member = await prisma.familyMember.findUnique({
          where: { id: memberId },
          include: { family: true },
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
      }

      // Check if support measure exists if supportId is provided
      if (supportId) {
        const supportMeasure = await prisma.supportMeasure.findUnique({
          where: { id: supportId },
          include: { family: true },
        })

        if (!supportMeasure) {
          return res.status(404).json({ message: "Support measure not found" })
        }

        // Check if user has access to this family
        if (req.familyFilter) {
          const hasAccess = Object.entries(req.familyFilter).every(
            ([key, value]) => supportMeasure.family[key] === value,
          )
          if (!hasAccess) {
            return res.status(403).json({ message: "You do not have access to this support measure" })
          }
        }
      }

      // Create file URL (in a real app, this might be a cloud storage URL)
      const fileUrl = `/uploads/${req.file.filename}`

      // Create new document
      const newDocument = await prisma.document.create({
        data: {
          title,
          type,
          fileUrl,
          mimeType: req.file.mimetype,
          fileSize: req.file.size,
          familyId: familyId || null,
          memberId: memberId || null,
          supportId: supportId || null,
          notes,
          uploadedBy: {
            connect: { id: req.user.id },
          },
        },
        include: {
          uploadedBy: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
        },
      })

      // Update family history if familyId is provided
      if (familyId) {
        await prisma.familyHistory.create({
          data: {
            familyId,
            action: "document_added",
            description: `New document added: ${title}`,
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
      }

      res.status(201).json({
        message: "Document uploaded successfully",
        document: newDocument,
      })
    } catch (error) {
      console.error("Error in uploadDocument controller:", error)
      res.status(500).json({ message: "Server error" })
    }
  })
}

// Delete document
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params

    // Check if document exists
    const existingDocument = await prisma.document.findUnique({
      where: { id },
      include: { family: true },
    })

    if (!existingDocument) {
      return res.status(404).json({ message: "Document not found" })
    }

    // Check if user has access to this family
    if (req.familyFilter && existingDocument.family) {
      const hasAccess = Object.entries(req.familyFilter).every(([key, value]) => existingDocument.family[key] === value)
      if (!hasAccess) {
        return res.status(403).json({ message: "You do not have access to this document" })
      }
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, "..", existingDocument.fileUrl)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    // Delete document
    await prisma.document.delete({
      where: { id },
    })

    // Update family history if familyId is provided
    if (existingDocument.familyId) {
      await prisma.familyHistory.create({
        data: {
          familyId: existingDocument.familyId,
          action: "document_removed",
          description: `Document removed: ${existingDocument.title}`,
          userId: req.user.id,
        },
      })

      // Update family lastUpdate
      await prisma.family.update({
        where: { id: existingDocument.familyId },
        data: {
          updatedBy: {
            connect: { id: req.user.id },
          },
        },
      })
    }

    res.status(200).json({ message: "Document deleted successfully" })
  } catch (error) {
    console.error("Error in deleteDocument controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  getAllDocuments,
  getFamilyDocuments,
  getDocumentById,
  uploadDocument,
  deleteDocument,
}
