import { computed, onMounted, reactive, ref, watch } from 'vue'
import { API_URL } from '@/config/network'
import type { HistorialAprendiz, HistoryFilters } from '@/types/history.types'

const API = API_URL

export const useHistoryFilters = () => {
  const historial = ref<HistorialAprendiz[]>([])
  const queryAprendices = ref('')
  const programasOpciones = ref<{ id_programa: number; nombre_programa: string }[]>([])
  const fichasOpciones = ref<{ id_formacion: number; nombre_programa: string }[]>([])

  const filters = reactive<HistoryFilters>({
    Date: 'TODAY',
    Program: '',
    Ficha: '',
  })

  const machineRegisteredCount = computed(
    () => historial.value.filter((item) => item.id_detallemaquina != null).length,
  )

  const loadFilterOptions = async () => {
    try {
      const response = await fetch(`${API}/api/historico/opcionesFiltros`)
      if (response.ok) {
        const data = await response.json()
        programasOpciones.value = data.programas || []
        fichasOpciones.value = data.fichas || []
      }
    } catch (error) {
      console.error('Error al cargar opciones de filtro:', error)
    }
  }

  const buildFiltersQuery = () => {
    const params = new URLSearchParams()

    if (filters.Date) params.append('date', filters.Date)
    if (filters.Program) params.append('program', filters.Program)
    if (filters.Ficha) params.append('ficha', filters.Ficha)
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
    loadFilterOptions()
    getHistorialByFilters()
  })

  watch(
    () => [filters.Date, filters.Program, filters.Ficha, queryAprendices.value],
    () => {
      getHistorialByFilters()
    },
  )

  return {
    historial,
    queryAprendices,
    filters,
    machineRegisteredCount,
    programasOpciones,
    fichasOpciones,
    getHistorial,
    getHistorialByFilters,
  }
}
