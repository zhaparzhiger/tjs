const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://fhjivyhbbf:wQdrWRIiVM9WibQx@cluster0.y7zjbcr.mongodb.net/tjs?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "tjs";

async function fixUsers() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Подключено к MongoDB");

        const db = client.db(dbName);
        const collection = db.collection("User");

        // Найти пользователей с iin = null
        const usersWithNullIIN = await collection.find({ iin: null }).toArray();
        console.log(`Найдено ${usersWithNullIIN.length} пользователей с iin = null`);

        // Вариант 1: Удалить пользователей с iin = null
        const deleteResult = await collection.deleteMany({ iin: null });
        console.log(`Удалено ${deleteResult.deletedCount} пользователей с iin = null`);

        // Вариант 2: Обновить iin для пользователей (раскомментируйте, если нужно)
        /*
        for (const user of usersWithNullIIN) {
          const newIIN = await generateUniqueIIN(collection);
          await collection.updateOne(
            { _id: user._id },
            { $set: { iin: newIIN } }
          );
          console.log(`Обновлен пользователь ${user._id} с новым ИИН: ${newIIN}`);
        }
        */

        console.log("Исправление данных завершено");
    } catch (error) {
        console.error("Ошибка при исправлении пользователей:", error);
    } finally {
        await client.close();
    }
}

// Функция для генерации уникального ИИН
async function generateUniqueIIN(collection) {
    let newIIN;
    let isUnique = false;
    while (!isUnique) {
        newIIN = Math.floor(100000000000 + Math.random() * 900000000000).toString();
        const existing = await collection.findOne({ iin: newIIN });
        if (!existing) isUnique = true;
    }
    return newIIN;
}

fixUsers();