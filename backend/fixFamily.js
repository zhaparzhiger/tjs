const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://root:passwordton@cluster0.hwrmyhe.mongodb.net/tjs?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "tjs";

async function fixInvalidFamily() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Подключено к MongoDB");

        const db = client.db(dbName);
        const familyCollection = db.collection("Family");
        const userCollection = db.collection("User");

        // Find a valid user to use for createdById and updatedById
        const adminUser = await userCollection.findOne({ iin: "123456789013" }); // Use the IIN from createAdmin
        if (!adminUser) {
            console.log("Администратор с ИИН 123456789013 не найден. Создайте пользователя сначала.");
            return;
        }
        const validUserId = adminUser._id.toString();

        // Find families with invalid createdById or updatedById
        const invalidFamilies = await familyCollection.find({
            $or: [
                { createdById: "user_object_id" },
                { updatedById: "user_object_id" }
            ]
        }).toArray();

        if (invalidFamilies.length === 0) {
            console.log("Семьи с невалидным ObjectId не найдены.");
            return;
        }

        // Update invalid families
        for (const family of invalidFamilies) {
            await familyCollection.updateOne(
                { _id: family._id },
                {
                    $set: {
                        createdById: validUserId,
                        updatedById: validUserId
                    }
                }
            );
            console.log(`Обновлена семья с ID: ${family._id}`);
        }

        console.log("Все невалидные семьи обновлены.");
    } catch (error) {
        console.error("Ошибка при обновлении семей:", error);
    } finally {
        await client.close();
    }
}

fixInvalidFamily();