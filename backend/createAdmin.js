const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

const uri = "mongodb+srv://root:passwordton@cluster0.hwrmyhe.mongodb.net/tjs?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "tjs";

async function createAdmin() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Подключено к MongoDB");

        const db = client.db(dbName);
        const collection = db.collection("User");

        const existingUser = await collection.findOne({ iin: "123456789012" });
        if (existingUser) {
            console.log("Пользователь с ИИН 123456789012 уже существует");
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("admin123", salt);

        const admin = {
            iin: "123456789013",
            password: hashedPassword,
            fullName: "Админ Полный",
            phone: "+77012345678",
            role: "Администратор",
            region: "Павлодарская",
            district: "Павлодарский",
            city: "Павлодар",
            position: "Главный администратор",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLogin: null,
        };

        const result = await collection.insertOne(admin);
        console.log(`Администратор создан с ID: ${result.insertedId}`);
    } catch (error) {
        console.error("Ошибка при создании администратора:", error);
    } finally {
        await client.close();
    }
}

createAdmin();