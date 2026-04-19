export type JornadaKey = 'DIURNA' | 'TARDE' | 'NOCHE' | 'SIN_JORNADA'

export interface JornadaDefinition {
  key: JornadaKey
  label: string
  startMinutes: number
  endMinutes: number
  badgeClass: string
}

export interface JornadaInfo {
  key: JornadaKey
  label: string
  badgeClass: string
}
