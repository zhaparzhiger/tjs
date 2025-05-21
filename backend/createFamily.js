const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://root:passwordton@cluster0.hwrmyhe.mongodb.net/tjs?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "tjs";

async function createMultipleFamilies() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Подключено к MongoDB");

        const db = client.db(dbName);
        const familyCollection = db.collection("Family");
        const userCollection = db.collection("User");

        // Find a valid user
        const adminUser = await userCollection.findOne({ iin: "123456789013" });
        if (!adminUser) {
            console.log("Администратор с ИИН 123456789013 не найден. Создайте пользователя сначала.");
            return;
        }
        const validUserId = adminUser._id.toString();

        // Array to store family data
        const families = [];

        // Generate 20 unique families
        for (let i = 1; i <= 20; i++) {
            const caseNumber = `FAM-2025-${String(i).padStart(3, "0")}`; // e.g., FAM-2025-001, FAM-2025-002, etc.
            const familyName = `Family ${i}`;
            const address = `${100 + i} Main St, Павлодар`;

            // Check if caseNumber already exists
            const existingFamily = await familyCollection.findOne({ caseNumber });
            if (existingFamily) {
                console.log(`Семья с номером дела ${caseNumber} уже существует, пропускаем.`);
                continue;
            }

            const family = {
                caseNumber,
                familyName,
                address,
                region: "Павлодарская",
                registrationAddress: address,
                district: "Павлодарский",
                city: "Павлодар",
                status: ["active", "inactive", "monitoring"][Math.floor(Math.random() * 3)],
                riskLevel: ["high", "medium", "low"][Math.floor(Math.random() * 3)],
                riskFactors: [
                    ["unemployment", "low income"],
                    ["health issues", "housing instability"],
                    ["education needs", "financial issues"]
                ][Math.floor(Math.random() * 3)],
                registrationDate: new Date(`2025-05-${Math.floor(Math.random() * 20) + 1}`),
                lastUpdate: new Date(),
                isActive: Math.random() > 0.2, // 80% chance of being active
                inactiveReason: Math.random() > 0.8 ? "Moved away" : null,
                notes: `Initial assessment for ${familyName}`,
                children: Math.floor(Math.random() * 5) + 1, // 1 to 5 children
                settingReason: "Social support needed",
                inspectionStatus: ["not-inspected", "inspected", "pending"][Math.floor(Math.random() * 3)],
                familyType: ["full", "single-parent", "extended"][Math.floor(Math.random() * 3)],
                housingType: ["apartment", "house", "temporary"][Math.floor(Math.random() * 3)],
                employment: ["part-time", "full-time", "unemployed"][Math.floor(Math.random() * 3)],
                workplace: `Workplace ${i}`,
                tzhsReason: "Financial instability",
                nbReason: "Community referral",
                familyIncome: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
                needsSupport: Math.random() > 0.5,
                needsEducation: Math.random() > 0.5,
                needsHealth: Math.random() > 0.5,
                needsPolice: Math.random() > 0.8,
                hasDisability: Math.random() > 0.7,
                contactPhone: `+770123456${String(i).padStart(2, "0")}`,
                contactEmail: `family${i}.example@example.com`,
                incomeSource: ["job", "benefits", "self-employed"][Math.floor(Math.random() * 3)],
                monthlyIncome: Math.floor(Math.random() * 3000) + 1000, // 1000 to 4000
                socialBenefits: [
                    ["food stamps"],
                    ["housing aid", "medical aid"],
                    ["none"]
                ][Math.floor(Math.random() * 3)],
                referralSource: "Community Center",
                primaryLanguage: ["English", "Russian", "Kazakh"][Math.floor(Math.random() * 3)],
                hasInterpreterNeeded: Math.random() > 0.8,
                createdById: validUserId,
                updatedById: validUserId,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            families.push(family);
        }

        // Insert all families
        if (families.length > 0) {
            const result = await familyCollection.insertMany(families);
            console.log(`Создано ${result.insertedCount} семей с ID:`, Object.values(result.insertedIds));
        } else {
            console.log("Не создано ни одной семьи, все caseNumber уже существуют.");
        }
    } catch (error) {
        console.error("Ошибка при создании семей:", error);
    } finally {
        await client.close();
    }
}

createMultipleFamilies();