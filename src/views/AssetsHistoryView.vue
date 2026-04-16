<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#f5fbf5_0%,#ffffff_45%,#eef6f0_100%)] text-slate-800">
    <HeaderView
      HeaderTitle="HISTORIAL DE ACTIVOS REGISTRADOS"
      eyebrow="SENA | Equipos y vehiculos"
    />

    <section class="sticky top-[89px] z-20 border-b border-emerald-100 bg-white/95 backdrop-blur-sm shadow-[0_12px_30px_rgba(15,107,63,0.06)]">
      <div class="mx-auto grid w-full max-w-7xl gap-3 px-4 py-3 lg:grid-cols-[1.35fr_0.95fr_0.9fr_1.55fr_auto] lg:items-end lg:px-8">
        <article class="rounded-[18px] border border-slate-200 bg-white p-3">
          <p class="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Vista activa</p>
          <div class="grid grid-cols-2 gap-2 rounded-[16px] bg-slate-100 p-1.5">
            <button
              type="button"
              :class="selectedView === 'computers' ? 'bg-senaColor text-white shadow-[0_10px_18px_rgba(15,107,63,0.2)]' : 'bg-transparent text-slate-600'"
              class="rounded-[14px] px-3 py-2.5 text-sm font-semibold transition"
              @click="selectedView = 'computers'"
            >
              Computadores
            </button>
            <button
              type="button"
              :class="selectedView === 'vehicles' ? 'bg-slate-900 text-white shadow-[0_10px_18px_rgba(15,23,42,0.18)]' : 'bg-transparent text-slate-600'"
              class="rounded-[14px] px-3 py-2.5 text-sm font-semibold transition"
              @click="selectedView = 'vehicles'"
            >
              Vehiculos
            </button>
          </div>
        </article>

        <article class="rounded-[18px] border border-slate-200 bg-white p-3">
          <p class="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Filtro</p>
          <BaseSelect
            v-model:model-value="filters.filterType"
            :options="activeFilterOptions"
            placeholder="Filtrar por"
            select-class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-quicksand text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
        </article>

        <article class="rounded-[18px] border border-slate-200 bg-white p-3">
          <p class="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Fecha</p>
          <BaseSelect
            v-model:model-value="filters.Date"
            :options="optionsDates"
            placeholder="Fecha"
            select-class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-quicksand text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
        </article>

        <article class="rounded-[18px] border border-slate-200 bg-white p-3">
          <template v-if="filters.filterType">
            <p class="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Busqueda activa</p>
            <SearchBar
              v-model="filters.searchValue"
              :placeholder="activeSearchPlaceholder"
              input-class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-quicksand text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
          </template>

          <template v-else>
            <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Busqueda activa</p>
            <p class="mt-2 text-sm leading-5 text-slate-500">
              Selecciona primero el filtro de {{ selectedViewLabel.toLowerCase() }} para habilitar la busqueda.
            </p>
          </template>
        </article>

        <ExitButton
          to="/"
          button-class="flex h-11 w-11 items-center justify-center self-center rounded-2xl border border-emerald-200 bg-white shadow-none transition-transform duration-300 hover:scale-105"
        />
      </div>
    </section>

    <main class="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 lg:px-8 lg:py-5">
      <section class="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <article class="overflow-hidden rounded-[28px] border border-emerald-200 bg-white shadow-[0_18px_45px_rgba(15,107,63,0.08)]">
          <div :class="heroAccentClass" class="px-5 py-4 text-white lg:px-6">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">Vista consolidada</p>
            <h1 class="mt-2 font-robotoSlab text-[1.7rem] font-bold leading-tight lg:text-[2rem]">
              {{ selectedViewTitle }}
            </h1>
            <p class="mt-2 max-w-3xl text-sm leading-6 text-white/90">
              {{ selectedViewDescription }}
            </p>
          </div>

          <div class="grid gap-3 p-4 md:grid-cols-2 lg:px-6 lg:py-5">
            <div class="rounded-[20px] border border-emerald-100 bg-emerald-50 px-4 py-3">
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-senaColor">Resultados visibles</p>
                <p class="font-robotoSlab text-2xl font-bold text-senaColor">{{ activeVisibleCount }}</p>
              </div>
              <p class="mt-1 text-sm text-slate-600">Registros obtenidos con los filtros actuales.</p>
            </div>

            <div class="rounded-[20px] border border-slate-200 bg-white px-4 py-3">
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-senaColor">Con salida asociada</p>
                <p class="font-robotoSlab text-2xl font-bold text-slate-900">{{ activeCompletedCount }}</p>
              </div>
              <p class="mt-1 text-sm text-slate-600">Movimientos que ya registran hora de salida.</p>
            </div>
          </div>
        </article>

        <section class="grid gap-3 sm:grid-cols-2">
          <article
            v-for="card in summaryCards"
            :key="card.label"
            :class="card.cardClass"
            class="rounded-[24px] border px-4 py-4 shadow-[0_16px_35px_rgba(15,23,42,0.06)]"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p :class="card.eyebrowClass" class="text-[11px] font-semibold uppercase tracking-[0.16em]">
                  {{ card.eyebrow }}
                </p>
                <h2 :class="card.titleClass" class="mt-2 font-robotoSlab text-lg font-bold">{{ card.label }}</h2>
              </div>

              <div :class="card.badgeClass" class="flex h-10 w-10 items-center justify-center rounded-xl text-[11px] font-bold uppercase tracking-[0.14em]">
                {{ card.badge }}
              </div>
            </div>

            <p :class="card.valueClass" class="mt-5 font-robotoSlab text-4xl font-bold">{{ card.value }}</p>
            <p :class="card.descriptionClass" class="mt-2 text-sm leading-5">{{ card.description }}</p>
          </article>
        </section>
      </section>

      <section class="rounded-[28px] border border-emerald-200 bg-white shadow-[0_18px_45px_rgba(15,107,63,0.08)]">
        <div class="flex flex-col gap-1 border-b border-emerald-100 px-5 py-4 lg:flex-row lg:items-end lg:justify-between lg:px-6">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-senaColor">Resultados</p>
            <h2 class="mt-1 font-robotoSlab text-[1.45rem] font-bold text-slate-900">
              Historial de {{ selectedViewLabel.toLowerCase() }}
            </h2>
          </div>
          <p class="text-sm text-slate-500">
            {{ filters.filterType ? 'Consulta refinada con filtros dinamicos.' : 'Consulta general del historial seleccionado.' }}
          </p>
        </div>

        <div class="p-4 lg:px-6 lg:py-5">
          <div class="overflow-x-auto rounded-[24px] border border-slate-100 bg-slate-50/70 p-2">
            <BaseTable>
              <BaseColumn row-class="bg-slate-900 text-center">
                <template v-if="selectedView === 'computers'">
                  <BaseTableHead name="Marca" head-class="rounded-l-2xl bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
                  <BaseTableHead name="Serial" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
                  <BaseTableHead name="DNI" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
                  <BaseTableHead name="Ingreso" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
                  <BaseTableHead name="Salida" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
                  <BaseTableHead name="Propietario" head-class="rounded-r-2xl bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
                </template>

                <template v-else>
                  <BaseTableHead name="Tipo" head-class="rounded-l-2xl bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
                  <BaseTableHead name="Placa" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
                  <BaseTableHead name="Marca" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
                  <BaseTableHead name="DNI" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
                  <BaseTableHead name="Ingreso" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
                  <BaseTableHead name="Salida" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
                  <BaseTableHead name="Propietario" head-class="rounded-r-2xl bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
                </template>
              </BaseColumn>

              <template v-if="selectedView === 'computers'">
                <BaseColumn
                  v-for="computer in computerHistory"
                  :key="computer.id_detallemaquina"
                  row-class="text-center align-middle transition odd:bg-white even:bg-slate-50/80 hover:bg-emerald-50/70 [&>td]:border-b [&>td]:border-slate-100 [&>td]:px-4 [&>td]:py-4 [&>td]:text-sm [&>td]:text-slate-700"
                >
                  <td>{{ computer.marca }}</td>
                  <td>{{ computer.serial }}</td>
                  <td>{{ computer.documento }}</td>
                  <td>{{ computer.hora_ingreso || '-' }}</td>
                  <td>{{ computer.hora_salida || '-' }}</td>
                  <td>
                    <div class="flex justify-center">
                      <BaseButtonOpen
                        text="Ver propietario"
                        variant="ghost"
                        class-button="min-h-0 px-0 py-0 font-semibold shadow-none"
                        @click="openPropietario(computer.id_detallemaquina)"
                      />
                    </div>
                  </td>
                </BaseColumn>
              </template>

              <template v-else>
                <BaseColumn
                  v-for="vehicle in vehicleHistory"
                  :key="vehicle.id_detallemaquina"
                  row-class="text-center align-middle transition odd:bg-white even:bg-slate-50/80 hover:bg-emerald-50/70 [&>td]:border-b [&>td]:border-slate-100 [&>td]:px-4 [&>td]:py-4 [&>td]:text-sm [&>td]:text-slate-700"
                >
                  <td>{{ vehicle.tipo_vehiculo }}</td>
                  <td>{{ vehicle.placa }}</td>
                  <td>{{ vehicle.marca }}</td>
                  <td>{{ vehicle.documento }}</td>
                  <td>{{ vehicle.hora_ingreso || '-' }}</td>
                  <td>{{ vehicle.hora_salida || '-' }}</td>
                  <td>
                    <div class="flex justify-center">
                      <BaseButtonOpen
                        text="Ver propietario"
                        variant="ghost"
                        class-button="min-h-0 px-0 py-0 font-semibold shadow-none"
                        @click="openPropietario(vehicle.id_detallemaquina)"
                      />
                    </div>
                  </td>
                </BaseColumn>
              </template>
            </BaseTable>

            <div v-if="isLoading" class="px-4 py-10 text-center text-sm font-medium text-slate-500">
              Cargando historial de {{ selectedViewLabel.toLowerCase() }}...
            </div>

            <div v-else-if="loadError" class="px-4 py-10 text-center text-sm font-medium text-red-600">
              {{ loadError }}
            </div>

            <div v-else-if="activeVisibleCount === 0" class="px-4 py-10 text-center text-sm font-medium text-slate-500">
              No hay registros para los filtros actuales.
            </div>
          </div>
        </div>
      </section>

      <BaseModal ref="modalPropietario" title="Detalle del propietario">
        <div class="grid gap-3">
          <div class="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Nombre</p>
            <p class="mt-1 text-sm font-semibold text-slate-900">{{ propietario.nombre || 'Sin informacion' }}</p>
          </div>

          <div class="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Apellido</p>
            <p class="mt-1 text-sm font-semibold text-slate-900">{{ propietario.apellido || 'Sin informacion' }}</p>
          </div>

          <div class="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Programa</p>
            <p class="mt-1 text-sm font-semibold text-slate-900">{{ propietario.formacion || 'Sin informacion' }}</p>
          </div>

          <div v-if="propietario.firma" class="rounded-[18px] border border-dashed border-emerald-200 bg-emerald-50 p-4">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-senaColor">Firma registrada</p>
            <div class="mt-3 flex justify-center rounded-[16px] border border-emerald-100 bg-white p-3">
              <img :src="propietario.firma" class="max-h-40 w-auto rounded-lg" alt="Firma del propietario" />
            </div>
          </div>
        </div>
      </BaseModal>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import HeaderView from '@/layouts/HeaderView.vue'
