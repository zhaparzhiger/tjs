const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const ExcelJS = require("exceljs")
const path = require("path")
const fs = require("fs")

// Generate families report
const generateFamiliesReport = async (req, res) => {
  try {
    // Apply filter based on user's access level (set by middleware)
    const filter = req.familyFilter || {}

    // Additional filters from query params
    const { region, district, city, status, riskLevel, startDate, endDate } = req.query

    let dateFilter = {}
    if (startDate && endDate) {
      dateFilter = {
        registrationDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }
    } else if (startDate) {
      dateFilter = {
        registrationDate: {
          gte: new Date(startDate),
        },
      }
    } else if (endDate) {
      dateFilter = {
        registrationDate: {
          lte: new Date(endDate),
        },
      }
    }

    // Combine all filters
    const combinedFilter = {
      ...filter,
      ...(region ? { region } : {}),
      ...(district ? { district } : {}),
      ...(city ? { city } : {}),
      ...(status ? { status } : {}),
      ...(riskLevel ? { riskLevel } : {}),
      ...dateFilter,
    }

    // Get families with filters
    const families = await prisma.family.findMany({
      where: combinedFilter,
      include: {
        _count: {
          select: {
            members: true,
            supportMeasures: true,
          },
        },
      },
      orderBy: {
        registrationDate: "desc",
      },
    })

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Families Report")

    // Add headers
    worksheet.columns = [
      { header: "Case Number", key: "caseNumber", width: 15 },
      { header: "Family Name", key: "familyName", width: 20 },
      { header: "Region", key: "region", width: 15 },
      { header: "District", key: "district", width: 15 },
      { header: "City", key: "city", width: 15 },
      { header: "Address", key: "address", width: 30 },
      { header: "Status", key: "status", width: 15 },
      { header: "Risk Level", key: "riskLevel", width: 15 },
      { header: "Registration Date", key: "registrationDate", width: 20 },
      { header: "Last Update", key: "lastUpdate", width: 20 },
      { header: "Members Count", key: "membersCount", width: 15 },
      { header: "Support Measures Count", key: "supportCount", width: 20 },
      { header: "Active", key: "isActive", width: 10 },
      { header: "Inactive Reason", key: "inactiveReason", width: 30 },
    ]

    // Add rows
    families.forEach((family) => {
      worksheet.addRow({
        caseNumber: family.caseNumber,
        familyName: family.familyName,
        region: family.region,
        district: family.district,
        city: family.city || "",
        address: family.address,
        status: family.status,
        riskLevel: family.riskLevel,
        registrationDate: family.registrationDate.toLocaleDateString(),
        lastUpdate: family.lastUpdate.toLocaleDateString(),
        membersCount: family._count.members,
        supportCount: family._count.supportMeasures,
        isActive: family.isActive ? "Yes" : "No",
        inactiveReason: family.inactiveReason || "",
      })
    })

    // Style the header row
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD3D3D3" },
    }

    // Create directory for reports if it doesn't exist
    const reportsDir = path.join(__dirname, "../reports")
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const filename = `families-report-${timestamp}.xlsx`
    const filepath = path.join(reportsDir, filename)

    // Write to file
    await workbook.xlsx.writeFile(filepath)

    // Send file to client
    res.download(filepath, filename, (err) => {
      if (err) {
        console.error("Error sending file:", err)
        return res.status(500).json({ message: "Error sending file" })
      }

      // Delete file after sending
      fs.unlinkSync(filepath)
    })
  } catch (error) {
    console.error("Error in generateFamiliesReport controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Generate family members report
const generateFamilyMembersReport = async (req, res) => {
  try {
    // Get families user has access to
    let familyFilter = {}
    if (req.familyFilter) {
      const accessibleFamilies = await prisma.family.findMany({
        where: req.familyFilter,
        select: { id: true },
      })

      const familyIds = accessibleFamilies.map((family) => family.id)
      familyFilter = { familyId: { in: familyIds } }
    }

    // Additional filters from query params
    const { relationship, gender, ageFrom, ageTo } = req.query

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

    // Combine all filters
    const combinedFilter = {
      ...familyFilter,
      ...(relationship ? { relationship } : {}),
      ...(gender ? { gender } : {}),
      ...(Object.keys(ageFilter).length > 0 ? { birthDate: ageFilter } : {}),
    }

    // Get family members with filters
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

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Family Members Report")

    // Add headers
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
      { header: "Education", key: "education", width: 15 },
      { header: "Employment", key: "employment", width: 15 },
      { header: "Health Status", key: "healthStatus", width: 15 },
      { header: "Disabilities", key: "disabilities", width: 20 },
      { header: "Special Needs", key: "specialNeeds", width: 15 },
      { header: "Active", key: "isActive", width: 10 },
    ]

    // Calculate age function
    const calculateAge = (birthDate) => {
      const today = new Date()
      const birth = new Date(birthDate)
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
      }

      return age
    }

    // Add rows
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
        birthDate: member.birthDate.toLocaleDateString(),
        age: calculateAge(member.birthDate),
        gender: member.gender,
        relationship: member.relationship,
        documentType: member.documentType || "",
        documentNumber: member.documentNumber || "",
        education: member.education || "",
        employment: member.employment || "",
        healthStatus: member.healthStatus || "",
        disabilities: member.disabilities || "",
        specialNeeds: member.specialNeeds ? "Yes" : "No",
        isActive: member.isActive ? "Yes" : "No",
      })
    })

    // Style the header row
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD3D3D3" },
    }

    // Create directory for reports if it doesn't exist
    const reportsDir = path.join(__dirname, "../reports")
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const filename = `family-members-report-${timestamp}.xlsx`
    const filepath = path.join(reportsDir, filename)

    // Write to file
    await workbook.xlsx.writeFile(filepath)

    // Send file to client
    res.download(filepath, filename, (err) => {
      if (err) {
        console.error("Error sending file:", err)
        return res.status(500).json({ message: "Error sending file" })
      }

      // Delete file after sending
      fs.unlinkSync(filepath)
    })
  } catch (error) {
    console.error("Error in generateFamilyMembersReport controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Generate support measures report
const generateSupportReport = async (req, res) => {
  try {
    // Get families user has access to
    let familyFilter = {}
    if (req.familyFilter) {
      const accessibleFamilies = await prisma.family.findMany({
        where: req.familyFilter,
        select: { id: true },
      })

      const familyIds = accessibleFamilies.map((family) => family.id)
      familyFilter = { familyId: { in: familyIds } }
    }

    // Additional filters from query params
    const { type, status, startDate, endDate } = req.query

    let dateFilter = {}
    if (startDate && endDate) {
      dateFilter = {
        startDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }
    } else if (startDate) {
      dateFilter = {
        startDate: {
          gte: new Date(startDate),
        },
      }
    } else if (endDate) {
      dateFilter = {
        startDate: {
          lte: new Date(endDate),
        },
      }
    }

    // Combine all filters
    const combinedFilter = {
      ...familyFilter,
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
      ...dateFilter,
    }

    // Get support measures with filters
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
      orderBy: {
        startDate: "desc",
      },
    })

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Support Measures Report")

    // Add headers
    worksheet.columns = [
      { header: "Family Case Number", key: "caseNumber", width: 20 },
      { header: "Family Name", key: "familyName", width: 20 },
      { header: "Region", key: "region", width: 15 },
      { header: "District", key: "district", width: 15 },
      { header: "City", key: "city", width: 15 },
      { header: "Member", key: "member", width: 25 },
      { header: "Type", key: "type", width: 15 },
      { header: "Description", key: "description", width: 30 },
      { header: "Start Date", key: "startDate", width: 15 },
      { header: "End Date", key: "endDate", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Provider", key: "provider", width: 20 },
      { header: "Result", key: "result", width: 30 },
      { header: "Created By", key: "createdBy", width: 20 },
      { header: "Created At", key: "createdAt", width: 15 },
    ]

    // Add rows
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
        startDate: support.startDate.toLocaleDateString(),
        endDate: support.endDate ? support.endDate.toLocaleDateString() : "",
        status: support.status,
        provider: support.provider,
        result: support.result || "",
        createdBy: support.createdBy.fullName,
        createdAt: new Date(support.createdAt).toLocaleDateString(),
      })
    })

    // Style the header row
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD3D3D3" },
    }

    // Create directory for reports if it doesn't exist
    const reportsDir = path.join(__dirname, "../reports")
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const filename = `support-measures-report-${timestamp}.xlsx`
    const filepath = path.join(reportsDir, filename)

    // Write to file
    await workbook.xlsx.writeFile(filepath)

    // Send file to client
    res.download(filepath, filename, (err) => {
      if (err) {
        console.error("Error sending file:", err)
        return res.status(500).json({ message: "Error sending file" })
      }

      // Delete file after sending
      fs.unlinkSync(filepath)
    })
  } catch (error) {
    console.error("Error in generateSupportReport controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Generate analytics report
const generateAnalyticsReport = async (req, res) => {
  try {
    // Apply filter based on user's access level (set by middleware)
    const filter = req.familyFilter || {}

    // Get families user has access to
    let familyFilter = {}
    if (req.familyFilter) {
      const accessibleFamilies = await prisma.family.findMany({
        where: req.familyFilter,
        select: { id: true },
      })

      const familyIds = accessibleFamilies.map((family) => family.id)
      familyFilter = { familyId: { in: familyIds } }
    }

    // Get statistics
    const totalFamilies = await prisma.family.count({
      where: filter,
    })

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

    const totalFamilyMembers = await prisma.familyMember.count({
      where: familyFilter,
    })

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

    const totalSupportMeasures = await prisma.supportMeasure.count({
      where: familyFilter,
    })

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

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook()

    // Families by Region worksheet
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

    // Families by District worksheet
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

    // Families by Risk Level worksheet
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

    // Families by Status worksheet
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

    // Members by Gender worksheet
    const genderWorksheet = workbook.addWorksheet("Members by Gender")
    genderWorksheet.columns = [
      { header: "Gender", key: "gender", width: 20 },
      { header: "Count", key: "count", width: 10 },
      { header: "Percentage", key: "percentage", width: 15 },
    ]

    membersByGender.forEach((item) => {
      genderWorksheet.addRow({
        gender: item.gender,
        count: item._count,
        percentage: ((item._count / totalFamilyMembers) * 100).toFixed(2) + "%",
      })
    })

    // Members by Relationship worksheet
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

    // Support by Type worksheet
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

    // Support by Status worksheet
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

    // Summary worksheet
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
      value: (totalFamilyMembers / totalFamilies).toFixed(2),
    })
    summaryWorksheet.addRow({
      metric: "Average Support Measures per Family",
      value: (totalSupportMeasures / totalFamilies).toFixed(2),
    })

    // Style all header rows
    workbook.worksheets.forEach((sheet) => {
      sheet.getRow(1).font = { bold: true }
      sheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD3D3D3" },
      }
    })

    // Create directory for reports if it doesn't exist
    const reportsDir = path.join(__dirname, "../reports")
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const filename = `analytics-report-${timestamp}.xlsx`
    const filepath = path.join(reportsDir, filename)

    // Write to file
    await workbook.xlsx.writeFile(filepath)

    // Send file to client
    res.download(filepath, filename, (err) => {
      if (err) {
        console.error("Error sending file:", err)
        return res.status(500).json({ message: "Error sending file" })
      }

      // Delete file after sending
      fs.unlinkSync(filepath)
    })
  } catch (error) {
    console.error("Error in generateAnalyticsReport controller:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  generateFamiliesReport,
  generateFamilyMembersReport,
  generateSupportReport,
  generateAnalyticsReport,
}
