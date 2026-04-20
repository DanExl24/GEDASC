import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { RecordReportFilters, ReportType } from "@/types/recordReport.types"
import { API_URL } from '@/config/network'
import type { ExportData, ExportRow } from "@/types/exports/pdfExport"
import { useNotifications } from '@/composables/useNotifications';
const {addNotification} = useNotifications()
const API = API_URL

const isBase64Image = (value: unknown): value is string =>
  typeof value === "string" && value.startsWith("data:image")

const mapToBackendPayload = (filters: RecordReportFilters, type: ReportType) => {
  const base = {
    date: filters.date,
    program: filters.program,
    reportType: type
  }

  if (type === 'assets') {
    return {
      ...base,
      search: filters.searchRegister,
      tipoMaquina:
        filters.assetView === 'computers'
          ? 'pc'
          : filters.assetView === 'vehicles'
            ? 'vh'
            : undefined,
    }
  }

  return {
    ...base,
    search: filters.searchRegister,
    entryStatus : filters.entryStatus,
    reportType : type
  }
}

type JsPDFWithAutoTable = jsPDF & {
  lastAutoTable?: {
    finalY: number
  }
}

export const useExportPdf = ( getFilters: () => RecordReportFilters, selectedReport: { type: ReportType }) => {

const submitData = async (): Promise<ExportData> => {
  const payload = mapToBackendPayload(getFilters(), selectedReport.type)

  const endpoint =
    selectedReport.type === 'assets'
      ? `${API}/api/historico/historialMaquinas`
      : `${API}/api/historico/historialGeneral`

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        addNotification('Error al generar la exportación', 'error')
        const text = await response.text()
        throw new Error(text)
      }

      return await response.json()

    } catch (error) {
      addNotification('No se pudo conectar con el servidor', 'error')
      throw error
  }
}

  const generatePDF = async (data: ExportData) => {

    const doc = new jsPDF() as JsPDFWithAutoTable

    const maxWidth = 180 // ancho útil de la página
    let fontSize = 16

    doc.setFontSize(fontSize)

    // reduce tamaño hasta que quepa
    while (doc.getTextWidth(data.title) > maxWidth && fontSize > 10) {
      fontSize--
      doc.setFontSize(fontSize)
    }

    doc.text(data.title, 14, 15)

    const today = new Date()

    const formattedDate = today.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    doc.setFontSize(10)
    doc.text(`Fecha: ${formattedDate}`, 14, 22)

    const columns = data.columns

    // 🔥 IMPORTANTE: en la tabla NO renderizamos la firma como texto
    const rows = data.rows.map((row: ExportRow) =>
      columns.map(col => {
        if (col.dataKey === "firma_ingreso") {
          return isBase64Image(row.firma_ingreso)
            ? "" // imagen → se renderiza aparte
            : row.firma_ingreso ?? ""
        }
        return row[col.dataKey] ?? ""
      })
    )

    autoTable(doc, {
      startY: 30,
      head: [columns.map(col => col.header)],
      body: rows,
      headStyles: {
        fillColor: [16, 185, 129], // verde (RGB)
        textColor: [255, 255, 255], // blanco
        fontStyle: 'bold',
      },
      didDrawCell: (dataCell) => {

        const col = columns[dataCell.column.index]
        const originalRow = data.rows[dataCell.row.index]

        // 🧠 🔥 CLAVE: ignorar header
        if (dataCell.row.section !== 'body') return

        if (!col || !originalRow) return

        if (
          col.dataKey === "firma_ingreso" &&
          isBase64Image(originalRow.firma_ingreso)
        ) {
          doc.addImage(
            originalRow.firma_ingreso,
            "PNG",
            dataCell.cell.x - 3,
            dataCell.cell.y - 1.2,
            18,
            10
          )
        }
      }
    })

    doc.save(`${data.title.toLowerCase().replace(/ /g, "_")}.pdf`)
  }

  return {
    generatePDF,
    submitData
  }
}
