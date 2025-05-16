const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const familyRoutes = require("./routes/family.routes");
const familyMemberRoutes = require("./routes/familyMember.routes");
const supportRoutes = require("./routes/support.routes");
const reportRoutes = require("./routes/report.routes");
const documentRoutes = require("./routes/document.routes");
const statisticsRoutes = require("./routes/statistics.routes");
const { errorHandler } = require("./middleware/errorHandler");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5555;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/families", familyRoutes);
app.use("/api/family-members", familyMemberRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/statistics", statisticsRoutes);

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Server is running" });
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
});

module.exports = { app, prisma };