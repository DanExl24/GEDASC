export type EstadoMaquina = 'PRESTADA' | 'NO_PRINCIPAL' | 'NORMAL'

export type RawMachineDetailResult = {
  pc?: {
    marca?: string | null
    modelo?: string | null
    serial?: string | null
  } | null

  vh?: {
    tipo_vehiculo?: string | null
    marca?: string | null
    modelo?: string | null
    placa?: string | null
  } | null

  firma?: string | null

  aprendices?: {
    actual?: {
      id?: string | null
    }
    owner?: {
      id?: string | null
      name?: string | null
    }
  }
}

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

  estado: EstadoMaquina

  aprendices: {
    actual: {
      id: string | null
    }
    owner: {
      id: string | null
      name: string | null
    }
  }
}

export interface MachineDetailApiResponse {
  estado: EstadoMaquina
  result: RawMachineDetailResult
  message?: string
}
