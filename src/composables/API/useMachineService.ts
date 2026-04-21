import { API_URL } from '@/config/network'
import {
  normalizeMachineDetail,
} from '@/composables/useMachineDetailNormalizer'
import type {
  MachineDetailApiResponse,
  MaquinaDetalleUI,
} from '@/types/machineDetails.types'

type PrincipalMachineResponse = {
  pc: {
    marca: string | null
    serial: string | null
  } | null
  vh: {
    tipo_vehiculo: string | null
    marca: string | null
    placa: string | null
  } | null
}

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

  const getPrincipalMachine = async (
    id_aprendiz: number
  ): Promise<PrincipalMachineResponse> => {
    if (!id_aprendiz) {
      throw new Error('ID inválido')
    }

    const response = await fetch(
      `${API}/api/registroIngresos/maquinaPrincipal/${id_aprendiz}`
    )

    if (!response.ok) {
      throw new Error('Error al obtener la maquina principal')
    }

    const data = await response.json() as PrincipalMachineResponse
    console.log('[PrincipalMachine] Respuesta API:', {
      id_aprendiz,
      data
    })

    return data
  }

  return { getDetalleMaquina, getPrincipalMachine }
}
