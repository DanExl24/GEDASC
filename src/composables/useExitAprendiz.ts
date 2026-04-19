import { computed, ref } from 'vue'
import { API_URL } from '@/config/network'
import type { Aprendiz } from '@/types/aprendiz.types'
import { useJornadaStore } from '@/stores/jornada'

const API = API_URL

const aprendizData = ref<Aprendiz[]>([])
const latestAprendiz = computed(() => aprendizData.value[0] ?? null)

export const useExitAprendiz = () => {
  const jornadaStore = useJornadaStore()

  const HistorialSalidaAprendiz = async () => {
    try {
      const response = await fetch(`${API}/api/registroSalidas/historial`)
      const data = (await response.json()) as Aprendiz[]

      aprendizData.value = data
      jornadaStore.registerAprendices(aprendizData.value)
      return aprendizData.value
    } catch (error) {
      console.error(error)
      return []
    }
  }

  const AnadirSalidaAprendiz = async (documento: string) => {
    if (!documento) return false

    try {
      const response = await fetch(
        `${API}/api/registroSalidas/addExit/${documento}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
      )

      const data = await response.json()

      if (!response.ok) {
        if (response.status !== 409) {
          console.error('Error:', data.message)
        }
        return false
      }

      await HistorialSalidaAprendiz()
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  return {
    HistorialSalidaAprendiz,
    'AñadirSalidaAprendiz': AnadirSalidaAprendiz,
    aprendizData,
    latestAprendiz,
  }
}
