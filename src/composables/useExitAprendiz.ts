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

  const AddSalidaAprendiz = async (documento: string, motivo_salida_anticipada?: string) => {
    if (!documento) return { ok: false, message: 'Documento vacío' }

    try {
      const response = await fetch(
        `${API}/api/registroSalidas/addExit/${documento}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ motivo_salida_anticipada })
        },
      )

      const data = await response.json()

      console.log('[AddSalidaAprendiz] Respuesta backend:', {
        documento,
        status: response.status,
        ok: response.ok,
        data,
      })

      if (!response.ok) {
        return {
          ok: false,
          message: data.message || 'Error desconocido'
        }
      }

      await HistorialSalidaAprendiz()

      return {
        ok: true,
        message: data.message || 'Salida registrada'
      }

    } catch (error) {
      console.error(error)
      return {
        ok: false,
        message: 'Error de red o servidor'
      }
    }
  }

  return {
    HistorialSalidaAprendiz,
    AddSalidaAprendiz,
    aprendizData,
    latestAprendiz,
  }
}
