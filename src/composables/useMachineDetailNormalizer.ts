import type {
  EstadoMaquina,
  MaquinaDetalleUI,
  MaquinaItem,
  RawMachineDetailResult,
  RawMachineItem,
} from '@/types/machineDetails.types'

export const normalizeMachineItem = (rawItem: RawMachineItem): MaquinaItem => {
  const pcMarca = rawItem.pc?.marca ?? rawItem.pc?.modelo ?? null
  const vhMarca = rawItem.vh?.marca ?? rawItem.vh?.modelo ?? null

  return {
    id_detallemaquina: rawItem.id_detallemaquina ?? null,
    pc: rawItem.pc
      ? {
          marca: pcMarca,
          serial: rawItem.pc.serial ?? null,
        }
      : null,
    vh: rawItem.vh
      ? {
          tipo_vehiculo: rawItem.vh.tipo_vehiculo ?? null,
          marca: vhMarca,
          placa: rawItem.vh.placa ?? null,
        }
      : null,
    firma: rawItem.firma ?? null,
    firma_salida: rawItem.firma_salida ?? null,
    estado_equipo: rawItem.estado_equipo ?? null,
    hora_retiro_equipo: rawItem.hora_retiro_equipo ?? null,
    aprendices: {
      actual: {
        id: rawItem.aprendices?.actual?.id ?? null,
      },
      owner: {
        id: rawItem.aprendices?.owner?.id ?? null,
        name: rawItem.aprendices?.owner?.name ?? null,
      },
    },
  }
}

export const createEmptyMachineDetail = (): MaquinaDetalleUI => ({
  items: [],
  estado: 'NORMAL',
  pc: null,
  vh: null,
  firma: null,
  firma_salida: null,
  estado_equipo: null,
  hora_retiro_equipo: null,
  id_detallemaquina: null,
  aprendices: {
    actual: { id: null },
    owner: { id: null, name: null },
  },
})

export const normalizeMachineDetail = (
  raw: RawMachineDetailResult | null | undefined,
  estado: EstadoMaquina = 'NORMAL',
): MaquinaDetalleUI => {
  if (!raw) {
    return createEmptyMachineDetail()
  }

  const rawItems: RawMachineItem[] = raw.items && raw.items.length > 0 ? raw.items : [raw]
  const items = rawItems.map(normalizeMachineItem)
  const firstItem = items[0]

  return {
    items,
    estado,
    pc: firstItem?.pc ?? null,
    vh: firstItem?.vh ?? null,
    firma: firstItem?.firma ?? null,
    firma_salida: firstItem?.firma_salida ?? null,
    estado_equipo: firstItem?.estado_equipo ?? null,
    hora_retiro_equipo: firstItem?.hora_retiro_equipo ?? null,
    id_detallemaquina: firstItem?.id_detallemaquina ?? null,
    aprendices: firstItem?.aprendices ?? {
      actual: { id: null },
      owner: { id: null, name: null },
    },
  }
}
