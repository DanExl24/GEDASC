import { computed, onMounted, reactive, ref, watch } from 'vue'
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import { fetchAssetOwnerDetail, fetchComputerHistory, fetchVehicleHistory } from '@/Services/assetsHistory'
import type {
  AssetHistoryBaseRow,
  AssetHistoryFilters,
  AssetOwnerDetail,
  AssetSummaryCard,
  AssetView,
  ComputerHistoryRow,
  VehicleHistoryRow,
} from '@/types/assetsHistory.types'



const resolveView = (view: unknown): AssetView =>
  view === 'vehicles' ? 'vehicles' : 'computers'

const createEmptyOwner = (): AssetOwnerDetail => ({
  id_propietario: 0,
  nombre: '',
  apellido: '',
  formacion: '',
  hora_ingreso: null,
  hora_salida: null,
  firma: null,
  firma_ingreso: null,
  firma_salida: null,
  estado_equipo: null,
  hora_retiro_equipo: null,
  id_formacion: null,
  horario_inicio: null,
  horario_fin: null,
  horario_jornada: null,
})

const matchesSearch = (value: string | number | null | undefined, search: string) =>
  String(value ?? '')
    .toLowerCase()
    .includes(search)

export const useAssetsHistory = (
  route: RouteLocationNormalizedLoaded,
  router: Router,
) => {
  const selectedView = ref<AssetView>(resolveView(route.query.view))
  const filters = reactive<AssetHistoryFilters>({
    Date: 'TODAY',
    filterType: '',
    searchValue: '',
    vehicleType: '',
  })

  const computerHistory = ref<ComputerHistoryRow[]>([])
  const vehicleHistory = ref<VehicleHistoryRow[]>([])
  const propietario = ref<AssetOwnerDetail>(createEmptyOwner())
  const todayRecords = reactive({
    computers: 0,
    vehicles: 0,
  })

  const isLoading = ref(false)
  const loadError = ref('')



  const selectedViewLabel = computed(() =>
    selectedView.value === 'computers' ? 'Computadores' : 'Vehiculos',
  )

  const selectedViewTitle = computed(() =>
    selectedView.value === 'computers'
      ? 'Consulta consolidada de computadores registrados'
      : 'Consulta consolidada de vehiculos registrados',
  )

  const selectedViewDescription = computed(() =>
    selectedView.value === 'computers'
      ? 'Filtra por serial o aprendiz, revisa horas de ingreso y salida, y consulta el propietario de cada equipo desde una sola vista.'
      : 'Revisa placas, tipo de vehiculo y trazabilidad del registro sin salir del mismo panel operativo.',
  )

  const heroAccentClass = computed(() =>
    selectedView.value === 'computers'
      ? 'bg-[linear-gradient(135deg,#0d7a3b_0%,#1a8e52_60%,#166534_100%)]'
      : 'bg-[linear-gradient(135deg,#0f172a_0%,#1f2937_55%,#0d7a3b_100%)]',
  )


  const searchTerm = computed(() => filters.searchValue.trim().toLowerCase())

  const filteredComputerHistory = computed<ComputerHistoryRow[]>(() => {
    if (!searchTerm.value) {
      return computerHistory.value
    }

    return computerHistory.value.filter((row) =>
      [
        row.serial,
        row.documento,
        row.marca,
        row.id_aprendiz,
      ].some((value) => matchesSearch(value, searchTerm.value)),
    )
  })

  const filteredVehicleHistory = computed<VehicleHistoryRow[]>(() => {
    let result = vehicleHistory.value

    if (filters.vehicleType) {
      result = result.filter(
        (row) => row.tipo_vehiculo.toUpperCase() === filters.vehicleType.toUpperCase()
      )
    }

    if (!searchTerm.value) {
      return result
    }

    return result.filter((row) =>
      [
        row.placa,
        row.documento,
        row.marca,
        row.tipo_vehiculo,
        row.id_aprendiz,
      ].some((value) => matchesSearch(value, searchTerm.value)),
    )
  })

  const filteredRows = computed<AssetHistoryBaseRow[]>(() =>
    selectedView.value === 'computers'
      ? filteredComputerHistory.value
      : filteredVehicleHistory.value,
  )

  const activeVisibleCount = computed(() => filteredRows.value.length)

  const activeCompletedCount = computed(
    () => filteredRows.value.filter((row) => row.hora_salida != null).length,
  )

  const activeSearchPlaceholder = computed(() =>
    selectedView.value === 'computers'
      ? 'Busca por serial, documento, marca o id del aprendiz...'
      : 'Busca por placa, documento, tipo, marca o id del aprendiz...',
  )

  const summaryCards = computed<AssetSummaryCard[]>(() => [
    {
      label: 'Computadores hoy',
      eyebrow: 'Registro diario',
      value: todayRecords.computers,
      description: 'Total de computadores registrados en la jornada actual.',
      badge: 'PC',
      cardClass: 'border-emerald-200 bg-white',
      eyebrowClass: 'text-senaColor',
      badgeClass: 'bg-senaColor text-white',
      titleClass: 'text-slate-900',
      valueClass: 'text-senaColor',
      descriptionClass: 'text-slate-600',
    },
    {
      label: 'Vehiculos hoy',
      eyebrow: 'Registro diario',
      value: todayRecords.vehicles,
      description: 'Total de vehiculos vinculados durante el dia.',
      badge: 'VH',
      cardClass: 'border-slate-200 bg-white',
      eyebrowClass: 'text-slate-500',
      badgeClass: 'bg-slate-900 text-white',
      titleClass: 'text-slate-900',
      valueClass: 'text-slate-900',
      descriptionClass: 'text-slate-600',
    },
    {
      label: 'Vista activa',
      eyebrow: 'Seleccion actual',
      value: activeVisibleCount.value,
      description: `Resultados visibles en ${selectedViewLabel.value.toLowerCase()}.`,
      badge: 'ON',
      cardClass: 'border-emerald-100 bg-emerald-50',
      eyebrowClass: 'text-senaColor',
      badgeClass: 'bg-white text-senaColor',
      titleClass: 'text-slate-900',
      valueClass: 'text-senaColor',
      descriptionClass: 'text-slate-600',
    },
    {
      label: 'Con salida',
      eyebrow: 'Trazabilidad',
      value: activeCompletedCount.value,
      description: 'Registros de la vista actual con movimiento cerrado.',
      badge: 'OUT',
      cardClass: 'border-slate-900 bg-slate-900 text-white',
      eyebrowClass: 'text-emerald-200',
      badgeClass: 'bg-white text-slate-900',
      titleClass: 'text-white',
      valueClass: 'text-white',
      descriptionClass: 'text-slate-300',
    },
  ])

  const loadActiveHistory = async () => {
    isLoading.value = true
    loadError.value = ''

    try {
      if (selectedView.value === 'computers') {
        computerHistory.value = await fetchComputerHistory(filters)
        return
      }

      vehicleHistory.value = await fetchVehicleHistory(filters)
    } catch (error) {
      console.error(error)
      loadError.value =
        error instanceof Error
          ? error.message
          : 'No fue posible cargar la informacion.'

      if (selectedView.value === 'computers') {
        computerHistory.value = []
      } else {
        vehicleHistory.value = []
      }
    } finally {
      isLoading.value = false
    }
  }

  const loadTodaySummary = async () => {
    try {
      const emptyFilters: AssetHistoryFilters = {
        Date: 'TODAY',
        filterType: '',
        searchValue: '',
        vehicleType: '',
      }

      const [computers, vehicles] = await Promise.all([
        fetchComputerHistory(emptyFilters),
        fetchVehicleHistory(emptyFilters),
      ])

      todayRecords.computers = computers.length
      todayRecords.vehicles = vehicles.length
    } catch (error) {
      console.error(error)
    }
  }

  const openPropietario = async (idDetalleMaquina: number) => {
    propietario.value = await fetchAssetOwnerDetail(
      selectedView.value,
      idDetalleMaquina,
    )

    return propietario.value
  }

  watch(
    () => route.query.view,
    (view) => {
      const normalizedView = resolveView(view)

      if (selectedView.value !== normalizedView) {
        selectedView.value = normalizedView
      }
    },
  )

  watch(selectedView, (view) => {
    filters.searchValue = ''
    filters.vehicleType = ''

    if (route.query.view !== view) {
      router.replace({
        query: {
          ...route.query,
          view,
        },
      })
    }
  })

  watch(
    () => [selectedView.value, filters.Date],
    () => {
      loadActiveHistory()
    },
    { immediate: true },
  )

  onMounted(() => {
    loadTodaySummary()

    if (route.query.view !== selectedView.value) {
      router.replace({
        query: {
          ...route.query,
          view: selectedView.value,
        },
      })
    }
  })

  return {
    selectedView,
    filters,
    propietario,
    computerHistory,
    vehicleHistory,
    filteredComputerHistory,
    filteredVehicleHistory,
    filteredRows,
    summaryCards,
    selectedViewLabel,
    selectedViewTitle,
    selectedViewDescription,
    heroAccentClass,
    activeSearchPlaceholder,
    activeVisibleCount,
    activeCompletedCount,
    isLoading,
    loadError,
    openPropietario,
  }
}
