import { computed, onMounted, reactive, ref, watch } from 'vue'
import { API_URL } from '@/config/network'
import type { HistorialAprendiz, HistoryFilters } from '@/types/history.types'

const API = API_URL

export const useHistoryFilters = () => {
  const historial = ref<HistorialAprendiz[]>([])
  const queryAprendices = ref('')
  const filters = reactive<HistoryFilters>({
    Date: 'TODAY',
    Program: 'ADSO',
  })

  const machineRegisteredCount = computed(
    () => historial.value.filter((item) => item.id_detallemaquina != null).length,
  )

  const buildFiltersQuery = () => {
    const params = new URLSearchParams()

    if (filters.Date) params.append('date', filters.Date)
    if (filters.Program) params.append('program', filters.Program)
    if (queryAprendices.value) params.append('search', queryAprendices.value)

    const query = params.toString()

    return query ? `?${query}` : ''
  }

  const getHistorial = async () => {
    const response = await fetch(`${API}/api/historico/historial`)
    const data: HistorialAprendiz[] = await response.json()
    historial.value = data
  }

  const getHistorialByFilters = async () => {
    try {
      const query = buildFiltersQuery()
      const response = await fetch(`${API}/api/historico/historialFechas${query}`)
      const data: HistorialAprendiz[] = await response.json()

      historial.value = data
    } catch (error) {
      console.error(error)
    }
  }

  onMounted(() => {
    getHistorialByFilters()
  })

  watch(
    () => [filters.Date, filters.Program, queryAprendices.value],
    () => {
      if (filters.Date || filters.Program || queryAprendices.value) {
        getHistorialByFilters()
        return
      }

      getHistorial()
    },
  )

  return {
    historial,
    queryAprendices,
    filters,
    machineRegisteredCount,
    getHistorial,
    getHistorialByFilters,
  }
}
