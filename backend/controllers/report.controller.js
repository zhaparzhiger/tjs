const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const ExcelJS = require("exceljs")
const path = require("path")
const fs = require("fs")
const { Parser } = require("json2csv")
const PDFDocument = require("pdfkit")

const generateFamiliesReport = async (req, res) => {
  try {
    const { format = "excel", district, startDate, endDate, search } = req.query
    const filter = req.familyFilter || {}

    if (district && district !== "all") filter.district = district
    if (startDate || endDate) {
      filter.registrationDate = {}
      if (startDate) filter.registrationDate.gte = new Date(startDate)
      if (endDate) filter.registrationDate.lte = new Date(endDate)
    }

    if (search) {
      // First try to find family members with matching IIN (document number)
      const matchingFamilies = await prisma.familyMember.findMany({
        where: {
          documentNumber: { contains: search, mode: "insensitive" },
        },
        select: { familyId: true },
      })
      const familyIds = matchingFamilies.map((m) => m.familyId)

      filter.OR = [
        { familyName: { contains: search, mode: "insensitive" } },
        { id: { in: familyIds } },
        { caseNumber: { contains: search, mode: "insensitive" } },
      ]
    }

    const families = await prisma.family.findMany({
      where: filter,
      include: {
        createdBy: { select: { fullName: true } },
        updatedBy: { select: { fullName: true } },
      },
      orderBy: { registrationDate: "desc" },
    })

    const familyIds = families.map((f) => f.id)
    const memberCounts = await prisma.familyMember.groupBy({
      by: ["familyId"],
      where: { familyId: { in: familyIds } },
      _count: { _all: true },
    })
    const supportCounts = await prisma.supportMeasure.groupBy({
      by: ["familyId"],
      where: { familyId: { in: familyIds } },
      _count: { _all: true },
    })

    const memberCountMap = new Map(memberCounts.map((mc) => [mc.familyId, mc._count._all]))
    const supportCountMap = new Map(supportCounts.map((sc) => [sc.familyId, sc._count._all]))
    families.forEach((family) => {
      family._count = {
        members: memberCountMap.get(family.id) || 0,
        supportMeasures: supportCountMap.get(family.id) || 0,
      }
    })

    console.log(
      "Families:",
      JSON.stringify(
        families.map((f) => ({
          id: f.id,
          caseNumber: f.caseNumber,
          familyName: f.familyName,
          membersCount: f._count.members,
        })),
        null,
        2,
      ),
    )

    if (families.length === 0 && search) {
      console.warn(`No families found for search query: ${search}`)
      return res.status(404).json({ message: `No families found matching "${search}"` })
    }

    console.log(`Found ${families.length} families matching search: "${search || "all"}"`)

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const filename = `families-report-${timestamp}`

    switch (format.toLowerCase()) {
      case "excel":
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet("Families Report")

        worksheet.columns = [
          { header: "Case Number", key: "caseNumber", width: 15 },
          { header: "Family Name", key: "familyName", width: 20 },
          { header: "Address", key: "address", width: 30 },
          { header: "Region", key: "region", width: 15 },
          { header: "Registration Address", key: "registrationAddress", width: 30 },
          { header: "District", key: "district", width: 15 },
          { header: "City", key: "city", width: 15 },
          { header: "Status", key: "status", width: 15 },
          { header: "Risk Level", key: "riskLevel", width: 15 },
          { header: "Risk Factors", key: "riskFactors", width: 30 },
          { header: "Registration Date", key: "registrationDate", width: 20 },
          { header: "Last Update", key: "lastUpdate", width: 20 },
          { header: "Active", key: "isActive", width: 10 },
          { header: "Inactive Reason", key: "inactiveReason", width: 30 },
          { header: "Notes", key: "notes", width: 30 },
          { header: "Children", key: "children", width: 10 },
          { header: "Setting Reason", key: "settingReason", width: 20 },
          { header: "Inspection Status", key: "inspectionStatus", width: 20 },
          { header: "Family Type", key: "familyType", width: 15 },
          { header: "Housing Type", key: "housingType", width: 15 },
          { header: "Employment", key: "employment", width: 20 },
          { header: "Workplace", key: "workplace", width: 20 },
          { header: "TZHS Reason", key: "tzhsReason", width: 20 },
          { header: "NB Reason", key: "nbReason", width: 20 },
          { header: "Family Income", key: "familyIncome", width: 15 },
          { header: "Needs Support", key: "needsSupport", width: 15 },
          { header: "Needs Education", key: "needsEducation", width: 15 },
          { header: "Needs Health", key: "needsHealth", width: 15 },
          { header: "Needs Police", key: "needsPolice", width: 15 },
          { header: "Has Disability", key: "hasDisability", width: 15 },
          { header: "Contact Phone", key: "contactPhone", width: 15 },
          { header: "Contact Email", key: "contactEmail", width: 20 },
          { header: "Income Source", key: "incomeSource", width: 20 },
          { header: "Monthly Income", key: "monthlyIncome", width: 15 },
          { header: "Social Benefits", key: "socialBenefits", width: 30 },
          { header: "Referral Source", key: "referralSource", width: 20 },
          { header: "Primary Language", key: "primaryLanguage", width: 15 },
          { header: "Interpreter Needed", key: "hasInterpreterNeeded", width: 15 },
          { header: "Members Count", key: "membersCount", width: 15 },
          { header: "Support Measures Count", key: "supportCount", width: 20 },
          { header: "Created By", key: "createdBy", width: 20 },
          { header: "Updated By", key: "updatedBy", width: 20 },
        ]

        families.forEach((family) => {
          worksheet.addRow({
            caseNumber: family.caseNumber,
            familyName: family.familyName,
            address: family.address,
            region: family.region,
            registrationAddress: family.registrationAddress || "",
            district: family.district,
            city: family.city || "",
            status: family.status,
            riskLevel: family.riskLevel,
            riskFactors: family.riskFactors?.join(", ") || "",
            registrationDate: family.registrationDate?.toLocaleDateString() || "",
            lastUpdate: family.lastUpdate?.toLocaleDateString() || "",
            isActive: family.isActive ? "Yes" : "No",
            inactiveReason: family.inactiveReason || "",
            notes: family.notes || "",
            children: family.children || "",
            settingReason: family.settingReason || "",
            inspectionStatus: family.inspectionStatus || "",
            familyType: family.familyType || "",
            housingType: family.housingType || "",
            employment: family.employment || "",
            workplace: family.workplace || "",
            tzhsReason: family.tzhsReason || "",
            nbReason: family.nbReason || "",
            familyIncome: family.familyIncome || "",
            needsSupport: family.needsSupport ? "Yes" : "No",
            needsEducation: family.needsEducation ? "Yes" : "No",
            needsHealth: family.needsHealth ? "Yes" : "No",
            needsPolice: family.needsPolice ? "Yes" : "No",
            hasDisability: family.hasDisability ? "Yes" : "No",
            contactPhone: family.contactPhone || "",
            contactEmail: family.contactEmail || "",
            incomeSource: family.incomeSource || "",
            monthlyIncome: family.monthlyIncome || "",
            socialBenefits: family.socialBenefits?.join(", ") || "",
            referralSource: family.referralSource || "",
            primaryLanguage: family.primaryLanguage || "",
            hasInterpreterNeeded: family.hasInterpreterNeeded ? "Yes" : "No",
            membersCount: family._count?.members ?? 0,
            supportCount: family._count?.supportMeasures ?? 0,
            createdBy: family.createdBy?.fullName || "",
            updatedBy: family.updatedBy?.fullName || "",
          })
        })

        worksheet.getRow(1).font = { bold: true }
        worksheet.getRow(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD3D3D3" },
        }

        const reportsDir = path.join(__dirname, "../reports")
        if (!fs.existsSync(reportsDir)) {
          fs.mkdirSync(reportsDir, { recursive: true })
        }

        const filepath = path.join(reportsDir, `${filename}.xlsx`)
        await workbook.xlsx.writeFile(filepath)

        res.download(filepath, `${filename}.xlsx`, (err) => {
          if (err) throw err
          fs.unlinkSync(filepath)
        })
        break

      case "csv":
        const fields = [
          { label: "Case Number", value: "caseNumber" },
          { label: "Family Name", value: "familyName" },
          { label: "Address", value: "address" },
          { label: "Region", value: "region" },
          { label: "Registration Address", value: "registrationAddress" },
          { label: "District", value: "district" },
          { label: "City", value: "city" },
          { label: "Status", value: "status" },
          { label: "Risk Level", value: "riskLevel" },
          { label: "Risk Factors", value: (row) => row.riskFactors?.join(", ") || "" },
          { label: "Registration Date", value: (row) => row.registrationDate?.toLocaleDateString() || "" },
          { label: "Last Update", value: (row) => row.lastUpdate?.toLocaleDateString() || "" },
          { label: "Active", value: (row) => (row.isActive ? "Yes" : "No") },
          { label: "Inactive Reason", value: "inactiveReason" },
          { label: "Notes", value: "notes" },
          { label: "Children", value: "children" },
          { label: "Setting Reason", value: "settingReason" },
          { label: "Inspection Status", value: "inspectionStatus" },
          { label: "Family Type", value: "familyType" },
          { label: "Housing Type", value: "housingType" },
          { label: "Employment", value: "employment" },
          { label: "Workplace", value: "workplace" },
          { label: "TZHS Reason", value: "tzhsReason" },
          { label: "NB Reason", value: "nbReason" },
          { label: "Family Income", value: "familyIncome" },
          { label: "Needs Support", value: (row) => (row.needsSupport ? "Yes" : "No") },
          { label: "Needs Education", value: (row) => (row.needsEducation ? "Yes" : "No") },
          { label: "Needs Health", value: (row) => (row.needsHealth ? "Yes" : "No") },
          { label: "Needs Police", value: (row) => (row.needsPolice ? "Yes" : "No") },
          { label: "Has Disability", value: (row) => (row.hasDisability ? "Yes" : "No") },
          { label: "Contact Phone", value: "contactPhone" },
          { label: "Contact Email", value: "contactEmail" },
          { label: "Income Source", value: "incomeSource" },
          { label: "Monthly Income", value: "monthlyIncome" },
          { label: "Social Benefits", value: (row) => row.socialBenefits?.join(", ") || "" },
          { label: "Referral Source", value: "referralSource" },
          { label: "Primary Language", value: "primaryLanguage" },
          { label: "Interpreter Needed", value: (row) => (row.hasInterpreterNeeded ? "Yes" : "No") },
          { label: "Members Count", value: (row) => row._count?.members ?? 0 },
          { label: "Support Measures Count", value: (row) => row._count?.supportMeasures ?? 0 },
          { label: "Created By", value: (row) => row.createdBy?.fullName || "" },
          { label: "Updated By", value: (row) => row.updatedBy?.fullName || "" },
        ]

        const csv = new Parser({ fields }).parse(families)
        res.header("Content-Type", "text/csv")
        res.attachment(`${filename}.csv`)
        res.send(csv)
        break

      case "json":
        res.header("Content-Type", "application/json")
        res.attachment(`${filename}.json`)
        res.send(JSON.stringify(families, null, 2))
        break

      case "pdf":
        const doc = new PDFDocument()
        res.header("Content-Type", "application/pdf")
        res.attachment(`${filename}.pdf`)

        doc.pipe(res)
        doc.fontSize(12).text("Families Report", { align: "center" })
        doc.moveDown()

        families.forEach((family, index) => {
          doc.text(`Family ${index + 1}`)
          doc.text(`Case Number: ${family.caseNumber}`)
          doc.text(`Name: ${family.familyName}`)
          doc.text(`Address: ${family.address}`)
          doc.text(`Region: ${family.region}`)
          doc.text(`District: ${family.district}`)
          doc.text(`Members Count: ${family._count?.members ?? 0}`)
          doc.moveDown()
        })

        doc.end()
        break

      default:
        throw new Error("Unsupported format")
    }

    await prisma.reportHistory.create({
      data: {
        filename: `${filename}.${format}`,
        type: "families",
        createdById: req.user.id,
      },
    })
  } catch (error) {
    console.error("Error in generateFamiliesReport:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

const generateFamilyMembersReport = async (req, res) => {
  try {
    const { format = "excel", district, startDate, endDate, relationship, gender, ageFrom, ageTo } = req.query

    let familyFilter = {}
    if (req.familyFilter) {
      const accessibleFamilies = await prisma.family.findMany({
        where: req.familyFilter,
        select: { id: true },
      })
      const familyIds = accessibleFamilies.map((family) => family.id)
      familyFilter = { familyId: { in: familyIds } }
    }

    if (district && district !== "all") {
      const familiesInDistrict = await prisma.family.findMany({
        where: { district },
        select: { id: true },
      })
      const districtFamilyIds = familiesInDistrict.map((f) => f.id)
      familyFilter.familyId = { in: districtFamilyIds }
    }

    const ageFilter = {}
    if (ageFrom || ageTo) {
      const now = new Date()
      if (ageFrom) {
        const fromDate = new Date()
        fromDate.setFullYear(now.getFullYear() - Number.parseInt(ageFrom))
        ageFilter.lte = fromDate
      }
      if (ageTo) {
        const toDate = new Date()
        toDate.setFullYear(now.getFullYear() - Number.parseInt(ageTo))
        ageFilter.gte = toDate
      }
    }

    const combinedFilter = {
      ...familyFilter,
      ...(relationship ? { relationship } : {}),
      ...(gender ? { gender } : {}),
      ...(Object.keys(ageFilter).length > 0 ? { birthDate: ageFilter } : {}),
    }

    const familyMembers = await prisma.familyMember.findMany({
      where: combinedFilter,
      include: {
        family: {
          select: {
            caseNumber: true,
            familyName: true,
            region: true,
            district: true,
            city: true,
          },
        },
      },
      orderBy: [{ familyId: "asc" }, { lastName: "asc" }, { firstName: "asc" }],
    })

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const filename = `family-members-report-${timestamp}`

    const calculateAge = (birthDate) => {
      if (!birthDate) return ""
      const today = new Date()
      const birth = new Date(birthDate)
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
      }
      return age
    }

    switch (format.toLowerCase()) {
      case "excel":
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet("Family Members Report")

        worksheet.columns = [
          { header: "Family Case Number", key: "caseNumber", width: 20 },
          { header: "Family Name", key: "familyName", width: 20 },
          { header: "Region", key: "region", width: 15 },
          { header: "District", key: "district", width: 15 },
          { header: "City", key: "city", width: 15 },
          { header: "First Name", key: "firstName", width: 15 },
          { header: "Last Name", key: "lastName", width: 15 },
          { header: "Middle Name", key: "middleName", width: 15 },
          { header: "Birth Date", key: "birthDate", width: 15 },
          { header: "Age", key: "age", width: 10 },
          { header: "Gender", key: "gender", width: 10 },
          { header: "Relationship", key: "relationship", width: 15 },
          { header: "Document Type", key: "documentType", width: 15 },
          { header: "Document Number", key: "documentNumber", width: 20 },
          { header: "Document Issue Date", key: "documentIssueDate", width: 15 },
          { header: "Document Expiry Date", key: "documentExpiryDate", width: 15 },
          { header: "Registration Address", key: "registrationAddress", width: 30 },
          { header: "Education", key: "education", width: 15 },
          { header: "Grade", key: "grade", width: 10 },
          { header: "Institution", key: "institution", width: 20 },
          { header: "Course", key: "course", width: 15 },
          { header: "Funding", key: "funding", width: 15 },
          { header: "Meals", key: "meals", width: 15 },
          { header: "Notes", key: "notes", width: 30 },
          { header: "Status", key: "status", width: 15 },
          { header: "Active", key: "isActive", width: 10 },
          { header: "Citizenship", key: "citizenship", width: 15 },
          { header: "Ethnicity", key: "ethnicity", width: 15 },
          { header: "Marital Status", key: "maritalStatus", width: 15 },
          { header: "Phone Number", key: "phoneNumber", width: 15 },
          { header: "Email", key: "email", width: 20 },
          { header: "Employment", key: "employment", width: 15 },
          { header: "Health Status", key: "healthStatus", width: 15 },
          { header: "Disabilities", key: "disabilities", width: 20 },
          { header: "Special Needs", key: "specialNeeds", width: 15 },
          { header: "Head of Household", key: "isHeadOfHousehold", width: 15 },
          { header: "Primary Caregiver", key: "primaryCaregiver", width: 15 },
          { header: "Income Amount", key: "incomeAmount", width: 15 },
          { header: "Income Source", key: "incomeSource", width: 20 },
          { header: "Medical Insurance", key: "medicalInsurance", width: 15 },
          { header: "Chronic Conditions", key: "chronicConditions", width: 30 },
          { header: "Allergies", key: "allergies", width: 30 },
          { header: "Medications", key: "medications", width: 30 },
        ]

        familyMembers.forEach((member) => {
          worksheet.addRow({
            caseNumber: member.family.caseNumber,
            familyName: member.family.familyName,
            region: member.family.region,
            district: member.family.district,
            city: member.family.city || "",
            firstName: member.firstName,
            lastName: member.lastName,
            middleName: member.middleName || "",
            birthDate: member.birthDate ? member.birthDate.toLocaleDateString() : "",
            age: calculateAge(member.birthDate),
            gender: member.gender || "",
            relationship: member.relationship,
            documentType: member.documentType || "",
            documentNumber: member.documentNumber || "",
            documentIssueDate: member.documentIssueDate ? member.documentIssueDate.toLocaleDateString() : "",
            documentExpiryDate: member.documentExpiryDate ? member.documentExpiryDate.toLocaleDateString() : "",
            registrationAddress: member.registrationAddress || "",
            education: member.education || "",
            grade: member.grade || "",
            institution: member.institution || "",
            course: member.course || "",
            funding: member.funding || "",
            meals: member.meals || "",
            notes: member.notes || "",
            status: member.status || "",
            isActive: member.isActive ? "Yes" : "No",
            citizenship: member.citizenship || "",
            ethnicity: member.ethnicity || "",
            maritalStatus: member.maritalStatus || "",
            phoneNumber: member.phoneNumber || "",
            email: member.email || "",
            employment: member.employment || "",
            healthStatus: member.healthStatus || "",
            disabilities: member.disabilities || "",
            specialNeeds: member.specialNeeds ? "Yes" : "No",
            isHeadOfHousehold: member.isHeadOfHousehold ? "Yes" : "No",
            primaryCaregiver: member.primaryCaregiver ? "Yes" : "No",
            incomeAmount: member.incomeAmount || "",
            incomeSource: member.incomeSource || "",
            medicalInsurance: member.medicalInsurance || "",
            chronicConditions: member.chronicConditions.join(", "),
            allergies: member.allergies.join(", "),
            medications: member.medications.join(", "),
          })
        })

        worksheet.getRow(1).font = { bold: true }
        worksheet.getRow(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD3D3D3" },
        }

        const reportsDir = path.join(__dirname, "../reports")
        if (!fs.existsSync(reportsDir)) {
          fs.mkdirSync(reportsDir, { recursive: true })
        }

        const filepath = path.join(reportsDir, `${filename}.xlsx`)
        await workbook.xlsx.writeFile(filepath)

        res.download(filepath, `${filename}.xlsx`, (err) => {
          if (err) throw err
          fs.unlinkSync(filepath)
        })
        break

      case "csv":
        const fields = [
          { label: "Family Case Number", value: (row) => row.family.caseNumber },
          { label: "Family Name", value: (row) => row.family.familyName },
          { label: "Region", value: (row) => row.family.region },
          { label: "District", value: (row) => row.family.district },
          { label: "City", value: (row) => row.family.city || "" },
          { label: "First Name", value: "firstName" },
          { label: "Last Name", value: "lastName" },
          { label: "Middle Name", value: "middleName" },
          { label: "Birth Date", value: (row) => (row.birthDate ? row.birthDate.toLocaleDateString() : "") },
          { label: "Age", value: (row) => calculateAge(row.birthDate) },
          { label: "Gender", value: "gender" },
          { label: "Relationship", value: "relationship" },
          { label: "Document Type", value: "documentType" },
          { label: "Document Number", value: "documentNumber" },
          {
            label: "Document Issue Date",
            value: (row) => (row.documentIssueDate ? row.documentIssueDate.toLocaleDateString() : ""),
          },
          {
            label: "Document Expiry Date",
            value: (row) => (row.documentExpiryDate ? row.documentExpiryDate.toLocaleDateString() : ""),
          },
          { label: "Registration Address", value: "registrationAddress" },
          { label: "Education", value: "education" },
          { label: "Grade", value: "grade" },
          { label: "Institution", value: "institution" },
          { label: "Course", value: "course" },
          { label: "Funding", value: "funding" },
          { label: "Meals", value: "meals" },
          { label: "Notes", value: "notes" },
          { label: "Status", value: "status" },
          { label: "Active", value: (row) => (row.isActive ? "Yes" : "No") },
          { label: "Citizenship", value: "citizenship" },
          { label: "Ethnicity", value: "ethnicity" },
          { label: "Marital Status", value: "maritalStatus" },
          { label: "Phone Number", value: "phoneNumber" },
          { label: "Email", value: "email" },
          { label: "Employment", value: "employment" },
          { label: "Health Status", value: "healthStatus" },
          { label: "Disabilities", value: "disabilities" },
          { label: "Special Needs", value: (row) => (row.specialNeeds ? "Yes" : "No") },
          { label: "Head of Household", value: (row) => (row.isHeadOfHousehold ? "Yes" : "No") },
          { label: "Primary Caregiver", value: (row) => (row.primaryCaregiver ? "Yes" : "No") },
          { label: "Income Amount", value: "incomeAmount" },
          { label: "Income Source", value: "incomeSource" },
          { label: "Medical Insurance", value: "medicalInsurance" },
          { label: "Chronic Conditions", value: (row) => row.chronicConditions.join(", ") },
          { label: "Allergies", value: (row) => row.allergies.join(", ") },
          { label: "Medications", value: (row) => row.medications.join(", ") },
        ]

        const csv = new Parser({ fields }).parse(familyMembers)
        res.header("Content-Type", "text/csv")
        res.attachment(`${filename}.csv`)
        res.send(csv)
        break

      case "json":
        res.header("Content-Type", "application/json")
        res.attachment(`${filename}.json`)
        res.send(JSON.stringify(familyMembers, null, 2))
        break

      case "pdf":
        const doc = new PDFDocument()
        res.header("Content-Type", "application/pdf")
        res.attachment(`${filename}.pdf`)

        doc.pipe(res)
        doc.fontSize(12).text("Family Members Report", { align: "center" })
        doc.moveDown()

        familyMembers.forEach((member, index) => {
          doc.text(`Member ${index + 1}`)
          doc.text(`Family: ${member.family.familyName} (${member.family.caseNumber})`)
          doc.text(`Name: ${member.lastName} ${member.firstName} ${member.middleName || ""}`)
          doc.text(`Relationship: ${member.relationship}`)
          doc.moveDown()
        })

        doc.end()
        break

      default:
        throw new Error("Unsupported format")
    }

    await prisma.reportHistory.create({
      data: {
        filename: `${filename}.${format}`,
        type: "members",
        createdById: req.user.id,
      },
    })
  } catch (error) {
    console.error("Error in generateFamilyMembersReport:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

const generateSupportReport = async (req, res) => {
  try {
    const { format = "excel", district, startDate, endDate, type, status } = req.query

    let familyFilter = {}
    if (req.familyFilter) {
      const accessibleFamilies = await prisma.family.findMany({
        where: req.familyFilter,
        select: { id: true },
      })
      const familyIds = accessibleFamilies.map((family) => family.id)
      familyFilter = { familyId: { in: familyIds } }
    }

    if (district && district !== "all") {
      const familiesInDistrict = await prisma.family.findMany({
        where: { district },
        select: { id: true },
      })
      const districtFamilyIds = familiesInDistrict.map((f) => f.id)
      familyFilter.familyId = { in: districtFamilyIds }
    }

    let dateFilter = {}
    if (startDate || endDate) {
      dateFilter = {
        startDate: {},
      }
      if (startDate) dateFilter.startDate.gte = new Date(startDate)
      if (endDate) dateFilter.startDate.lte = new Date(endDate)
    }

    const combinedFilter = {
      ...familyFilter,
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
      ...dateFilter,
    }

    const supportMeasures = await prisma.supportMeasure.findMany({
      where: combinedFilter,
      include: {
        family: {
          select: {
            caseNumber: true,
            familyName: true,
            region: true,
            district: true,
            city: true,
          },
        },
        member: {
          select: {
            firstName: true,
            lastName: true,
            middleName: true,
          },
        },
        createdBy: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: { startDate: "desc" },
    })

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const filename = `support-measures-report-${timestamp}`

    switch (format.toLowerCase()) {
      case "excel":
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet("Support Measures Report")

        worksheet.columns = [
          { header: "Family Case Number", key: "caseNumber", width: 20 },
          { header: "Family Name", key: "familyName", width: 20 },
          { header: "Region", key: "region", width: 15 },
          { header: "District", key: "district", width: 15 },
          { header: "City", key: "city", width: 15 },
          { header: "Member", key: "member", width: 25 },
          { header: "Type", key: "type", width: 15 },
          { header: "Description", key: "description", width: 30 },
          { header: "Category", key: "category", width: 15 },
          { header: "Start Date", key: "startDate", width: 15 },
          { header: "End Date", key: "endDate", width: 15 },
          { header: "Status", key: "status", width: 15 },
          { header: "Provider", key: "provider", width: 20 },
          { header: "Result", key: "result", width: 30 },
          { header: "Notes", key: "notes", width: 30 },
          { header: "Created By", key: "createdBy", width: 20 },
          { header: "Created At", key: "createdAt", width: 15 },
          { header: "Priority", key: "priority", width: 15 },
          { header: "Cost", key: "cost", width: 15 },
          { header: "Funding Source", key: "fundingSource", width: 20 },
          { header: "Contact Person", key: "contactPerson", width: 20 },
          { header: "Contact Phone", key: "contactPhone", width: 15 },
          { header: "Contact Email", key: "contactEmail", width: 20 },
          { header: "Frequency", key: "frequency", width: 15 },
          { header: "Location", key: "location", width: 20 },
          { header: "Follow Up Date", key: "followUpDate", width: 15 },
          { header: "Evaluation Date", key: "evaluationDate", width: 15 },
          { header: "Effectiveness", key: "effectiveness", width: 15 },
        ]

        supportMeasures.forEach((support) => {
          const memberName = support.member
            ? `${support.member.lastName} ${support.member.firstName} ${support.member.middleName || ""}`.trim()
            : "Entire family"

          worksheet.addRow({
            caseNumber: support.family.caseNumber,
            familyName: support.family.familyName,
            region: support.family.region,
            district: support.family.district,
            city: support.family.city || "",
            member: memberName,
            type: support.type,
            description: support.description,
            category: support.category || "",
            startDate: support.startDate.toLocaleDateString(),
            endDate: support.endDate ? support.endDate.toLocaleDateString() : "",
            status: support.status,
            provider: support.provider || "",
            result: support.result || "",
            notes: support.notes || "",
            createdBy: support.createdBy.fullName,
            createdAt: new Date(support.createdAt).toLocaleDateString(),
            priority: support.priority || "",
            cost: support.cost || "",
            fundingSource: support.fundingSource || "",
            contactPerson: support.contactPerson || "",
            contactPhone: support.contactPhone || "",
            contactEmail: support.contactEmail || "",
            frequency: support.frequency || "",
            location: support.location || "",
            followUpDate: support.followUpDate ? support.followUpDate.toLocaleDateString() : "",
            evaluationDate: support.evaluationDate ? support.evaluationDate.toLocaleDateString() : "",
            effectiveness: support.effectiveness || "",
          })
        })

        worksheet.getRow(1).font = { bold: true }
        worksheet.getRow(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD3D3D3" },
        }

        const reportsDir = path.join(__dirname, "../reports")
        if (!fs.existsSync(reportsDir)) {
          fs.mkdirSync(reportsDir, { recursive: true })
        }

        const filepath = path.join(reportsDir, `${filename}.xlsx`)
        await workbook.xlsx.writeFile(filepath)

        res.download(filepath, `${filename}.xlsx`, (err) => {
          if (err) throw err
          fs.unlinkSync(filepath)
        })
        break

      case "csv":
        const fields = [
          { label: "Family Case Number", value: (row) => row.family.caseNumber },
          { label: "Family Name", value: (row) => row.family.familyName },
          { label: "Region", value: (row) => row.family.region },
          { label: "District", value: (row) => row.family.district },
          { label: "City", value: (row) => row.family.city || "" },
          {
            label: "Member",
            value: (row) =>
              row.member
                ? `${row.member.lastName} ${row.member.firstName} ${row.member.middleName || ""}`.trim()
                : "Entire family",
          },
          { label: "Type", value: "type" },
          { label: "Description", value: "description" },
          { label: "Category", value: "category" },
          { label: "Start Date", value: (row) => row.startDate.toLocaleDateString() },
          { label: "End Date", value: (row) => (row.endDate ? row.endDate.toLocaleDateString() : "") },
          { label: "Status", value: "status" },
          { label: "Provider", value: "provider" },
          { label: "Result", value: "result" },
          { label: "Notes", value: "notes" },
          { label: "Created By", value: (row) => row.createdBy.fullName },
          { label: "Created At", value: (row) => new Date(row.createdAt).toLocaleDateString() },
          { label: "Priority", value: "priority" },
          { label: "Cost", value: "cost" },
          { label: "Funding Source", value: "fundingSource" },
          { label: "Contact Person", value: "contactPerson" },
          { label: "Contact Phone", value: "contactPhone" },
          { label: "Contact Email", value: "contactEmail" },
          { label: "Frequency", value: "frequency" },
          { label: "Location", value: "location" },
          { label: "Follow Up Date", value: (row) => (row.followUpDate ? row.followUpDate.toLocaleDateString() : "") },
          {
            label: "Evaluation Date",
            value: (row) => (row.evaluationDate ? row.evaluationDate.toLocaleDateString() : ""),
          },
          { label: "Effectiveness", value: "effectiveness" },
        ]

        const csv = new Parser({ fields }).parse(supportMeasures)
        res.header("Content-Type", "text/csv")
        res.attachment(`${filename}.csv`)
        res.send(csv)
        break

      case "json":
        res.header("Content-Type", "application/json")
        res.attachment(`${filename}.json`)
        res.send(JSON.stringify(supportMeasures, null, 2))
        break

      case "pdf":
        const doc = new PDFDocument()
        res.header("Content-Type", "application/pdf")
        res.attachment(`${filename}.pdf`)

        doc.pipe(res)
        doc.fontSize(12).text("Support Measures Report", { align: "center" })
        doc.moveDown()

        supportMeasures.forEach((support, index) => {
          const memberName = support.member
            ? `${support.member.lastName} ${support.member.firstName} ${support.member.middleName || ""}`.trim()
            : "Entire family"
          doc.text(`Support Measure ${index + 1}`)
          doc.text(`Family: ${support.family.familyName} (${support.family.caseNumber})`)
          doc.text(`Member: ${memberName}`)
          doc.text(`Type: ${support.type}`)
          doc.text(`Description: ${support.description}`)
          doc.moveDown()
        })

        doc.end()
        break

      default:
        throw new Error("Unsupported format")
    }

    await prisma.reportHistory.create({
      data: {
        filename: `${filename}.${format}`,
        type: "support",
        createdById: req.user.id,
      },
    })
  } catch (error) {
    console.error("Error in generateSupportReport:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

const generateAnalyticsReport = async (req, res) => {
  try {
    const { format = "excel", district, startDate, endDate } = req.query
    const filter = req.familyFilter || {}

    if (district && district !== "all") filter.district = district
    if (startDate || endDate) {
      filter.registrationDate = {}
      if (startDate) filter.registrationDate.gte = new Date(startDate)
      if (endDate) filter.registrationDate.lte = new Date(endDate)
    }

    let familyFilter = {}
    if (req.familyFilter) {
      const accessibleFamilies = await prisma.family.findMany({
        where: req.familyFilter,
        select: { id: true },
      })
      const familyIds = accessibleFamilies.map((family) => family.id)
      familyFilter = { familyId: { in: familyIds } }
    }

    if (district && district !== "all") {
      const familiesInDistrict = await prisma.family.findMany({
        where: { district },
        select: { id: true },
      })
      const districtFamilyIds = familiesInDistrict.map((f) => f.id)
      familyFilter.familyId = { in: districtFamilyIds }
    }

    const totalFamilies = await prisma.family.count({ where: filter })
    const familiesByRegion = await prisma.family.groupBy({
      by: ["region"],
      where: filter,
      _count: true,
    })
    const familiesByDistrict = await prisma.family.groupBy({
      by: ["district"],
      where: filter,
      _count: true,
    })
    const familiesByRiskLevel = await prisma.family.groupBy({
      by: ["riskLevel"],
      where: filter,
      _count: true,
    })
    const familiesByStatus = await prisma.family.groupBy({
      by: ["status"],
      where: filter,
      _count: true,
    })
    const familiesByFamilyType = await prisma.family.groupBy({
      by: ["familyType"],
      where: filter,
      _count: true,
    })
    const familiesByHousingType = await prisma.family.groupBy({
      by: ["housingType"],
      where: filter,
      _count: true,
    })

    const totalFamilyMembers = await prisma.familyMember.count({ where: familyFilter })
    const membersByGender = await prisma.familyMember.groupBy({
      by: ["gender"],
      where: familyFilter,
      _count: true,
    })
    const membersByRelationship = await prisma.familyMember.groupBy({
      by: ["relationship"],
      where: familyFilter,
      _count: true,
    })
    const membersByEducation = await prisma.familyMember.groupBy({
      by: ["education"],
      where: familyFilter,
      _count: true,
    })

    const totalSupportMeasures = await prisma.supportMeasure.count({ where: familyFilter })
    const supportMeasuresByType = await prisma.supportMeasure.groupBy({
      by: ["type"],
      where: familyFilter,
      _count: true,
    })
    const supportMeasuresByStatus = await prisma.supportMeasure.groupBy({
      by: ["status"],
      where: familyFilter,
      _count: true,
    })
    const supportMeasuresByCategory = await prisma.supportMeasure.groupBy({
      by: ["category"],
      where: familyFilter,
      _count: true,
    })

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const filename = `analytics-report-${timestamp}`

    switch (format.toLowerCase()) {
      case "excel":
        const workbook = new ExcelJS.Workbook()

        // Families by Region
        const regionWorksheet = workbook.addWorksheet("Families by Region")
        regionWorksheet.columns = [
          { header: "Region", key: "region", width: 20 },
          { header: "Count", key: "count", width: 10 },
          { header: "Percentage", key: "percentage", width: 15 },
        ]
        familiesByRegion.forEach((item) => {
          regionWorksheet.addRow({
            region: item.region,
            count: item._count,
            percentage: ((item._count / totalFamilies) * 100).toFixed(2) + "%",
          })
        })

        // Families by District
        const districtWorksheet = workbook.addWorksheet("Families by District")
        districtWorksheet.columns = [
          { header: "District", key: "district", width: 20 },
          { header: "Count", key: "count", width: 10 },
          { header: "Percentage", key: "percentage", width: 15 },
        ]
        familiesByDistrict.forEach((item) => {
          districtWorksheet.addRow({
            district: item.district,
            count: item._count,
            percentage: ((item._count / totalFamilies) * 100).toFixed(2) + "%",
          })
        })

        // Families by Risk Level
        const riskWorksheet = workbook.addWorksheet("Families by Risk Level")
        riskWorksheet.columns = [
          { header: "Risk Level", key: "riskLevel", width: 20 },
          { header: "Count", key: "count", width: 10 },
          { header: "Percentage", key: "percentage", width: 15 },
        ]
        familiesByRiskLevel.forEach((item) => {
          riskWorksheet.addRow({
            riskLevel: item.riskLevel,
            count: item._count,
            percentage: ((item._count / totalFamilies) * 100).toFixed(2) + "%",
          })
        })

        // Families by Status
        const statusWorksheet = workbook.addWorksheet("Families by Status")
        statusWorksheet.columns = [
          { header: "Status", key: "status", width: 20 },
          { header: "Count", key: "count", width: 10 },
          { header: "Percentage", key: "percentage", width: 15 },
        ]
        familiesByStatus.forEach((item) => {
          statusWorksheet.addRow({
            status: item.status,
            count: item._count,
            percentage: ((item._count / totalFamilies) * 100).toFixed(2) + "%",
          })
        })

        // Families by Family Type
        const familyTypeWorksheet = workbook.addWorksheet("Families by Family Type")
        familyTypeWorksheet.columns = [
          { header: "Family Type", key: "familyType", width: 20 },
          { header: "Count", key: "count", width: 10 },
          { header: "Percentage", key: "percentage", width: 15 },
        ]
        familiesByFamilyType.forEach((item) => {
          familyTypeWorksheet.addRow({
            familyType: item.familyType || "Not Specified",
            count: item._count,
            percentage: ((item._count / totalFamilies) * 100).toFixed(2) + "%",
          })
        })

        // Families by Housing Type
        const housingTypeWorksheet = workbook.addWorksheet("Families by Housing Type")
        housingTypeWorksheet.columns = [
          { header: "Housing Type", key: "housingType", width: 20 },
          { header: "Count", key: "count", width: 10 },
          { header: "Percentage", key: "percentage", width: 15 },
        ]
        familiesByHousingType.forEach((item) => {
          housingTypeWorksheet.addRow({
            housingType: item.housingType || "Not Specified",
            count: item._count,
            percentage: ((item._count / totalFamilies) * 100).toFixed(2) + "%",
          })
        })

        // Members by Gender
        const genderWorksheet = workbook.addWorksheet("Members by Gender")
        genderWorksheet.columns = [
          { header: "Gender", key: "gender", width: 20 },
          { header: "Count", key: "count", width: 10 },
          { header: "Percentage", key: "percentage", width: 15 },
        ]
        membersByGender.forEach((item) => {
          genderWorksheet.addRow({
            gender: item.gender || "Not Specified",
            count: item._count,
            percentage: ((item._count / totalFamilyMembers) * 100).toFixed(2) + "%",
          })
        })

        // Members by Relationship
        const relationshipWorksheet = workbook.addWorksheet("Members by Relationship")
        relationshipWorksheet.columns = [
          { header: "Relationship", key: "relationship", width: 20 },
          { header: "Count", key: "count", width: 10 },
          { header: "Percentage", key: "percentage", width: 15 },
        ]
        membersByRelationship.forEach((item) => {
          relationshipWorksheet.addRow({
            relationship: item.relationship,
            count: item._count,
            percentage: ((item._count / totalFamilyMembers) * 100).toFixed(2) + "%",
          })
        })

        // Members by Education
        const educationWorksheet = workbook.addWorksheet("Members by Education")
        educationWorksheet.columns = [
          { header: "Education", key: "education", width: 20 },
          { header: "Count", key: "count", width: 10 },
          { header: "Percentage", key: "percentage", width: 15 },
        ]
        membersByEducation.forEach((item) => {
          educationWorksheet.addRow({
            education: item.education || "Not Specified",
            count: item._count,
            percentage: ((item._count / totalFamilyMembers) * 100).toFixed(2) + "%",
          })
        })

        // Support by Type
        const supportTypeWorksheet = workbook.addWorksheet("Support by Type")
        supportTypeWorksheet.columns = [
          { header: "Type", key: "type", width: 20 },
          { header: "Count", key: "count", width: 10 },
          { header: "Percentage", key: "percentage", width: 15 },
        ]
        supportMeasuresByType.forEach((item) => {
          supportTypeWorksheet.addRow({
            type: item.type,
            count: item._count,
            percentage: ((item._count / totalSupportMeasures) * 100).toFixed(2) + "%",
          })
        })

        // Support by Status
        const supportStatusWorksheet = workbook.addWorksheet("Support by Status")
        supportStatusWorksheet.columns = [
          { header: "Status", key: "status", width: 20 },
          { header: "Count", key: "count", width: 10 },
          { header: "Percentage", key: "percentage", width: 15 },
        ]
        supportMeasuresByStatus.forEach((item) => {
          supportStatusWorksheet.addRow({
            status: item.status,
            count: item._count,
            percentage: ((item._count / totalSupportMeasures) * 100).toFixed(2) + "%",
          })
        })

        // Support by Category
        const supportCategoryWorksheet = workbook.addWorksheet("Support by Category")
        supportCategoryWorksheet.columns = [
          { header: "Category", key: "category", width: 20 },
          { header: "Count", key: "count", width: 10 },
          { header: "Percentage", key: "percentage", width: 15 },
        ]
        supportMeasuresByCategory.forEach((item) => {
          supportCategoryWorksheet.addRow({
            category: item.category || "Not Specified",
            count: item._count,
            percentage: ((item._count / totalSupportMeasures) * 100).toFixed(2) + "%",
          })
        })

        // Summary
        const summaryWorksheet = workbook.addWorksheet("Summary")
        summaryWorksheet.columns = [
          { header: "Metric", key: "metric", width: 30 },
          { header: "Value", key: "value", width: 15 },
        ]
        summaryWorksheet.addRow({ metric: "Total Families", value: totalFamilies })
        summaryWorksheet.addRow({ metric: "Total Family Members", value: totalFamilyMembers })
        summaryWorksheet.addRow({ metric: "Total Support Measures", value: totalSupportMeasures })
        summaryWorksheet.addRow({
          metric: "Average Members per Family",
          value: totalFamilies ? (totalFamilyMembers / totalFamilies).toFixed(2) : 0,
        })
        summaryWorksheet.addRow({
          metric: "Average Support Measures per Family",
          value: totalFamilies ? (totalSupportMeasures / totalFamilies).toFixed(2) : 0,
        })

        workbook.worksheets.forEach((sheet) => {
          sheet.getRow(1).font = { bold: true }
          sheet.getRow(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFD3D3D3" },
          }
        })

        const reportsDir = path.join(__dirname, "../reports")
        if (!fs.existsSync(reportsDir)) {
          fs.mkdirSync(reportsDir, { recursive: true })
        }

        const filepath = path.join(reportsDir, `${filename}.xlsx`)
        await workbook.xlsx.writeFile(filepath)

        res.download(filepath, `${filename}.xlsx`, (err) => {
          if (err) throw err
          fs.unlinkSync(filepath)
        })
        break

      case "csv":
        const summaryData = [
          { metric: "Total Families", value: totalFamilies },
          { metric: "Total Family Members", value: totalFamilyMembers },
          { metric: "Total Support Measures", value: totalSupportMeasures },
          {
            metric: "Average Members per Family",
            value: totalFamilies ? (totalFamilyMembers / totalFamilies).toFixed(2) : 0,
          },
          {
            metric: "Average Support Measures per Family",
            value: totalFamilies ? (totalSupportMeasures / totalFamilies).toFixed(2) : 0,
          },
        ]
        const fields = [
          { label: "Metric", value: "metric" },
          { label: "Value", value: "value" },
        ]
        const csv = new Parser({ fields }).parse(summaryData)
        res.header("Content-Type", "text/csv")
        res.attachment(`${filename}.csv`)
        res.send(csv)
        break

      case "json":
        const analyticsData = {
          totalFamilies,
          familiesByRegion,
          familiesByDistrict,
          familiesByRiskLevel,
          familiesByStatus,
          familiesByFamilyType,
          familiesByHousingType,
          totalFamilyMembers,
          membersByGender,
          membersByRelationship,
          membersByEducation,
          totalSupportMeasures,
          supportMeasuresByType,
          supportMeasuresByStatus,
          supportMeasuresByCategory,
          averages: {
            membersPerFamily: totalFamilies ? (totalFamilyMembers / totalFamilies).toFixed(2) : 0,
            supportMeasuresPerFamily: totalFamilies ? (totalSupportMeasures / totalFamilies).toFixed(2) : 0,
          },
        }
        res.header("Content-Type", "application/json")
        res.attachment(`${filename}.json`)
        res.send(JSON.stringify(analyticsData, null, 2))
        break

      case "pdf":
        const doc = new PDFDocument()
        res.header("Content-Type", "application/pdf")
        res.attachment(`${filename}.pdf`)

        doc.pipe(res)
        doc.fontSize(12).text("Analytics Report", { align: "center" })
        doc.moveDown()
        doc.text(`Total Families: ${totalFamilies}`)
        doc.text(`Total Family Members: ${totalFamilyMembers}`)
        doc.text(`Total Support Measures: ${totalSupportMeasures}`)
        doc.moveDown()
        doc.text("Families by Region:")
        familiesByRegion.forEach((item) => {
          doc.text(`${item.region}: ${item._count} (${((item._count / totalFamilies) * 100).toFixed(2)}%)`)
        })
        doc.moveDown()
        doc.text("Families by District:")
        familiesByDistrict.forEach((item) => {
          doc.text(`${item.district}: ${item._count} (${((item._count / totalFamilies) * 100).toFixed(2)}%)`)
        })

        doc.end()
        break

      default:
        throw new Error("Unsupported format")
    }

    await prisma.reportHistory.create({
      data: {
        filename: `${filename}.${format}`,
        type: "analytics",
        createdById: req.user.id,
      },
    })
  } catch (error) {
    console.error("Error in generateAnalyticsReport:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

module.exports = {
  generateFamiliesReport,
  generateFamilyMembersReport,
  generateSupportReport,
  generateAnalyticsReport,
}
