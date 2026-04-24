import { ref, computed } from 'vue'
import { API_URL } from '@/config/network'
import type { Aprendiz } from '@/types/aprendiz.types'
import { useJornadaStore } from '@/stores/jornada'

const API = API_URL

const aprendizData = ref<Aprendiz[]>([])
const latestAprendiz = computed(() => aprendizData.value[0] ?? null)

export const useAprendiz = () => {
  const jornadaStore = useJornadaStore()

  const HistorialIngresoAprendiz = async () => {
    try {
      const response = await fetch(`${API}/api/registroIngresos/historial`)
      const data = (await response.json()) as Aprendiz[]

      aprendizData.value = data
      jornadaStore.registerAprendices(aprendizData.value)
      return aprendizData.value
    } catch (error) {
      console.error(error)
      return []
    }
  }

  const AnadirIngresoAprendiz = async (code: string) => {
    if (!code) return

    try {
      const response = await fetch(`${API}/api/registroIngresos/addEntry/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          console.log('Info:', data.message)
        }
        return
      }

      console.log('Ingreso registrado:', data)

      await HistorialIngresoAprendiz()
      return true
    } catch (error) {
      console.error('ERROR REAL:', error)
    }
  }

  return {
    HistorialIngresoAprendiz,
    'AñadirIngresoAprendiz': AnadirIngresoAprendiz,
    aprendizData,
    latestAprendiz,
  }
}
