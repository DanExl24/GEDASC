import { ref } from 'vue'
import { API_URL } from '@/config/network'
import type { HistoryMachineDetailResponse } from '@/types/history.types'
import type { MaquinaDetalleUI } from '@/types/machineDetails.types'
import {
  createEmptyMachineDetail,
  normalizeMachineDetail,
} from '@/composables/useMachineDetailNormalizer'

const API = API_URL

export const useHistoryMachineDetail = () => {
  const maquinaDetalle = ref<MaquinaDetalleUI>(createEmptyMachineDetail())

  const openDetalleMaquina = async (
    idDetalleMaquina: number,
    onOpenModal: () => void,
  ) => {
    try {
      const response = await fetch(
        `${API}/api/historico/historialMaquinas/${idDetalleMaquina}`,
      )
      const data: HistoryMachineDetailResponse = await response.json()

      if (!response.ok) {
        console.error(data.message)
        return
      }

      maquinaDetalle.value = normalizeMachineDetail(
        data.result,
        data.estado ?? 'NORMAL',
      )
      onOpenModal()
    } catch (error) {
      console.error(error)
      maquinaDetalle.value = createEmptyMachineDetail()
    }
  }

  return {
    maquinaDetalle,
    openDetalleMaquina,
  }
}
