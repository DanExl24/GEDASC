import { computed, reactive, watch } from 'vue'
import { optionsDates } from '@/constants/optionsDates'
import { optionsProgram } from '@/constants/optionsProgram'
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
]

const entryStatusOptions = [
  { label: 'Todos los estados', value: '' },
  { label: 'Con maquina registrada', value: 'WITH_MACHINE' },
  { label: 'Sin maquina registrada', value: 'WITHOUT_MACHINE' },
]

const historyMachineOptions = [
  { label: 'Todos los registros', value: '' },
  { label: 'Con maquina asociada', value: 'WITH_MACHINE' },
  { label: 'Sin maquina asociada', value: 'WITHOUT_MACHINE' },
]

const assetViewOptions = [
  { label: 'Computadores', value: 'computers' },
  { label: 'Vehiculos', value: 'vehicles' },
]

const computerAssetFilterOptions = [
  { label: 'Sin filtro', value: '' },
  { label: 'ID Aprendiz', value: 'APRENDIZ' },
  { label: 'Serial Computador', value: 'SERIAL' },
]

const vehicleAssetFilterOptions = [
  { label: 'Sin filtro', value: '' },
  { label: 'ID Aprendiz', value: 'APRENDIZ' },
  { label: 'Placa', value: 'PLACA' },
]

const createInitialFilters = (): RecordReportFilters => ({
  date: 'TODAY',
  program: '',
  document: '',
  entryStatus: '',
  historyMachine: '',
  assetView: 'computers',
  assetFilterType: '',
  assetSearch: '',
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
    'Programa de formacion',
    optionsProgram,
  )

const createBaseDocumentField = () =>
  createSearchField(
    'document',
    'Busqueda',
    'Digite nombre, apellido o documento...',
  )

export const useRecordReport = () => {
  const filters = reactive<RecordReportFilters>(createInitialFilters())
  const selectedReport = reactive<{ type: ReportType }>({
    type: 'entries',
  })

  const assetFilterOptions = computed(() =>
    filters.assetView === 'vehicles'
      ? vehicleAssetFilterOptions
      : computerAssetFilterOptions,
  )

  const assetSearchPlaceholder = computed(() => {
    if (filters.assetView === 'vehicles') {
      return filters.assetFilterType === 'PLACA'
        ? 'Digite la placa del vehiculo...'
        : 'Digite el documento del aprendiz...'
    }

    return filters.assetFilterType === 'SERIAL'
      ? 'Digite el serial del computador...'
      : 'Digite el documento del aprendiz...'
  })

  const reportFieldBuilders: Record<ReportType, () => ReportFieldConfig[]> = {
    entries: () => [
      createBaseDateField(),
      createBaseProgramField(),
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
      createBaseDocumentField(),
      createSelectField(
        'historyMachine',
        'Relacion con maquina',
        'Relacion con maquina',
        historyMachineOptions,
      ),
    ],
    history: () => [
      createBaseDateField(),
      createBaseProgramField(),
      createBaseDocumentField(),
      createSelectField(
        'historyMachine',
        'Relacion con maquina',
        'Relacion con maquina',
        historyMachineOptions,
      ),
    ],
    assets: () => {
      const fields: ReportFieldConfig[] = [
        createSelectField(
          'assetView',
          'Tipo de activo',
          'Tipo de activo',
          assetViewOptions,
        ),
        createBaseDateField(),
        createSelectField(
          'assetFilterType',
          'Filtro',
          'Filtrar por',
          assetFilterOptions.value,
        ),
      ]

      if (filters.assetFilterType) {
        fields.push(
          createSearchField(
            'assetSearch',
            'Busqueda activa',
            assetSearchPlaceholder.value,
          ),
        )
      }

      return fields
    },
  }

  const reportFields = computed<ReportFieldConfig[]>(
    () => reportFieldBuilders[selectedReport.type](),
  )

  const currentReportCard = computed<ReportCard>(
    () => reportCards.find((card) => card.id === selectedReport.type) ?? reportCards[0]!,
  )

  const currentSummary = computed<string[]>(() => {
    switch (selectedReport.type) {
      case 'entries':
        return [
          `Fecha: ${filters.date || 'Sin fecha'}`,
          `Programa: ${filters.program || 'Todos los programas'}`,
          `Busqueda: ${filters.document || 'Sin texto'}`,
          `Estado: ${filters.entryStatus || 'Todos'}`,
        ]
      case 'exits':
        return [
          `Fecha: ${filters.date || 'Sin fecha'}`,
          `Programa: ${filters.program || 'Todos los programas'}`,
          `Busqueda: ${filters.document || 'Sin texto'}`,
          `Maquina: ${filters.historyMachine || 'Todos'}`,
        ]
      case 'history':
        return [
          `Fecha: ${filters.date || 'Sin fecha'}`,
          `Programa: ${filters.program || 'Todos los programas'}`,
          `Busqueda: ${filters.document || 'Sin texto'}`,
          `Maquina: ${filters.historyMachine || 'Todos'}`,
        ]
      case 'assets':
        return [
          `Activo: ${filters.assetView === 'vehicles' ? 'Vehiculos' : 'Computadores'}`,
          `Fecha: ${filters.date || 'Sin fecha'}`,
          `Filtro: ${filters.assetFilterType || 'Sin filtro'}`,
          `Busqueda: ${filters.assetSearch || 'Sin texto'}`,
        ]
      default:
        return []
    }
  })

  const resetCurrentReportFilters = () => {
    filters.date = 'TODAY'
    filters.program = ''
    filters.document = ''
    filters.entryStatus = ''
    filters.historyMachine = ''
    filters.assetView = 'computers'
    filters.assetFilterType = ''
    filters.assetSearch = ''
  }

  watch(
    () => filters.assetView,
    () => {
      filters.assetFilterType = ''
      filters.assetSearch = ''
    },
  )

  watch(
    () => filters.assetFilterType,
    (value) => {
      if (!value) {
        filters.assetSearch = ''
      }
    },
  )

  return {
    reportCards,
    selectedReport,
    filters,
    reportFields,
    currentReportCard,
    currentSummary,
    resetCurrentReportFilters,
  }
}
