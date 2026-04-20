export type ExportColumn = {
  header: string
  dataKey: string
}

export type CellValue = string | number | boolean | null | undefined

export interface ExportRow {
  firma_ingreso?: string | null
  [key: string]: CellValue
}

export type ExportData = {
  title: string
  columns: ExportColumn[]
  rows: Record<string, CellValue>[]
}

