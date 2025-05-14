// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack)

  // Check if error is a Prisma error
  if (err.code && err.code.startsWith("P")) {
    return handlePrismaError(err, res)
  }

  // Default error response
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {},
  })
}

// Handle specific Prisma errors
const handlePrismaError = (err, res) => {
  switch (err.code) {
    case "P2002": // Unique constraint failed
      return res.status(409).json({
        message: `Duplicate entry: ${err.meta?.target?.join(", ")}`,
      })
    case "P2025": // Record not found
      return res.status(404).json({
        message: "Record not found",
      })
    case "P2003": // Foreign key constraint failed
      return res.status(400).json({
        message: "Related record not found",
      })
    default:
      return res.status(500).json({
        message: "Database error",
        error: process.env.NODE_ENV === "development" ? err : {},
      })
  }
}

module.exports = { errorHandler }
