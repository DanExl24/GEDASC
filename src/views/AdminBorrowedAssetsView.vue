<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#f5fbf5_0%,#ffffff_45%,#eef6f0_100%)] text-slate-800">
    <HeaderView
      HeaderTitle="MAQUINAS PRESTADAS"
      eyebrow="SENA | Vista administrativa"
    />

    <section class="sticky top-[89px] z-20 border-b border-emerald-100 bg-white/95 backdrop-blur-sm shadow-[0_12px_30px_rgba(15,107,63,0.06)]">
      <div class="mx-auto grid w-full max-w-7xl gap-3 px-4 py-3 lg:grid-cols-[1.2fr_1.2fr_auto] lg:items-end lg:px-8">
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
          <p class="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Busqueda activa</p>
          <SearchBar
            v-model="search"
            :placeholder="activeSearchPlaceholder"
            :with-container="false"
            :show-label="false"
            input-class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-quicksand text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
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
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">Prestamos activos</p>
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
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-senaColor">Prestamos visibles</p>
                <p class="font-robotoSlab text-2xl font-bold text-senaColor">{{ activeVisibleCount }}</p>
              </div>
              <p class="mt-1 text-sm text-slate-600">Activos prestados en la vista actual.</p>
            </div>

            <div class="rounded-[20px] border border-slate-200 bg-white px-4 py-3">
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-senaColor">Aprendices involucrados</p>
                <p class="font-robotoSlab text-2xl font-bold text-slate-900">{{ activeBorrowerCount }}</p>
              </div>
              <p class="mt-1 text-sm text-slate-600">Cantidad de receptores en la vista activa.</p>
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
              Prestamos de {{ selectedViewLabel.toLowerCase() }}
            </h2>
          </div>
          <p class="text-sm text-slate-500">
            {{ search.trim() ? 'Consulta refinada por propietario, receptor o identificador del activo.' : 'Vista general de maquinas prestadas registradas por el admin.' }}
          </p>
        </div>

        <div class="p-4 lg:px-6 lg:py-5">
          <div v-if="isLoading" class="rounded-[20px] border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm text-slate-600">
            Cargando prestamos de {{ selectedViewLabel.toLowerCase() }}...
          </div>

          <div v-else-if="loadError" class="rounded-[20px] border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-600">
            {{ loadError }}
          </div>

          <div v-else class="overflow-x-auto rounded-[24px] border border-slate-100 bg-slate-50/70 p-2">
            <table class="w-full border-separate border-spacing-0 font-quicksand">
              <thead>
                <tr class="bg-slate-900 text-center">
                  <template v-if="selectedView === 'computers'">
                    <th class="rounded-l-2xl bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Marca</th>
                    <th class="bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Serial</th>
                    <th class="bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Presta</th>
                    <th class="bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Recibe</th>
                    <th class="bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Documento</th>
                    <th class="rounded-r-2xl bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Firma</th>
                  </template>

                  <template v-else>
                    <th class="rounded-l-2xl bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Tipo</th>
                    <th class="bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Placa</th>
                    <th class="bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Marca</th>
                    <th class="bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Presta</th>
                    <th class="bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Recibe</th>
                    <th class="bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Documento</th>
                    <th class="rounded-r-2xl bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Firma</th>
                  </template>
                </tr>
              </thead>

              <tbody v-if="selectedView === 'computers'">
                <tr
                  v-for="computer in filteredComputers"
                  :key="`${computer.borrowerId}-${computer.serial}`"
                  class="text-center align-middle transition odd:bg-white even:bg-slate-50/80 hover:bg-emerald-50/70 [&>td]:border-b [&>td]:border-slate-100 [&>td]:px-4 [&>td]:py-4 [&>td]:text-sm [&>td]:text-slate-700"
                >
                  <td>{{ computer.marca }}</td>
                  <td>{{ computer.serial }}</td>
                  <td :title="computer.ownerDocument" class="cursor-help font-semibold text-slate-900">{{ computer.ownerName }}</td>
                  <td class="font-semibold text-slate-900">{{ computer.borrowerName }}</td>
                  <td :title="computer.borrowerName" class="cursor-help">{{ computer.borrowerDocument }}</td>
                  <td>{{ computer.firmaIngreso ? 'Registrada' : 'Sin firma' }}</td>
                </tr>
              </tbody>

              <tbody v-else>
                <tr
                  v-for="vehicle in filteredVehicles"
                  :key="`${vehicle.borrowerId}-${vehicle.placa}`"
                  class="text-center align-middle transition odd:bg-white even:bg-slate-50/80 hover:bg-emerald-50/70 [&>td]:border-b [&>td]:border-slate-100 [&>td]:px-4 [&>td]:py-4 [&>td]:text-sm [&>td]:text-slate-700"
                >
                  <td>{{ vehicle.tipo }}</td>
                  <td>{{ vehicle.placa }}</td>
                  <td>{{ vehicle.modelo }}</td>
                  <td :title="vehicle.ownerDocument" class="cursor-help font-semibold text-slate-900">{{ vehicle.ownerName }}</td>
                  <td class="font-semibold text-slate-900">{{ vehicle.borrowerName }}</td>
                  <td :title="vehicle.borrowerName" class="cursor-help">{{ vehicle.borrowerDocument }}</td>
                  <td>{{ vehicle.firmaIngreso ? 'Registrada' : 'Sin firma' }}</td>
                </tr>
              </tbody>
            </table>

            <div v-if="activeVisibleCount === 0" class="px-4 py-10 text-center text-sm font-medium text-slate-500">
              No hay maquinas prestadas para la vista actual.
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import ExitButton from '@/components/UI/ExitButton.vue'
import SearchBar from '@/components/UI/SearchBar.vue'
import HeaderView from '@/layouts/HeaderView.vue'
import { useAuthStore } from '@/stores/auth'
import {
  getAdminBorrowedAssets,
  type BorrowedComputerRow,
  type BorrowedVehicleRow,
} from '@/Services/adminBorrowedAssets'

