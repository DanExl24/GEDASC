
import { API_URL } from '@/config/network'
const API = API_URL

export type MaquinaDetalleUI = {
  pc?: {
    marca: string
    serial: string
  }
  vh?: {
    tipo_vehiculo: string
    marca: string
    placa: string
  }
  firma?: string
  estado?: 'PRESTADA' | 'DISPONIBLE'
}

export const useMachineService = () => {

  const getDetalleMaquina = async (id_aprendiz: number): Promise<MaquinaDetalleUI> => {
      if (!id_aprendiz) {
    throw new Error("ID de aprendiz inválido o vacío")
  }
    const response = await fetch(`${API}/api/registroIngresos/detalleMaquinas/${id_aprendiz}`)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message)
    }

    const raw = data.result

    const normalized: MaquinaDetalleUI = {
      pc: raw.pc
        ? {
            marca: raw.pc.marca,
            serial: raw.pc.serial
          }
        : raw.id_computador
          ? {
              marca: raw.prestadoMarca,
              serial: raw.prestadoSerial
            }
          : undefined,

      vh: raw.vh
        ? {
            tipo_vehiculo: raw.vh.tipo_vehiculo,
            marca: raw.vh.marca,
            placa: raw.vh.placa
          }
        : raw.id_vehiculo
          ? {
              tipo_vehiculo: raw.prestadoTipo,
              marca: raw.prestadoMarca,
              placa: raw.prestadoPlaca
            }
          : undefined,

      firma: raw.firma ?? null,

      estado: data.prestada ? 'PRESTADA' : 'DISPONIBLE'
    }

    return normalized
  }

  return { getDetalleMaquina }
}
