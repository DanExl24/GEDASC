import type {
  EstadoMaquina,
  MaquinaDetalleUI,
  RawMachineDetailResult,
} from '@/types/machineDetails.types'

export const createEmptyMachineDetail = (): MaquinaDetalleUI => ({
  pc: null,
  vh: null,
  firma: null,
  firma_salida: null,
  estado_equipo: null,
  hora_retiro_equipo: null,
  id_detallemaquina: null,
  estado: 'NORMAL',
  aprendices: {
    actual: { id: null },
    owner: { id: null, name: null },
  },
})

export const normalizeMachineDetail = (
  raw: RawMachineDetailResult | null | undefined,
  estado: EstadoMaquina = 'NORMAL',
): MaquinaDetalleUI => {
  const pcMarca = raw?.pc?.marca ?? raw?.pc?.modelo ?? null
  const vhMarca = raw?.vh?.marca ?? raw?.vh?.modelo ?? null

  return {
    pc: raw?.pc
      ? {
          marca: pcMarca,
          serial: raw.pc.serial ?? null,
        }
      : null,
    vh: raw?.vh
      ? {
          tipo_vehiculo: raw.vh.tipo_vehiculo ?? null,
          marca: vhMarca,
          placa: raw.vh.placa ?? null,
        }
      : null,
    firma: raw?.firma ?? null,
    firma_salida: raw?.firma_salida ?? null,
    estado_equipo: raw?.estado_equipo ?? null,
    hora_retiro_equipo: raw?.hora_retiro_equipo ?? null,
    id_detallemaquina: raw?.id_detallemaquina ?? null,
    estado,
    aprendices: {
      actual: {
        id: raw?.aprendices?.actual?.id ?? null,
      },
      owner: {
        id: raw?.aprendices?.owner?.id ?? null,
        name: raw?.aprendices?.owner?.name ?? null,
      },
    },
  }
}
