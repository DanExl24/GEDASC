export type MaquinaDetalleUI = {
  pc: {
    marca: string | null
    serial: string | null
  } | null

  vh: {
    tipo_vehiculo: string | null
    marca: string | null
    placa: string | null
  } | null

  firma: string | null
  firma_salida?: string | null
  estado_equipo?: 'dentro' | 'retirado' | null
  id_detallemaquina?: number | null

  estado?: 'PRESTADA' | 'NO_PRINCIPAL' | 'NORMAL'

  aprendices: {
    actual: { id: string | null }
    owner: { id: string | null; name: string | null }
  }
}
