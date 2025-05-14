// Имитация экспорта в Excel
export function exportToExcel(data: any[], fileName: string): void {
  // Создаем базовый Excel XML
  const excelContent = `
<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Sheet1">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">ID</Data></Cell>
    <Cell><Data ss:Type="String">Название</Data></Cell>
    <Cell><Data ss:Type="String">Дата</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`

  // Создаем Blob с Excel-содержимым
  const blob = new Blob([excelContent], { type: "application/vnd.ms-excel" })
  const url = URL.createObjectURL(blob)

  // Создаем ссылку для скачивания
  const a = document.createElement("a")
  a.href = url
  a.download = `${fileName}.xls`
  document.body.appendChild(a)
  a.click()

  // Очищаем ресурсы
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 0)
}

// Имитация экспорта в PDF
export function exportToPdf(data: any, fileName: string): void {
  // В реальном приложении здесь был бы код для создания PDF-файла
  // Для имитации просто создаем текстовый файл
  const textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2)
  const blob = new Blob([textContent], { type: "text/plain" })
  const url = URL.createObjectURL(blob)

  // Создаем ссылку для скачивания
  const a = document.createElement("a")
  a.href = url
  a.download = `${fileName}.txt`
  document.body.appendChild(a)
  a.click()

  // Очищаем ресурсы
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 0)
}

// Имитация загрузки файла
export function simulateFileUpload(callback: (file: File) => void): void {
  // Создаем input для выбора файла
  const input = document.createElement("input")
  input.type = "file"
  input.accept = ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"

  // Обработчик выбора файла
  input.onchange = (e) => {
    const files = (e.target as HTMLInputElement).files
    if (files && files.length > 0) {
      callback(files[0])
    }
  }

  // Имитируем клик по input
  input.click()
}

// Функция для скачивания пустого Excel-файла
export function downloadEmptyExcel(fileName: string): void {
  exportToExcel([], fileName)
}

// Функция для скачивания пустого PDF-файла
export function downloadEmptyPdf(fileName: string): void {
  exportToPdf("Пустой PDF-документ", fileName)
}
