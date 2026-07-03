export interface Aprendiz {
  id_aprendiz: number
  nombre: string
  apellido: string
  documento: string
  formacion: string
  nombre_programa?: string
  id_formacion?: number
  motivo_visita?: string
  hora_ingreso?: string
  hora_salida?: string
  id_detallemaquina?: number
  firma? : string
  tipo_sesion?: 'formacion' | 'monitoria'
  es_monitor?: boolean
  total_formaciones?: number
  numero_sesion?: number
  motivo_reingreso?: string
}

export interface Formacion {
  id_formacion: number
  nombre: string
  nivel?: string
  estado?: string
}

export interface ActiveSchedule {
  id_formacion: number
  nombre_ficha: string
  nombre_programa: string
  hora_inicio: string
  hora_fin: string
  jornada: string
}

export interface VerificationScheduleContext {
  isWithinSchedule: boolean
  matchingFormations: ActiveSchedule[]
  allActiveFormations: ActiveSchedule[]
}