import BaseTable from '@/components/Tables/BaseTable.vue'
import BaseColumn from '@/components/Tables/BaseColumn.vue'
import BaseTableHead from '@/components/Tables/BaseTableHead.vue'
import BaseButtonOpen from '@/components/Buttons/BaseButtonOpen.vue'
import BaseModal from '@/components/Modals/BaseModal.vue'
import ExitButton from '@/components/UI/ExitButton.vue'
import SearchBar from '@/components/UI/SearchBar.vue'
import BaseSelect from '@/components/Forms/BaseSelect.vue'

import { optionsDates } from '@/constants/optionsDates'
import { normalizeVehicleType } from '@/utils/vehicleType'

const API = import.meta.env.VITE_API_URL

type AssetView = 'computers' | 'vehicles'

interface Propietario {
  id_propietario: number
  nombre: string
  apellido: string
  formacion: string
  firma: string
}

interface BaseHistoryRow {
  id_detallemaquina: number
  marca: string
  documento: string
  hora_ingreso: string | null
  hora_salida: string | null
}

interface ComputerHistory extends BaseHistoryRow {
  serial: string
  id_aprendiz: number
}

interface VehicleHistory extends BaseHistoryRow {
  tipo_vehiculo: string
  placa: string
  id_aprendiz: number
}

