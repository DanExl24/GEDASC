export type ReportType = 'entries' | 'exits' | 'history' | 'assets'

export type ReportFieldType = 'select' | 'search'

export type ReportFieldKey =
  | 'date'
  | 'program'
  | 'document'
  | 'entryStatus'
  | 'historyMachine'
  | 'assetView'
  | 'assetFilterType'
  | 'assetSearch'

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
  document: string
  entryStatus: string
  historyMachine: string
  assetView: string
  assetFilterType: string
  assetSearch: string
}
