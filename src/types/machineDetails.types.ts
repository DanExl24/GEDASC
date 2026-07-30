export type EstadoMaquina = 'PRESTADA' | 'NO_PRINCIPAL' | 'NORMAL'

export type RawMachineItem = {
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
  firma_salida?: string | null
  estado_equipo?: 'dentro' | 'retirado' | null
  hora_retiro_equipo?: string | null
  id_detallemaquina?: number | null

  aprendices?: {
    actual?: {
      id?: string | null
      documento?: string | null
    }
    owner?: {
      id?: string | null
      name?: string | null
    }
  }
}

export type RawMachineDetailResult = RawMachineItem & {
  items?: RawMachineItem[] | null
}

export type MaquinaItem = {
  id_detallemaquina: number | null
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
  firma_salida: string | null
  estado_equipo: 'dentro' | 'retirado' | null
  hora_retiro_equipo: string | null
  aprendices: {
    actual: {
      id: string | null
      documento?: string | null
    }
    owner: {
      id: string | null
      name: string | null
    }
  }
}

export type MaquinaDetalleUI = {
  items: MaquinaItem[]
  estado: EstadoMaquina

  pc?: {
    marca: string | null
    serial: string | null
  } | null

  vh?: {
    tipo_vehiculo: string | null
    marca: string | null
    placa: string | null
  } | null

  firma?: string | null
  firma_salida?: string | null
  estado_equipo?: 'dentro' | 'retirado' | null
  hora_retiro_equipo?: string | null
  id_detallemaquina?: number | null

  aprendices?: {
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
