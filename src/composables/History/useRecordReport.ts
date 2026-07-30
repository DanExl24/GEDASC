import { computed, reactive, watch, ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { optionsDates } from '@/constants/optionsDates'
import type {
  RecordReportFilters,
  ReportCard,
  ReportFieldConfig,
  ReportFieldKey,
  ReportType,
} from '@/types/recordReport.types'

const reportCards: ReportCard[] = [
  {
    id: 'entries',
    eyebrow: 'Control diario',
    title: 'Reporte de ingresos',
    description:
      'Filtra aprendices registrados en entrada por fecha, programa, documento o estado operativo.',
    badge: 'IN',
    accentClass:
      'border-emerald-200 bg-[linear-gradient(180deg,#ffffff_0%,#eff9f1_100%)]',
    badgeClass: 'bg-senaColor text-white',
  },
  {
    id: 'exits',
    eyebrow: 'Cierre de jornada',
    title: 'Reporte de salidas',
    description:
      'Prepara la consulta de aprendices que ya completaron su salida y su trazabilidad base.',
    badge: 'OUT',
    accentClass:
      'border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]',
    badgeClass: 'bg-slate-900 text-white',
  },
  {
    id: 'history',
    eyebrow: 'Consulta global',
    title: 'Registro historico',
    description:
      'Configura filtros del historial consolidado de ingresos, salidas y maquinas asociadas.',
    badge: 'HIS',
    accentClass:
      'border-emerald-100 bg-[linear-gradient(180deg,#ffffff_0%,#f6fbf7_100%)]',
    badgeClass: 'bg-emerald-100 text-senaColor',
  },
  {
    id: 'assets',
    eyebrow: 'Equipos y vehiculos',
    title: 'Reporte de activos',
    description:
      'Selecciona si vas a consultar computadores o vehiculos y define el filtro puntual del activo.',
    badge: 'AST',
    accentClass:
      'border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]',
    badgeClass: 'bg-slate-200 text-slate-900',
  },
  {
    id: 'aprendices',
    adminOnly: true,
    eyebrow: 'Catálogo Maestro',
    title: 'Maestro de Aprendices',
    description:
      'Exporta la base de datos completa de aprendices, su condición de monitor y sus formaciones.',
    badge: 'APR',
    accentClass:
      'border-purple-200 bg-[linear-gradient(180deg,#ffffff_0%,#faf5ff_100%)]',
    badgeClass: 'bg-purple-600 text-white',
  },
  {
    id: 'formaciones',
    adminOnly: true,
    eyebrow: 'Catálogo Maestro',
    title: 'Maestro de Formaciones',
    description:
      'Exporta la lista de fichas, programas de formación académica y jornadas asociadas.',
    badge: 'FRM',
    accentClass:
      'border-amber-200 bg-[linear-gradient(180deg,#ffffff_0%,#fffbeb_100%)]',
    badgeClass: 'bg-amber-500 text-white',
  },
  {
    id: 'horarios',
    adminOnly: true,
    eyebrow: 'Catálogo Maestro',
    title: 'Maestro de Horarios',
    description:
      'Exporta la configuración de jornadas, horarios de inicio, fin y días hábiles asignados.',
    badge: 'HOR',
    accentClass:
      'border-blue-200 bg-[linear-gradient(180deg,#ffffff_0%,#eff6ff_100%)]',
    badgeClass: 'bg-blue-600 text-white',
  },
]

import { API_URL } from '@/config/network'

const entryStatusOptions = [
  { label: 'Todos los estados', value: '' },
  { label: 'Con maquina registrada', value: 'WITH_MACHINE' },
  { label: 'Sin maquina registrada', value: 'WITHOUT_MACHINE' },
]

const assetViewOptions = [
  { label: 'Computadores', value: 'computers' },
  { label: 'Vehiculos', value: 'vehicles' },
]

const programOptionsRef = ref<{ label: string; value: string }[]>([
  { label: 'Todos los programas', value: '' }
])

const fichaOptionsRef = ref<{ label: string; value: string }[]>([
  { label: 'Todas las fichas', value: '' }
])

const loadDynamicOptions = async () => {
  try {
    const res = await fetch(`${API_URL}/api/historico/opcionesFiltros`)
    if (res.ok) {
      const data = await res.json()
      programOptionsRef.value = [
        { label: 'Todos los programas', value: '' },
        ...(data.programas || []).map((p: { id_programa: number; nombre_programa: string }) => ({
          label: p.nombre_programa,
          value: p.nombre_programa
        }))
      ]

      fichaOptionsRef.value = [
        { label: 'Todas las fichas', value: '' },
        ...(data.fichas || []).map((f: { id_formacion: number; nombre_programa: string }) => ({
          label: `Ficha ${f.id_formacion} ${f.nombre_programa ? `- ${f.nombre_programa}` : ''}`,
          value: String(f.id_formacion)
        }))
      ]
    }
  } catch (error) {
    console.error('Error al obtener opciones dinámicas:', error)
  }
}

const createInitialFilters = (): RecordReportFilters => ({
  date: 'TODAY',
  program: '',
  ficha: '',
  searchRegister: '',
  entryStatus: '',
  assetView: 'computers',
  vehicleType: '',
})

const createSelectField = (
  key: ReportFieldKey,
  label: string,
  placeholder: string,
  options: ReportFieldConfig['options'],
): ReportFieldConfig => ({
  key,
  label,
  type: 'select',
  placeholder,
  options,
})

const createSearchField = (
  key: ReportFieldKey,
  label: string,
  placeholder: string,
): ReportFieldConfig => ({
  key,
  label,
  type: 'search',
  placeholder,
})

const createBaseDateField = () =>
  createSelectField('date', 'Fecha', 'Fecha', optionsDates)

const createBaseProgramField = () =>
  createSelectField(
    'program',
    'Programa',
    'Todos los programas',
    programOptionsRef.value,
  )

const createBaseFichaField = () =>
  createSelectField(
    'ficha',
    'Ficha / Formación',
    'Todas las fichas',
    fichaOptionsRef.value,
  )

const createBaseDocumentField = () =>
  createSearchField(
    'searchRegister',
    'Busqueda',
    'Digite nombre, apellido o documento...',
  )

export const useRecordReport = () => {
  onMounted(() => {
    loadDynamicOptions()
  })

  const filters = ref<RecordReportFilters>(createInitialFilters())
  const selectedReport = reactive<{ type: ReportType }>({
    type: 'entries',
  })

  const reportFieldBuilders: Record<ReportType, (f?: RecordReportFilters) => ReportFieldConfig[]> = {
    entries: () => [
      createBaseDateField(),
      createBaseProgramField(),
      createBaseFichaField(),
      createBaseDocumentField(),
      createSelectField(
        'entryStatus',
        'Estado de maquina',
        'Estado del registro',
        entryStatusOptions,
      ),
    ],
    exits: () => [
      createBaseDateField(),
      createBaseProgramField(),
      createBaseFichaField(),
      createBaseDocumentField(),
      createSelectField(
        'entryStatus',
        'Relacion con maquina',
        'Relacion con maquina',
        entryStatusOptions,
      ),
    ],
    history: () => [
      createBaseDateField(),
      createBaseProgramField(),
      createBaseFichaField(),
      createBaseDocumentField(),
      createSelectField(
        'entryStatus',
        'Filtro por equipo',
        'Filtro por equipo',
        entryStatusOptions,
      ),
    ],
    assets: (currentFilters?: RecordReportFilters) => {
      const fields: ReportFieldConfig[] = [
        createSelectField(
          'assetView',
          'Tipo de activo',
          'Tipo de activo',
          assetViewOptions,
        ),
        createBaseDateField()
      ]

      if (currentFilters?.assetView === 'vehicles') {
        fields.push(
          createSelectField(
            'vehicleType',
            'Tipo de vehículo',
            'Todos los tipos',
            [
              { label: 'Todos los tipos', value: '' },
              { label: 'MOTO', value: 'MOTO' },
              { label: 'CARRO', value: 'CARRO' },
              { label: 'BICICLETA', value: 'BICICLETA' },
            ],
          ),
        )
      }

      fields.push(
        createSearchField(
          'searchRegister',
          'Busqueda activa',
          'Busca por documento, nombre, serial o placa...',
        ),
      )

      return fields
    },
    aprendices: () => [
      createBaseDocumentField(),
    ],
    formaciones: () => [
      createBaseProgramField(),
    ],
    horarios: () => [],
  }

  const auth = useAuthStore()

  const availableReportCards = computed<ReportCard[]>(() => {
    if (auth.isAdmin) return reportCards
    return reportCards.filter((card) => !card.adminOnly)
  })

  const reportFields = computed<ReportFieldConfig[]>(
    () => reportFieldBuilders[selectedReport.type](filters.value),
  )

  const currentReportCard = computed<ReportCard>(
    () => availableReportCards.value.find((card) => card.id === selectedReport.type) ?? availableReportCards.value[0]!,
  )

  const currentSummary = computed<string[]>(() => {
    switch (selectedReport.type) {
      case 'entries':
        return [
          `Fecha: ${filters.value.date || 'Sin fecha'}`,
          `Programa: ${filters.value.program || 'Todos los programas'}`,
          `Busqueda: ${filters.value.searchRegister || 'Sin texto'}`,
          `Estado: ${filters.value.entryStatus || 'Todos'}`,
        ]
      case 'exits':
        return [
          `Fecha: ${filters.value.date || 'Sin fecha'}`,
          `Programa: ${filters.value.program || 'Todos los programas'}`,
          `Busqueda: ${filters.value.searchRegister || 'Sin texto'}`,
          `Maquina: ${filters.value.entryStatus || 'Todos'}`,
        ]
      case 'history':
        return [
          `Fecha: ${filters.value.date || 'Sin fecha'}`,
          `Programa: ${filters.value.program || 'Todos los programas'}`,
          `Busqueda: ${filters.value.searchRegister || 'Sin texto'}`,
          `Maquina: ${filters.value.entryStatus || 'Todos'}`,
        ]
      case 'assets':
        return [
          `Activo: ${filters.value.assetView === 'vehicles' ? 'Vehiculos' : 'Computadores'}`,
          `Fecha: ${filters.value.date || 'Sin fecha'}`,
          `Busqueda: ${filters.value.searchRegister || 'Sin texto'}`,
        ]
      default:
        return []
    }
  })

  const resetCurrentReportFilters = () => {
    filters.value.date = 'TODAY'
    filters.value.program = ''
    filters.value.ficha = ''
    filters.value.searchRegister = ''
    filters.value.entryStatus = ''
    filters.value.assetView = 'computers'
    filters.value.vehicleType = ''
    filters.value.searchRegister = ''
  }

  watch(
    () => filters.value.assetView,
    () => {
      filters.value.searchRegister = ''
      filters.value.vehicleType = ''
    },
  )

watch(
  () => ({
    type: selectedReport.type,
    filters: { ...filters.value },
  }),
  (newValue) => {
    console.log('📊 Report state actualizado:')
    console.log('➡️ Tipo:', newValue.type)
    console.log('➡️ Filtros:', newValue.filters)
  },
  { deep: true }
)


watch(
  () => selectedReport.type,
  (newType) => {
    console.log('🧠 CAMBIO DE REPORTE:', newType)

    // 💣 reset SOLO lo que pertenece a assets
    if (newType !== 'assets') {
      filters.value.assetView = 'computers'
      filters.value.searchRegister = ''
    }
  }
)

  return {
    reportCards: availableReportCards,
    selectedReport,
    filters,
    reportFields,
    currentReportCard,
    currentSummary,
    resetCurrentReportFilters,
  }
}