interface HistoryFilters {
  Date: string
  filterType: string
  searchValue: string
}

interface SummaryCard {
  label: string
  eyebrow: string
  value: number
  description: string
  badge: string
  cardClass: string
  eyebrowClass: string
  badgeClass: string
  titleClass: string
  valueClass: string
  descriptionClass: string
}

const route = useRoute()
const router = useRouter()

const modalPropietario = ref()
const selectedView = ref<AssetView>(resolveView(route.query.view))
const computerHistory = ref<ComputerHistory[]>([])
const vehicleHistory = ref<VehicleHistory[]>([])
const todayRecords = reactive({
  computers: 0,
  vehicles: 0,
})
const isLoading = ref(false)
const loadError = ref('')

const propietario = ref<Propietario>({
  id_propietario: 0,
  nombre: '',
  apellido: '',
  formacion: '',
  firma: '',
})

const filters = reactive<HistoryFilters>({
  Date: 'TODAY',
  filterType: '',
  searchValue: '',
})

const computerFilterOptions = [
  { label: 'ID Aprendiz', value: 'APRENDIZ' },
  { label: 'Serial Computador', value: 'SERIAL' },
]

const vehicleFilterOptions = [
  { label: 'Placa', value: 'PLACA' },
  { label: 'ID Aprendiz', value: 'APRENDIZ' },
]

