import { API_URL } from '@/config/network'
import type { Aprendiz } from '@/types/aprendiz.types'

const API = API_URL

export const HistorialIngresos = async (): Promise<Aprendiz[]> => {
  try {
    const response = await fetch(`${API}/api/registroIngresos/historial`)
    const data: Aprendiz[] = await response.json()

    if (!response.ok) {
      throw new Error('Error al obtener el historial de ingresos')
    }

    return data
  } catch (error) {
    console.error(error)
    return []
  }
}
