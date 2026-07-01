export interface Aprendiz {
  id_aprendiz: number
  nombre: string
  apellido: string
  documento: string
  formacion: string
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
