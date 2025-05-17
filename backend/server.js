const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const authRoutes = require("./routes/auth.routes")
const userRoutes = require("./routes/user.routes")
const familyRoutes = require("./routes/family.routes")
const familyMemberRoutes = require("./routes/familyMember.routes")
const supportRoutes = require("./routes/support.routes")
const reportRoutes = require("./routes/report.routes")
const documentRoutes = require("./routes/document.routes")
const statisticsRoutes = require("./routes/statistics.routes")
const { errorHandler } = require("./middleware/errorHandler")
const { PrismaClient } = require("@prisma/client")
const path = require("path");
// Initialize Prisma client
const prisma = new PrismaClient()

// Load environment variables
dotenv.config()

// Create Express app
const app = express()
const PORT = 5555

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
mongoose
  .connect("mongodb+srv://root:passwordton@cluster0.hwrmyhe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log("Connected to MongoDB")
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error)
    process.exit(1)
  })

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/families", familyRoutes)
app.use("/api/family-members", familyMemberRoutes)
app.use("/api/support", supportRoutes)
app.use("/api/reports", reportRoutes)
app.use("/api/documents", documentRoutes)
app.use("/api/statistics", statisticsRoutes)

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" })
})

// Error handling middleware
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err)
  // Close server & exit process
  // server.close(() => process.exit(1));
})

module.exports = { app, prisma }
