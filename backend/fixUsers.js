const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function fixUsers() {
    try {
        // Найти всех пользователей с iin = null
        const usersWithNullIIN = await prisma.user.findMany({
            where: {
                iin: { equals: null }, // Используем оператор equals для фильтрации null
            },
        });

        console.log(`Найдено ${usersWithNullIIN.length} пользователей с iin = null`);

        // Вариант 1: Удалить пользователей с iin = null
        await prisma.user.deleteMany({
            where: { iin: { equals: null } },
        });
        console.log("Пользователи с iin = null удалены");

        // Вариант 2: Обновить iin для существующих пользователей (раскомментируйте, если нужно)
        /*
        for (const user of usersWithNullIIN) {
          const newIIN = generateUniqueIIN();
          await prisma.user.update({
            where: { id: user.id },
            data: { iin: newIIN },
          });
          console.log(`Обновлен пользователь ${user.id} с новым ИИН: ${newIIN}`);
        }
        */

        console.log("Исправление завершено");
    } catch (error) {
        console.error("Ошибка при исправлении пользователей:", error);
    } finally {
        await prisma.$disconnect();
    }
}

// Функция для генерации уникального ИИН (для Варианта 2)
function generateUniqueIIN() {
    // Генерирует 12-значный ИИН (просто пример, замените на реальную логику)
    return Math.floor(100000000000 + Math.random() * 900000000000).toString();
}

fixUsers();