const activeFilterOptions = computed(() =>
  selectedView.value === 'computers' ? computerFilterOptions : vehicleFilterOptions,
)

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
    : 'Revisa placas, tipo de vehiculo y trazabilidad del registro sin salir del mismo panel operativo.'
)

const heroAccentClass = computed(() =>
  selectedView.value === 'computers'
    ? 'bg-[linear-gradient(135deg,#0d7a3b_0%,#1a8e52_60%,#166534_100%)]'
    : 'bg-[linear-gradient(135deg,#0f172a_0%,#1f2937_55%,#0d7a3b_100%)]',
)

const activeSearchPlaceholder = computed(() =>
  selectedView.value === 'computers'
    ? filters.filterType === 'SERIAL'
      ? 'Digite el serial del computador...'
      : 'Digite el documento del aprendiz...'
    : filters.filterType === 'PLACA'
      ? 'Digite la placa del vehiculo...'
      : 'Digite el documento del aprendiz...',
)

const activeRows = computed<BaseHistoryRow[]>(() =>
  selectedView.value === 'computers' ? computerHistory.value : vehicleHistory.value,
)

const activeVisibleCount = computed(() => activeRows.value.length)

const activeCompletedCount = computed(
  () => activeRows.value.filter((row) => row.hora_salida != null).length,
)

const summaryCards = computed<SummaryCard[]>(() => [
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

function resolveView(view: unknown): AssetView {
  return view === 'vehicles' ? 'vehicles' : 'computers'
}

function buildQuery({ Date, filterType, searchValue }: HistoryFilters) {
  const params = new URLSearchParams()

  if (Date) {
    params.append('date', Date)
  }

  if (filterType && searchValue.trim()) {
    params.append('type', filterType)
    params.append('value', searchValue.trim())
  }

  const query = params.toString()
  return query ? `?${query}` : ''
}

async function fetchComputerHistoryData(currentFilters: HistoryFilters) {
  const response = await fetch(`${API}/api/HistorialComputadores/historial${buildQuery(currentFilters)}`)

  if (!response.ok) {
    throw new Error('No fue posible cargar el historial de computadores.')
  }

  return await response.json() as ComputerHistory[]
}

async function fetchVehicleHistoryData(currentFilters: HistoryFilters) {
  const response = await fetch(`${API}/api/HistorialVehiculos/historial${buildQuery(currentFilters)}`)

  if (!response.ok) {
    throw new Error('No fue posible cargar el historial de vehiculos.')
  }

  const data = await response.json() as VehicleHistory[]
  return data.map((vehicle) => ({
    ...vehicle,
    tipo_vehiculo: normalizeVehicleType(vehicle.tipo_vehiculo),
  }))
}

async function loadActiveHistory() {
  isLoading.value = true
  loadError.value = ''

  try {
    if (selectedView.value === 'computers') {
      computerHistory.value = await fetchComputerHistoryData(filters)
      return
    }

    vehicleHistory.value = await fetchVehicleHistoryData(filters)
  } catch (error) {
    console.error(error)
    loadError.value = error instanceof Error ? error.message : 'No fue posible cargar la informacion.'

    if (selectedView.value === 'computers') {
      computerHistory.value = []
    } else {
      vehicleHistory.value = []
    }
  } finally {
    isLoading.value = false
  }
}

async function loadTodaySummary() {
  try {
    const [computers, vehicles] = await Promise.all([
      fetchComputerHistoryData({ Date: 'TODAY', filterType: '', searchValue: '' }),
      fetchVehicleHistoryData({ Date: 'TODAY', filterType: '', searchValue: '' }),
    ])

    todayRecords.computers = computers.length
    todayRecords.vehicles = vehicles.length
  } catch (error) {
    console.error(error)
  }
}

async function openPropietario(idDetalleMaquina: number) {
  const basePath = selectedView.value === 'computers' ? 'HistorialComputadores' : 'HistorialVehiculos'

  try {
    const response = await fetch(`${API}/api/${basePath}/propietario/${idDetalleMaquina}`)

    if (!response.ok) {
      throw new Error('No fue posible cargar el detalle del propietario.')
    }

    const data = await response.json()
    propietario.value = data.result as Propietario
    modalPropietario.value.openModal()
  } catch (error) {
    console.error(error)
  }
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
  filters.filterType = ''
  filters.searchValue = ''

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
  () => [selectedView.value, filters.Date, filters.filterType, filters.searchValue],
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
</script>
