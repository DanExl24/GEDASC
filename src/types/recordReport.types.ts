export type ReportType = 'entries' | 'exits' | 'history' | 'assets' | 'aprendices' | 'formaciones' | 'horarios'

export type ReportFieldType = 'select' | 'search'

export interface ReportFieldOption {
  label: string
  value: string
}

export interface ReportFieldConfig {
  key: ReportFieldKey
  label: string
  type: ReportFieldType
  placeholder: string
  options?: ReportFieldOption[]
}

export interface ReportCard {
  id: ReportType
  eyebrow: string
  title: string
  description: string
  badge: string
  accentClass: string
  badgeClass: string
  adminOnly?: boolean
}

export interface RecordReportFilters {
  date: string
  program: string
  ficha: string
  searchRegister: string
  entryStatus: string
  assetView: string
  vehicleType: string
}

export type ReportFieldKey = keyof RecordReportFilters
