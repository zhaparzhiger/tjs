const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { iin: "123456789012" }, // Use unique iin instead of username
    update: {}, // Update nothing if exists (or specify fields to update)
    create: {
      iin: "123456789012",
      password: adminPassword,
      fullName: "Admin User",
      role: "admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log("Admin user created:", admin.iin);

  // Create social worker user
  const socialWorkerPassword = await bcrypt.hash("worker123", 10);
  const socialWorker = await prisma.user.upsert({
    where: { iin: "987654321098" }, // Use unique iin
    update: {},
    create: {
      iin: "987654321098",
      password: socialWorkerPassword,
      fullName: "Social Worker",
      role: "social",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log("Social worker user created:", socialWorker.iin);

  // Create sample families
  const families = [
    {
      caseNumber: "F2023-001",
      familyName: "Smith",
      address: "123 Main St, Anytown",
      district: "North",
      region: "Central",
      city: "Anytown",
      status: "active",
      riskLevel: "medium",
      riskFactors: ["financial", "unemployment"],
      registrationDate: new Date("2023-01-15"),
      notes: "Family with 3 children, financial difficulties",
      createdById: admin.id,
      updatedById: admin.id,
      isActive: true,
      socialBenefits: [], // Added to match schema
    },
    {
      caseNumber: "F2023-002",
      familyName: "Johnson",
      address: "456 Oak Ave, Anytown",
      district: "South",
      region: "Central",
      city: "Anytown",
      status: "active",
      riskLevel: "high",
      riskFactors: ["housing", "single-parent"],
      registrationDate: new Date("2023-02-20"),
      notes: "Single parent family, housing issues",
      createdById: admin.id,
      updatedById: admin.id,
      isActive: true,
      socialBenefits: [],
    },
    {
      caseNumber: "F2023-003",
      familyName: "Williams",
      address: "789 Pine St, Anytown",
      district: "East",
      region: "Eastern",
      city: "Anytown",
      status: "inactive",
      riskLevel: "low",
      riskFactors: ["none"],
      registrationDate: new Date("2023-03-10"),
      notes: "Family with 2 children, case closed",
      createdById: admin.id,
      updatedById: admin.id,
      isActive: false,
      inactiveReason: "Case closed",
      socialBenefits: [],
    },
  ];

  for (const familyData of families) {
    const family = await prisma.family.upsert({
      where: { caseNumber: familyData.caseNumber },
      update: {},
      create: familyData,
    });
    console.log("Family created:", family.familyName);

    // Create family members for each family
    if (family.caseNumber === "F2023-001") {
      await prisma.familyMember.createMany({
        data: [
          {
            familyId: family.id,
            firstName: "John",
            lastName: "Smith",
            birthDate: new Date("1980-05-15"),
            gender: "male",
            relationship: "parent",
            employment: "Construction Worker",
            education: "high school",
            healthStatus: "good",
            notes: "Father, main provider",
            isActive: true,
            chronicConditions: [], // Added to match schema
            allergies: [],
            medications: [],
          },
          {
            familyId: family.id,
            firstName: "Mary",
            lastName: "Smith",
            birthDate: new Date("1982-08-20"),
            gender: "female",
            relationship: "parent",
            employment: "Part-time Cashier",
            education: "high school",
            healthStatus: "good",
            notes: "Mother, works part-time",
            isActive: true,
            chronicConditions: [],
            allergies: [],
            medications: [],
          },
          {
            familyId: family.id,
            firstName: "Tommy",
            lastName: "Smith",
            birthDate: new Date("2010-03-10"),
            gender: "male",
            relationship: "child",
            education: "elementary",
            healthStatus: "good",
            notes: "Son, attends local elementary school",
            isActive: true,
            chronicConditions: [],
            allergies: [],
            medications: [],
          },
          {
            familyId: family.id,
            firstName: "Sarah",
            lastName: "Smith",
            birthDate: new Date("2012-07-25"),
            gender: "female",
            relationship: "child",
            education: "elementary",
            healthStatus: "good",
            notes: "Daughter, attends local elementary school",
            isActive: true,
            chronicConditions: [],
            allergies: [],
            medications: [],
          },
          {
            familyId: family.id,
            firstName: "Baby",
            lastName: "Smith",
            birthDate: new Date("2022-01-05"),
            gender: "female",
            relationship: "child",
            healthStatus: "good",
            notes: "Infant daughter",
            isActive: true,
            chronicConditions: [],
            allergies: [],
            medications: [],
          },
        ],
      });
      console.log("Created family members for Smith family");
    }

    if (family.caseNumber === "F2023-002") {
      await prisma.familyMember.createMany({
        data: [
          {
            familyId: family.id,
            firstName: "Lisa",
            lastName: "Johnson",
            birthDate: new Date("1985-11-12"),
            gender: "female",
            relationship: "parent",
            employment: "Retail Worker",
            education: "some college",
            healthStatus: "fair",
            notes: "Single mother, works full-time",
            isActive: true,
            chronicConditions: [],
            allergies: [],
            medications: [],
          },
          {
            familyId: family.id,
            firstName: "Mike",
            lastName: "Johnson",
            birthDate: new Date("2008-04-18"),
            gender: "male",
            relationship: "child",
            education: "middle school",
            healthStatus: "good",
            notes: "Son, behavioral issues at school",
            isActive: true,
            chronicConditions: [],
            allergies: [],
            medications: [],
          },
          {
            familyId: family.id,
            firstName: "Emma",
            lastName: "Johnson",
            birthDate: new Date("2015-09-30"),
            gender: "female",
            relationship: "child",
            education: "preschool",
            healthStatus: "good",
            notes: "Daughter, starting kindergarten soon",
            isActive: true,
            chronicConditions: [],
            allergies: [],
            medications: [],
          },
        ],
      });
      console.log("Created family members for Johnson family");
    }

    if (family.caseNumber === "F2023-003") {
      await prisma.familyMember.createMany({
        data: [
          {
            familyId: family.id,
            firstName: "Robert",
            lastName: "Williams",
            birthDate: new Date("1975-02-28"),
            gender: "male",
            relationship: "parent",
            employment: "Office Manager",
            education: "bachelors",
            healthStatus: "good",
            notes: "Father, stable employment",
            isActive: true,
            chronicConditions: [],
            allergies: [],
            medications: [],
          },
          {
            familyId: family.id,
            firstName: "Patricia",
            lastName: "Williams",
            birthDate: new Date("1978-06-14"),
            gender: "female",
            relationship: "parent",
            employment: "Teacher",
            education: "masters",
            healthStatus: "good",
            notes: "Mother, works as elementary school teacher",
            isActive: true,
            chronicConditions: [],
            allergies: [],
            medications: [],
          },
          {
            familyId: family.id,
            firstName: "David",
            lastName: "Williams",
            birthDate: new Date("2011-12-05"),
            gender: "male",
            relationship: "child",
            education: "elementary",
            healthStatus: "excellent",
            notes: "Son, good academic performance",
            isActive: true,
            chronicConditions: [],
            allergies: [],
            medications: [],
          },
          {
            familyId: family.id,
            firstName: "Jennifer",
            lastName: "Williams",
            birthDate: new Date("2014-03-22"),
            gender: "female",
            relationship: "child",
            education: "preschool",
            healthStatus: "good",
            notes: "Daughter, attends preschool",
            isActive: true,
            chronicConditions: [],
            allergies: [],
            medications: [],
          },
        ],
      });
      console.log("Created family members for Williams family");
    }

    // Create support measures for each family
    if (family.caseNumber === "F2023-001") {
      await prisma.supportMeasure.createMany({
        data: [
          {
            familyId: family.id,
            type: "financial",
            description: "Monthly financial assistance",
            startDate: new Date("2023-02-01"),
            endDate: new Date("2023-12-31"),
            status: "in-progress",
            provider: "Social Services Department",
            notes: "Approved for 11 months",
            createdById: admin.id,
            createdAt: new Date(),
          },
          {
            familyId: family.id,
            type: "psychological",
            description: "Family counseling sessions",
            startDate: new Date("2023-03-15"),
            endDate: new Date("2023-09-15"),
            status: "in-progress",
            provider: "Community Mental Health Center",
            notes: "Bi-weekly sessions",
            createdById: admin.id,
            createdAt: new Date(),
          },
        ],
      });
      console.log("Created support measures for Smith family");
    }

    if (family.caseNumber === "F2023-002") {
      await prisma.supportMeasure.createMany({
        data: [
          {
            familyId: family.id,
            type: "housing",
            description: "Housing subsidy",
            startDate: new Date("2023-02-25"),
            endDate: new Date("2024-02-25"),
            status: "in-progress",
            provider: "Housing Authority",
            notes: "One-year housing assistance",
            createdById: admin.id,
            createdAt: new Date(),
          },
          {
            familyId: family.id,
            type: "educational",
            description: "After-school program for Mike",
            startDate: new Date("2023-03-01"),
            endDate: new Date("2023-12-15"),
            status: "in-progress",
            provider: "Youth Development Center",
            notes: "Monday through Thursday, includes tutoring",
            createdById: admin.id,
            createdAt: new Date(),
          },
          {
            familyId: family.id,
            type: "childcare",
            description: "Subsidized childcare for Emma",
            startDate: new Date("2023-03-01"),
            endDate: new Date("2023-12-15"),
            status: "in-progress",
            provider: "Little Stars Daycare",
            notes: "Full-day program while mother works",
            createdById: admin.id,
            createdAt: new Date(),
          },
        ],
      });
      console.log("Created support measures for Johnson family");
    }

    if (family.caseNumber === "F2023-003") {
      await prisma.supportMeasure.createMany({
        data: [
          {
            familyId: family.id,
            type: "educational",
            description: "Summer camp scholarship",
            startDate: new Date("2023-06-15"),
            endDate: new Date("2023-08-15"),
            status: "completed",
            provider: "Community Foundation",
            notes: "Summer enrichment program for both children",
            createdById: admin.id,
            createdAt: new Date(),
          },
        ],
      });
      console.log("Created support measures for Williams family");
    }
  }

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });