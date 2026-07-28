export type DateFilterType = 
  | 'TODAY'
  | 'YESTERDAY'
  | 'THIS_WEEK'
  | 'LAST_WEEK'
  | 'THIS_MONTH'
  | 'LAST_MONTH'
  | 'THIS_QUARTER'

export const dateFiltersMap: Record<DateFilterType, string> = {
  TODAY: `di.hora_ingreso >= CURRENT_DATE AND di.hora_ingreso < CURRENT_DATE + INTERVAL '1 day'`,
  YESTERDAY: `di.hora_ingreso >= CURRENT_DATE - INTERVAL '1 day' AND di.hora_ingreso < CURRENT_DATE`,
  THIS_WEEK: `di.hora_ingreso >= date_trunc('week', CURRENT_DATE) AND di.hora_ingreso < date_trunc('week', CURRENT_DATE) + INTERVAL '1 week'`,
  LAST_WEEK: `di.hora_ingreso >= date_trunc('week', CURRENT_DATE) - INTERVAL '1 week' AND di.hora_ingreso < date_trunc('week', CURRENT_DATE)`,
  THIS_MONTH: `di.hora_ingreso >= date_trunc('month', CURRENT_DATE) AND di.hora_ingreso < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'`,
  LAST_MONTH: `di.hora_ingreso >= date_trunc('month', CURRENT_DATE) - INTERVAL '1 month' AND di.hora_ingreso < date_trunc('month', CURRENT_DATE)`,
  THIS_QUARTER: `di.hora_ingreso >= date_trunc('quarter', CURRENT_DATE) AND di.hora_ingreso < date_trunc('quarter', CURRENT_DATE) + INTERVAL '3 months'`
} as const

// Mantener compatibilidad hacia atrás
export const filtersMap = {
  date: dateFiltersMap
} as const
