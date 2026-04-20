import * as XLSX from "xlsx"
import type { ExportData, ExportRow } from "@/types/exports/pdfExport"

export const exportToExcel = (data: ExportData) => {
  // 🧠 transformar rows según columnas
  const formattedRows = data.rows.map(row => {
    const newRow: ExportRow = {}

    data.columns.forEach(col => {
      let value = row[col.dataKey]

      if (col.dataKey === "firma_ingreso") {
        value = typeof value === "string" && value.startsWith("data:image")
          ? "Firma registrada"
          : value
      }

      newRow[col.header] = value ?? ""
    })

    return newRow
  })

  // 📄 hoja
  const worksheet = XLSX.utils.json_to_sheet(formattedRows)
  worksheet['!cols'] = data.columns.map(() => ({ wch: 20 }))
  // 📘 libro
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte")

  // 💾 descargar
  XLSX.writeFile(
    workbook,
    `${data.title.toLowerCase().replace(/ /g, "_")}.xlsx`
  )
}
