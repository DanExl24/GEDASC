export type ReportType = 'entries' | 'exits' | 'history' | 'assets'

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
}

export interface RecordReportFilters {
  date: string
  program: string
  ficha: string
  searchRegister: string
  entryStatus: string
  assetView: string
}

export type ReportFieldKey = keyof RecordReportFilters
