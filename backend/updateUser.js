const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function updateUser() {
    try {
        await prisma.user.update({
            where: { iin: "123456789012" },
            data: {
                role: "admin",
                region: "Алматинская",
                district: "Алматинский",
                city: "Алматы",
            },
        });
        console.log("User updated");
    } catch (error) {
        console.error("Error updating user:", error);
    } finally {
        await prisma.$disconnect();
    }
}

updateUser();