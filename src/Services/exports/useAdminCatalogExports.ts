import { exportToExcel } from './useExcelExport'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { ExportData, ExportRow } from '@/types/exports/pdfExport'

type JsPDFWithAutoTable = jsPDF & {
  lastAutoTable?: {
    finalY: number
  }
}

export const generateCatalogPDF = (data: ExportData) => {
  const doc = new jsPDF() as JsPDFWithAutoTable
  const maxWidth = 180
  let fontSize = 16

  doc.setFontSize(fontSize)

  while (doc.getTextWidth(data.title) > maxWidth && fontSize > 10) {
    fontSize--
    doc.setFontSize(fontSize)
  }

  doc.text(data.title, 14, 15)

  const formattedDate = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  doc.setFontSize(10)
  doc.text(`Fecha de exportación: ${formattedDate}`, 14, 22)

  const columns = data.columns
  const rows = data.rows.map((row: ExportRow) =>
    columns.map((col) => row[col.dataKey] ?? '')
  )

  autoTable(doc, {
    startY: 30,
    head: [columns.map((col) => col.header)],
    body: rows,
    headStyles: {
      fillColor: [16, 185, 129], // Verde SENA
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
  })

  doc.save(`${data.title.toLowerCase().replace(/ /g, '_')}.pdf`)
}

export const useAdminCatalogExports = () => {

  // 1️⃣ Exportar Aprendices
  const exportAprendices = (
    aprendicesList: any[],
    format: 'pdf' | 'excel',
    visibleColumnKeys?: string[]
  ) => {
    const allColumns = [
      { header: 'Documento', dataKey: 'documento' },
      { header: 'Nombre', dataKey: 'nombre' },
      { header: 'Apellido', dataKey: 'apellido' },
      { header: 'Monitor', dataKey: 'es_monitor_label' },
      { header: 'Estado', dataKey: 'estado_label' },
      { header: 'Programa', dataKey: 'programa' },
      { header: 'Formación (Ficha)', dataKey: 'formacion' },
      { header: 'Jornada', dataKey: 'jornada' },
    ]

    const columns = visibleColumnKeys && visibleColumnKeys.length > 0
      ? allColumns.filter((col) => visibleColumnKeys.includes(col.dataKey))
      : allColumns

    const rows = aprendicesList.map((a) => {
      const isDobleFormacion =
        Number(a.total_formaciones || a.totalFormaciones) > 1 ||
        (Array.isArray(a.todas_formaciones) && a.todas_formaciones.length > 1) ||
        (Array.isArray(a.formaciones) && a.formaciones.length > 1)

      const nombreFinal = isDobleFormacion
        ? `${a.nombre || ''}\n(DOBLE FORMACIÓN)`
        : (a.nombre || '')

      return {
        documento: a.documento || '',
        nombre: nombreFinal,
        apellido: a.apellido || '',
        es_monitor_label: a.es_monitor ? 'SÍ' : 'NO',
        estado_label: a.estado === false ? 'Inactivo' : 'Activo',
        programa: a.programa || 'Sin programa',
        formacion: a.formacion || 'Sin ficha',
        jornada: a.jornada || 'Sin jornada',
      }
    })

    const data: ExportData = {
      title: 'Reporte Maestro de Aprendices',
      columns,
      rows,
    }

    if (format === 'excel') {
      exportToExcel(data)
    } else {
      generateCatalogPDF(data)
    }
  }

  // 2️⃣ Exportar Programas de Formación Académica (reporte sencillo)
  const exportProgramas = (programasList: any[], format: 'pdf' | 'excel') => {
    const columns = [
      { header: 'ID', dataKey: 'id_programa' },
      { header: 'Nombre del Programa', dataKey: 'nombre_programa' },
      { header: 'Versión', dataKey: 'version' },
      { header: 'Nivel', dataKey: 'nivel' },
      { header: 'Estado', dataKey: 'estado' },
    ]

    const rows = programasList.map((p) => ({
      id_programa: p.id_programa || '',
      nombre_programa: p.nombre_programa || '',
      version: p.version ? `V. ${p.version}` : '-',
      nivel: p.nivel || '-',
      estado: p.estado || 'activo',
    }))

    const data: ExportData = {
      title: 'Reporte Maestro de Programas Académicos',
      columns,
      rows,
    }

    if (format === 'excel') {
      exportToExcel(data)
    } else {
      generateCatalogPDF(data)
    }
  }

  // 3️⃣ Exportar Fichas / Formaciones (avanzado, con selección de columnas)
  const exportFormaciones = (
    formacionesList: any[],
    format: 'pdf' | 'excel',
    visibleColumnKeys?: string[]
  ) => {
    const allColumns = [
      { header: 'N° Ficha', dataKey: 'id_formacion' },
      { header: 'Programa de Formación', dataKey: 'nombre_programa' },
      { header: 'Versión Programa', dataKey: 'version' },
      { header: 'Nivel', dataKey: 'nivel' },
      { header: 'Jornada', dataKey: 'jornada' },
      { header: 'Hora Inicio', dataKey: 'hora_inicio' },
      { header: 'Hora Fin', dataKey: 'hora_fin' },
      { header: 'Días Hábiles', dataKey: 'dias_semana' },
      { header: 'Estado', dataKey: 'estado' },
      { header: 'Total Aprendices', dataKey: 'total_aprendices' },
    ]

    const columns = visibleColumnKeys && visibleColumnKeys.length > 0
      ? allColumns.filter((col) => visibleColumnKeys.includes(col.dataKey))
      : allColumns

    const rows = formacionesList.map((f) => ({
      id_formacion: f.id_formacion || '',
      nombre_programa: f.nombre_programa || f.nombre || 'Sin programa',
      version: f.version ? `V. ${f.version}` : '-',
      nivel: f.nivel || '-',
      jornada: f.jornada || 'No asignada',
      hora_inicio: f.hora_inicio || '-',
      hora_fin: f.hora_fin || '-',
      dias_semana: f.dias_semana || '-',
      estado: f.estado || 'activa',
      total_aprendices: f.total_aprendices ?? 0,
    }))

    const data: ExportData = {
      title: 'Reporte Avanzado de Fichas de Formación',
      columns,
      rows,
    }

    if (format === 'excel') {
      exportToExcel(data)
    } else {
      generateCatalogPDF(data)
    }
  }

  // 4️⃣ Exportar Horarios / Jornadas
  const exportHorarios = (horariosList: any[], format: 'pdf' | 'excel') => {
    const columns = [
      { header: 'ID Horario', dataKey: 'id_horario' },
      { header: 'Jornada', dataKey: 'jornada' },
      { header: 'Hora Inicio', dataKey: 'hora_inicio' },
      { header: 'Hora Fin', dataKey: 'hora_fin' },
      { header: 'Días Asignados', dataKey: 'dias' },
    ]

    const rows = horariosList.map((h) => ({
      id_horario: h.id_horario || '',
      jornada: h.jornada || '',
      hora_inicio: h.hora_inicio || '',
      hora_fin: h.hora_fin || '',
      dias: Array.isArray(h.dias) ? h.dias.join(', ') : h.dias || 'Lunes a Viernes',
    }))

    const data: ExportData = {
      title: 'Reporte Maestro de Horarios y Jornadas',
      columns,
      rows,
    }

    if (format === 'excel') {
      exportToExcel(data)
    } else {
      generateCatalogPDF(data)
    }
  }

  return {
    exportAprendices,
    exportProgramas,
    exportFormaciones,
    exportHorarios,
  }
}
