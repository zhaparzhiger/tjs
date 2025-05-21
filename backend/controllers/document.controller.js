const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../Uploads")
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
  limits: { fileSize: 10 * 1024 * 1024 },
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

const getAllDocuments = async (req, res) => {
  try {
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
            iin: true,
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

const getFamilyDocuments = async (req, res) => {
  try {
    const { familyId } = req.params
    const family = await prisma.family.findUnique({
      where: { id: familyId },
    })

    if (!family) {
      return res.status(404).json({ message: "Family not found" })
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
            iin: true,
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
            iin: true,
            fullName: true,
          },
        },
      },
    })

    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

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

const uploadDocument = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message })
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    try {
      const { title, type, familyId, memberId, supportId, notes, uploadDate } = req.body
      if (familyId) {
        const family = await prisma.family.findUnique({
          where: { id: familyId },
        })
        if (!family) {
          return res.status(404).json({ message: "Family not found" })
        }
      
      }

      if (memberId) {
        const member = await prisma.familyMember.findUnique({
          where: { id: memberId },
          include: { family: true },
        })
        if (!member) {
          return res.status(404).json({ message: "Family member not found" })
        }
       
      }

      if (supportId) {
        const supportMeasure = await prisma.supportMeasure.findUnique({
          where: { id: supportId },
          include: { family: true },
        })
        if (!supportMeasure) {
          return res.status(404).json({ message: "Support measure not found" })
        }
        if (req.familyFilter) {
          const hasAccess = Object.entries(req.familyFilter).every(
            ([key, value]) => supportMeasure.family[key] === value,
          )
          if (!hasAccess) {
            return res.status(403).json({ message: "You do not have access to this support measure" })
          }
        }
      }

      const fileUrl = `http://192.168.10.19/uploads/${req.file.filename}`
      console.log("Generated fileUrl:", fileUrl)
      console.log("File saved at:", req.file.path)

      const newDocument = await prisma.document.create({
        data: {
          title,
          type,
          fileUrl,
          mimeType: req.file.mimetype,
          fileSize: req.file.size,
          uploadDate: uploadDate ? new Date(uploadDate) : new Date(),
          notes: notes || null,
          family: familyId ? { connect: { id: familyId } } : undefined,
          member: memberId ? { connect: { id: memberId } } : undefined,
          supportMeasure: supportId ? { connect: { id: supportId } } : undefined,
          uploadedBy: {
            connect: { id: req.user.id },
          },
        },
        include: {
          uploadedBy: {
            select: {
              id: true,
              iin: true,
              fullName: true,
            },
          },
        },
      })

      if (familyId) {
        await prisma.familyHistory.create({
          data: {
            familyId,
            action: "Добавление документа",
            description: `Добавлен документ '${title}'`,
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

const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params
    const existingDocument = await prisma.document.findUnique({
      where: { id },
      include: { family: true },
    })

    if (!existingDocument) {
      return res.status(404).json({ message: "Document not found" })
    }

    if (req.familyFilter && existingDocument.family) {
      const hasAccess = Object.entries(req.familyFilter).every(([key, value]) => existingDocument.family[key] === value)
      if (!hasAccess) {
        return res.status(403).json({ message: "You do not have access to this document" })
      }
    }

    const filePath = path.join(__dirname, "..", existingDocument.fileUrl.replace("http://192.168.10.19", ""))
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    await prisma.document.delete({
      where: { id },
    })

    if (existingDocument.familyId) {
      await prisma.familyHistory.create({
        data: {
          familyId: existingDocument.familyId,
          action: "Удаление документа",
          description: `Удален документ '${existingDocument.title}'`,
          userId: req.user.id,
        },
      })

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