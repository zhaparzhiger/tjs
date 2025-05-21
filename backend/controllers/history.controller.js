const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

// Получение истории действий для семьи
exports.getFamilyHistory = async (req, res) => {
  try {
    const { familyId } = req.params

    const history = await prisma.historyRecord.findMany({
      where: {
        familyId: Number.parseInt(familyId),
      },
      orderBy: {
        date: "desc",
      },
    })

    res.status(200).json(history)
  } catch (error) {
    console.error("Error getting family history:", error)
    res.status(500).json({ message: "Ошибка при получении истории семьи", error: error.message })
  }
}

// Добавление записи в историю
exports.addHistoryRecord = async (req, res) => {
  try {
    const { familyId } = req.params
    const { action, description, details, memberId } = req.body

    // Получаем информацию о пользователе из токена
    const user = req.user ? `${req.user.name}` : "Система"

    const historyRecord = await prisma.historyRecord.create({
      data: {
        familyId: Number.parseInt(familyId),
        memberId: memberId ? Number.parseInt(memberId) : null,
        action,
        description,
        date: new Date(),
        user,
        details: details ? JSON.stringify(details) : null,
      },
    })

    res.status(201).json(historyRecord)
  } catch (error) {
    console.error("Error adding history record:", error)
    res.status(500).json({ message: "Ошибка при добавлении записи в историю", error: error.message })
  }
}

// Получение истории действий для члена семьи
exports.getMemberHistory = async (req, res) => {
  try {
    const { familyId, memberId } = req.params

    const history = await prisma.historyRecord.findMany({
      where: {
        familyId: Number.parseInt(familyId),
        memberId: Number.parseInt(memberId),
      },
      orderBy: {
        date: "desc",
      },
    })

    res.status(200).json(history)
  } catch (error) {
    console.error("Error getting member history:", error)
    res.status(500).json({ message: "Ошибка при получении истории члена семьи", error: error.message })
  }
}

// Удаление записи из истории (только для администраторов)
exports.deleteHistoryRecord = async (req, res) => {
  try {
    const { historyId } = req.params

    // Проверяем, является ли пользователь администратором
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Недостаточно прав для удаления записи из истории" })
    }

    await prisma.historyRecord.delete({
      where: {
        id: Number.parseInt(historyId),
      },
    })

    res.status(200).json({ message: "Запись из истории успешно удалена" })
  } catch (error) {
    console.error("Error deleting history record:", error)
    res.status(500).json({ message: "Ошибка при удалении записи из истории", error: error.message })
  }
}

// Получение всей истории действий (только для администраторов)
exports.getAllHistory = async (req, res) => {
  try {
    // Проверяем, является ли пользователь администратором
   

    const { page = 1, limit = 50, search } = req.query
    const skip = (page - 1) * limit

    const whereClause = search
      ? {
          OR: [
            { action: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { user: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}

    const [history, total] = await Promise.all([
      prisma.historyRecord.findMany({
        where: whereClause,
        orderBy: {
          date: "desc",
        },
        skip: Number.parseInt(skip),
        take: Number.parseInt(limit),
        include: {
          family: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.historyRecord.count({
        where: whereClause,
      }),
    ])

    res.status(200).json({
      history,
      pagination: {
        total,
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error getting all history:", error)
    res.status(500).json({ message: "Ошибка при получении всей истории", error: error.message })
  }
}
