const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://root:passwordton@cluster0.hwrmyhe.mongodb.net/tjs?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "tjs";

async function fixFamilyMembers() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Подключено к MongoDB");

        const db = client.db(dbName);
        const collection = db.collection("FamilyMember");

        // Найти записи с documentNumber = null
        const membersWithNullDoc = await collection.find({ documentNumber: null }).toArray();
        console.log(`Найдено ${membersWithNullDoc.length} записей с documentNumber = null`);

        // Вариант 1: Удалить записи с documentNumber = null
        const deleteResult = await collection.deleteMany({ documentNumber: null });
        console.log(`Удалено ${deleteResult.deletedCount} записей с documentNumber = null`);

        // Вариант 2: Обновить documentNumber для записей (раскомментируйте, если нужно)
        /*
        for (const member of membersWithNullDoc) {
          const newDocNumber = await generateUniqueDocNumber(collection);
          await collection.updateOne(
            { _id: member._id },
            { $set: { documentNumber: newDocNumber } }
          );
          console.log(`Обновлена запись ${member._id} с новым номером документа: ${newDocNumber}`);
        }
        */

        console.log("Исправление данных завершено");
    } catch (error) {
        console.error("Ошибка при исправлении записей:", error);
    } finally {
        await client.close();
    }
}

// Функция для генерации уникального номера документа
async function generateUniqueDocNumber(collection) {
    let newDocNumber;
    let isUnique = false;
    while (!isUnique) {
        newDocNumber = Math.floor(100000000 + Math.random() * 900000000).toString(); // Пример: 9-значный номер
        const existing = await collection.findOne({ documentNumber: newDocNumber });
        if (!existing) isUnique = true;
    }
    return newDocNumber;
}

fixFamilyMembers();