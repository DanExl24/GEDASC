import type { machineDetails } from "@/types/machineDetails.types"
import { API_URL } from '@/config/network'
const API = API_URL


export const useMachineService = () => {

    const getDetalleMaquina = async (id_aprendiz: number) : Promise<machineDetails> => {
      const response = await fetch(`${API}/api/registroIngresos/detalleMaquinas/${id_aprendiz}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message)
      }

      return data.result
    }
    return {
      getDetalleMaquina
    }
}
