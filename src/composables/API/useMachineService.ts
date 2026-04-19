import { API_URL } from '@/config/network'
import {
  normalizeMachineDetail,
} from '@/composables/useMachineDetailNormalizer'
import type {
  MachineDetailApiResponse,
  MaquinaDetalleUI,
} from '@/types/machineDetails.types'

const API = API_URL

/* =========================
   SERVICE
========================= */

export const useMachineService = () => {

  const getDetalleMaquina = async (
    id_aprendiz: number
  ): Promise<MaquinaDetalleUI> => {

    if (!id_aprendiz) {
      throw new Error('ID inválido')
    }

    const response = await fetch(
      `${API}/api/registroIngresos/detalleMaquinas/${id_aprendiz}`
    )

    const data: MachineDetailApiResponse = await response.json()

    if (!response.ok) {
      throw new Error('Error al obtener el detalle de la maquina')
    }

    const estado = data.estado

    return normalizeMachineDetail(data.result, estado ?? 'NORMAL')
  }

  return { getDetalleMaquina }
}
