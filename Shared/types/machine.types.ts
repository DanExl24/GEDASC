export type MaquinaDetalleUI = {
  pc: {
    marca: string
    serial: string
  } | null

  vh: {
    tipo_vehiculo: string
    marca: string
    placa: string
  } | null

  firma: string | null

  estado: 'PRESTADA' | 'NO_PRINCIPAL' | 'NORMAL'

  aprendices: {
    actual: { id: string | null }
    owner: { id: string | null; name: string | null }
  }
}