type BorrowedView = 'computers' | 'vehicles'

type SummaryCard = {
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

const auth = useAuthStore()
const selectedView = ref<BorrowedView>('computers')
const search = ref('')
const computers = ref<BorrowedComputerRow[]>([])
const vehicles = ref<BorrowedVehicleRow[]>([])
const isLoading = ref(false)
const loadError = ref('')

const matchesSearch = (value: string | number | null | undefined, term: string) =>
  String(value ?? '').toLowerCase().includes(term)

const searchTerm = computed(() => search.value.trim().toLowerCase())

const filteredComputers = computed(() => {
  if (!searchTerm.value) return computers.value

  return computers.value.filter((row) =>
    [
      row.marca,
      row.serial,
      row.ownerName,
      row.borrowerName,
      row.borrowerDocument,
      row.borrowerId,
    ].some((value) => matchesSearch(value, searchTerm.value))
  )
})

const filteredVehicles = computed(() => {
  if (!searchTerm.value) return vehicles.value

  return vehicles.value.filter((row) =>
    [
      row.tipo,
      row.placa,
      row.modelo,
      row.ownerName,
      row.borrowerName,
      row.borrowerDocument,
      row.borrowerId,
    ].some((value) => matchesSearch(value, searchTerm.value))
  )
})

const selectedViewLabel = computed(() =>
  selectedView.value === 'computers' ? 'Computadores' : 'Vehiculos'
)

const selectedViewTitle = computed(() =>
  selectedView.value === 'computers'
    ? 'Prestamos activos de computadores'
    : 'Prestamos activos de vehiculos'
)

const selectedViewDescription = computed(() =>
  selectedView.value === 'computers'
    ? 'Consulta quien presta cada computador y el aprendiz que actualmente lo tiene registrado.'
    : 'Revisa el flujo de vehiculos prestados, su propietario y el aprendiz que los recibe.'
)

const heroAccentClass = computed(() =>
  selectedView.value === 'computers'
    ? 'bg-[linear-gradient(135deg,#0d7a3b_0%,#1a8e52_60%,#166534_100%)]'
    : 'bg-[linear-gradient(135deg,#0f172a_0%,#1f2937_55%,#0d7a3b_100%)]'
)

const activeSearchPlaceholder = computed(() =>
  selectedView.value === 'computers'
    ? 'Busca por serial, propietario, receptor o documento...'
    : 'Busca por placa, tipo, propietario, receptor o documento...'
)

const activeVisibleCount = computed(() =>
  selectedView.value === 'computers' ? filteredComputers.value.length : filteredVehicles.value.length
)

const activeBorrowerCount = computed(() => {
  const ids = selectedView.value === 'computers'
    ? filteredComputers.value.map((row) => row.borrowerId)
    : filteredVehicles.value.map((row) => row.borrowerId)

  return new Set(ids).size
})

const summaryCards = computed<SummaryCard[]>(() => [
  {
    label: 'Computadores prestados',
    eyebrow: 'Prestamo',
    value: computers.value.length,
    description: 'Total de computadores actualmente prestados.',
    badge: 'PC',
    cardClass: 'border-emerald-200 bg-white',
    eyebrowClass: 'text-senaColor',
    badgeClass: 'bg-senaColor text-white',
    titleClass: 'text-slate-900',
    valueClass: 'text-senaColor',
    descriptionClass: 'text-slate-600',
  },
  {
    label: 'Vehiculos prestados',
    eyebrow: 'Prestamo',
    value: vehicles.value.length,
    description: 'Total de vehiculos actualmente prestados.',
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
    description: `Prestamos visibles en ${selectedViewLabel.value.toLowerCase()}.`,
    badge: 'ON',
    cardClass: 'border-emerald-100 bg-emerald-50',
    eyebrowClass: 'text-senaColor',
    badgeClass: 'bg-white text-senaColor',
    titleClass: 'text-slate-900',
    valueClass: 'text-senaColor',
    descriptionClass: 'text-slate-600',
  },
  {
    label: 'Receptores unicos',
    eyebrow: 'Cruce actual',
    value: activeBorrowerCount.value,
    description: 'Aprendices que reciben maquinas en la vista seleccionada.',
    badge: 'ID',
    cardClass: 'border-slate-900 bg-slate-900 text-white',
    eyebrowClass: 'text-emerald-200',
    badgeClass: 'bg-white text-slate-900',
    titleClass: 'text-white',
    valueClass: 'text-white',
    descriptionClass: 'text-slate-300',
  },
])

const loadBorrowedAssets = async () => {
  if (!auth.token) {
    loadError.value = 'No hay sesion activa para consultar prestamos administrativos.'
    return
  }

  isLoading.value = true
  loadError.value = ''

  try {
    const data = await getAdminBorrowedAssets(auth.token)
    computers.value = data.computers
    vehicles.value = data.vehicles
  } catch (error) {
    console.error(error)
    loadError.value = error instanceof Error
      ? error.message
      : 'No fue posible cargar las maquinas prestadas.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadBorrowedAssets)
</script>
