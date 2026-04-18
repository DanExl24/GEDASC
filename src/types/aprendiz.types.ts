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
}
