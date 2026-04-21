<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#f5fbf5_0%,#ffffff_45%,#eef6f0_100%)] text-slate-800">
    <HeaderView
      HeaderTitle="APRENDICES Y ACTIVIDAD CTA"
      eyebrow="SENA | Vista administrativa"
    />

    <section class="sticky top-[89px] z-20 border-b border-emerald-100 bg-white/95 backdrop-blur-sm shadow-[0_12px_30px_rgba(15,107,63,0.06)]">
      <div class="mx-auto grid w-full max-w-7xl gap-3 px-4 py-3 lg:grid-cols-[1.35fr_0.75fr_auto] lg:items-end lg:px-8">
        <SearchBar
          v-model="search"
          label="Buscar aprendiz"
        />

        <BaseField
          v-model="inactiveDaysInput"
          type="number"
          label="Dias sin asistir"
          place-holder="Ej: 7"
        />

        <ExitButton
          to="/"
          button-class="flex h-11 w-11 items-center justify-center self-center rounded-2xl border border-emerald-200 bg-white shadow-none transition-transform duration-300 hover:scale-105"
        />
      </div>
    </section>

    <main class="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 lg:px-8 lg:py-5">
      <section class="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <article class="overflow-hidden rounded-[28px] border border-emerald-200 bg-white shadow-[0_18px_45px_rgba(15,107,63,0.08)]">
          <div class="bg-[linear-gradient(135deg,#0d7a3b_0%,#1a8e52_55%,#0f172a_100%)] px-5 py-5 text-white lg:px-6">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">Aprendices registrados</p>
            <h1 class="mt-2 font-robotoSlab text-[1.8rem] font-bold leading-tight">
              Seguimiento de actividad y maquinas por aprendiz
            </h1>
            <p class="mt-2 max-w-3xl text-sm leading-6 text-emerald-50/90">
              Consulta todos los aprendices registrados, su actividad acumulada en el CTA, el tiempo sin asistir
              y el detalle completo de sus maquinas registradas.
            </p>
          </div>

          <div class="grid gap-3 p-4 md:grid-cols-2 lg:px-6 lg:py-5">
            <div class="rounded-[20px] border border-emerald-100 bg-emerald-50 px-4 py-3">
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-senaColor">Aprendices visibles</p>
                <p class="font-robotoSlab text-2xl font-bold text-senaColor">{{ filteredAprendices.length }}</p>
              </div>
              <p class="mt-1 text-sm text-slate-600">Registros que cumplen con la busqueda y el filtro de inactividad.</p>
            </div>

            <div class="rounded-[20px] border border-slate-200 bg-white px-4 py-3">
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-senaColor">Sin asistencia reciente</p>
                <p class="font-robotoSlab text-2xl font-bold text-slate-900">{{ inactiveCount }}</p>
              </div>
              <p class="mt-1 text-sm text-slate-600">Aprendices con ausencia mayor al filtro actual.</p>
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
            <h2 class="mt-1 font-robotoSlab text-[1.45rem] font-bold text-slate-900">Aprendices registrados</h2>
          </div>
          <p class="text-sm text-slate-500">
            {{ inactiveDays > 0 ? `Filtro activo: ${inactiveDays} dias o mas sin asistir.` : 'Sin filtro de inactividad aplicado.' }}
          </p>
        </div>

        <div class="p-4 lg:px-6 lg:py-5">
          <div v-if="isLoading" class="rounded-[20px] border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm text-slate-600">
            Cargando aprendices administrativos...
          </div>

          <div v-else-if="loadError" class="rounded-[20px] border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-600">
            {{ loadError }}
          </div>

          <div v-else class="overflow-x-auto rounded-[24px] border border-slate-100 bg-slate-50/70 p-2">
            <table class="w-full border-separate border-spacing-0 font-quicksand">
              <thead>
                <tr class="bg-slate-900 text-center">
                  <th class="rounded-l-2xl bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Nombre</th>
                  <th class="bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Apellido</th>
                  <th class="bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Documento</th>
                  <th class="bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Actividad</th>
                  <th class="bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Sin asistir</th>
                  <th class="rounded-r-2xl bg-slate-900 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Maquinas</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="aprendiz in filteredAprendices"
                  :key="aprendiz.id_aprendiz"
                  class="text-center align-middle transition odd:bg-white even:bg-slate-50/80 hover:bg-emerald-50/70 [&>td]:border-b [&>td]:border-slate-100 [&>td]:px-4 [&>td]:py-4 [&>td]:text-sm [&>td]:text-slate-700"
                >
                  <td class="font-semibold text-slate-900">{{ aprendiz.nombre }}</td>
                  <td>{{ aprendiz.apellido }}</td>
                  <td>{{ aprendiz.documento }}</td>
                  <td>
                    <div class="space-y-1 text-left">
                      <p class="font-semibold text-slate-900">{{ formatActivity(aprendiz.horas_reales, aprendiz.total_sesiones) }}</p>
                      <p class="text-xs text-slate-500">{{ formatDaysActive(aprendiz.inactiveDays, aprendiz.ultima_visita) }}</p>
                    </div>
                  </td>
                  <td>
                    <span
                      :class="aprendiz.inactiveDays >= 7 ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-senaColor'"
                      class="inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]"
                    >
                      {{ formatInactivity(aprendiz.inactiveDays, aprendiz.ultima_visita) }}
                    </span>
                  </td>
                  <td>
                    <BaseButtonOpen
                      text="Ver detalle"
                      variant="ghost"
                      class-button="min-h-0 px-0 py-0 font-semibold shadow-none"
                      @click="openMachinesModal(aprendiz)"
                    />
                  </td>
                </tr>

                <tr v-if="filteredAprendices.length === 0">
                  <td colspan="6" class="px-4 py-6 text-center text-sm text-slate-500">
                    No hay aprendices para los filtros actuales.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>

    <BaseModal
      ref="machinesModal"
      title="Detalle de maquinas del aprendiz"
      modal-class="my-6 w-full max-w-5xl overflow-hidden rounded-[24px] border border-emerald-100 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
      header-class="relative flex items-center justify-center border-b border-emerald-100 bg-[linear-gradient(90deg,#ffffff_0%,#f3fbf5_40%,#e2f4e6_100%)] px-5 py-4 text-center font-robotoSlab text-lg font-bold text-slate-800"
      body-class="relative max-h-[calc(100vh-8rem)] space-y-4 overflow-y-auto px-4 py-4 lg:px-5"
    >
      <template v-if="selectedAprendiz">
        <section class="rounded-[22px] border border-emerald-100 bg-emerald-50 px-4 py-4">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-senaColor">Aprendiz seleccionado</p>
          <h3 class="mt-2 font-robotoSlab text-lg font-bold text-slate-900">
            {{ selectedAprendiz.nombre }} {{ selectedAprendiz.apellido }}
          </h3>
          <p class="mt-1 text-sm text-slate-600">Documento: {{ selectedAprendiz.documento }}</p>
        </section>

        <div v-if="machinesLoading" class="rounded-[18px] border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm text-slate-600">
          Cargando maquinas del aprendiz...
        </div>

        <div v-else-if="machinesError" class="rounded-[18px] border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-600">
          {{ machinesError }}
        </div>

        <div v-else-if="selectedMachines.length === 0" class="rounded-[18px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
          Este aprendiz no tiene maquinas registradas.
        </div>

        <div v-else class="grid gap-3">
          <article
            v-for="(machine, index) in selectedMachines"
            :key="`${selectedAprendiz.id_aprendiz}-${index}`"
            class="rounded-[20px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f7faf8_100%)] p-4"
          >
            <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p
                  :class="machineBadgeClass(machine)"
                  class="inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]"
                >
                  {{ getMachineRole(machine) }}
                </p>
                <h4 class="mt-3 font-robotoSlab text-lg font-bold text-slate-900">
                  {{ machine.pc ? 'Computador registrado' : 'Vehiculo registrado' }}
                </h4>
              </div>
            </div>

            <div class="mt-4 grid gap-3 md:grid-cols-3">
              <template v-if="machine.pc">
                <div class="rounded-xl bg-slate-50 px-3 py-3">
                  <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Marca</p>
                  <p class="mt-1 text-sm font-semibold text-slate-900">{{ machine.pc.marca || '-' }}</p>
                </div>
                <div class="rounded-xl bg-slate-50 px-3 py-3">
                  <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Serial</p>
                  <p class="mt-1 text-sm font-semibold text-slate-900">{{ machine.pc.serial || '-' }}</p>
                </div>
                <div class="rounded-xl bg-slate-50 px-3 py-3">
                  <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Estado</p>
                  <p class="mt-1 text-sm font-semibold text-slate-900">{{ getMachineRole(machine) }}</p>
                </div>
              </template>

              <template v-else-if="machine.vh">
                <div class="rounded-xl bg-slate-50 px-3 py-3">
                  <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Tipo</p>
                  <p class="mt-1 text-sm font-semibold text-slate-900">{{ machine.vh.tipo_vehiculo || '-' }}</p>
                </div>
                <div class="rounded-xl bg-slate-50 px-3 py-3">
                  <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Marca</p>
                  <p class="mt-1 text-sm font-semibold text-slate-900">{{ machine.vh.marca || '-' }}</p>
                </div>
                <div class="rounded-xl bg-slate-50 px-3 py-3">
                  <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Placa</p>
                  <p class="mt-1 text-sm font-semibold text-slate-900">{{ machine.vh.placa || '-' }}</p>
                </div>
              </template>
            </div>
          </article>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import BaseButtonOpen from '@/components/Buttons/BaseButtonOpen.vue'
import BaseField from '@/components/Forms/BaseField.vue'
import BaseModal from '@/components/Modals/BaseModal.vue'
import ExitButton from '@/components/UI/ExitButton.vue'
import SearchBar from '@/components/UI/SearchBar.vue'
import HeaderView from '@/layouts/HeaderView.vue'
import { useAuthStore } from '@/stores/auth'
import {
  getAdminAprendices,
  getAdminMachinesByAprendiz,
  getAdminTrack,
  type AdminAprendizRow,
  type AdminMachineRecord,
  type AdminTrackRow,
} from '@/Services/adminAprendices'

type SummaryCard = {
  label: string
  eyebrow: string
  value: number | string
  description: string
  badge: string
  cardClass: string
  eyebrowClass: string
  badgeClass: string
  titleClass: string
  valueClass: string
  descriptionClass: string
}

type AprendizWithActivity = AdminAprendizRow & {
  total_sesiones: number
  dias_activos: number
  horas_reales: number
  ultima_visita: string | null
  inactiveDays: number
}

const auth = useAuthStore()
const search = ref('')
const inactiveDaysInput = ref('')
const isLoading = ref(false)
const loadError = ref('')
const aprendices = ref<AprendizWithActivity[]>([])
const machinesModal = ref<{
  openModal: () => void
  closeModal: () => void
} | null>(null)
const selectedAprendiz = ref<AprendizWithActivity | null>(null)
const selectedMachines = ref<AdminMachineRecord[]>([])
const machinesLoading = ref(false)
const machinesError = ref('')

const inactiveDays = computed(() => {
  const parsed = Number.parseInt(inactiveDaysInput.value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
})

const calculateInactiveDays = (lastVisit: string | null) => {
  if (!lastVisit) return Number.POSITIVE_INFINITY

  const now = new Date()
  const last = new Date(lastVisit)

  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const lastDate = new Date(last.getFullYear(), last.getMonth(), last.getDate())
  const diff = todayDate.getTime() - lastDate.getTime()

  return Math.max(Math.floor(diff / (1000 * 60 * 60 * 24)), 0)
}

const searchTerm = computed(() => search.value.trim().toLowerCase())

const filteredAprendices = computed(() => {
  return aprendices.value.filter((aprendiz) => {
    const matchesSearch = !searchTerm.value || [
      aprendiz.nombre,
      aprendiz.apellido,
      aprendiz.documento
    ].some((value) => String(value).toLowerCase().includes(searchTerm.value))

    const matchesInactiveDays =
      inactiveDays.value <= 0 ||
      !Number.isFinite(aprendiz.inactiveDays) ||
      aprendiz.inactiveDays >= inactiveDays.value

    return matchesSearch && matchesInactiveDays
  })
})

const inactiveCount = computed(() =>
  filteredAprendices.value.filter((aprendiz) =>
    inactiveDays.value > 0 &&
    (!Number.isFinite(aprendiz.inactiveDays) || aprendiz.inactiveDays >= inactiveDays.value)
  ).length
)

const summaryCards = computed<SummaryCard[]>(() => [
  {
    label: 'Aprendices totales',
    eyebrow: 'Base administrativa',
    value: aprendices.value.length,
    description: 'Todos los aprendices registrados en la base de datos.',
    badge: 'ALL',
    cardClass: 'border-emerald-200 bg-white',
    eyebrowClass: 'text-senaColor',
    badgeClass: 'bg-senaColor text-white',
    titleClass: 'text-slate-900',
    valueClass: 'text-senaColor',
    descriptionClass: 'text-slate-600',
  },
  {
    label: 'Visibles',
    eyebrow: 'Filtro actual',
    value: filteredAprendices.value.length,
    description: 'Aprendices que cumplen con la busqueda y el filtro activo.',
    badge: 'ON',
    cardClass: 'border-slate-200 bg-white',
    eyebrowClass: 'text-slate-500',
    badgeClass: 'bg-slate-900 text-white',
    titleClass: 'text-slate-900',
    valueClass: 'text-slate-900',
    descriptionClass: 'text-slate-600',
  },
  {
    label: 'Nunca han asistido',
    eyebrow: 'Seguimiento',
    value: aprendices.value.filter((aprendiz) => !aprendiz.ultima_visita).length,
    description: 'Aprendices sin una ultima visita registrada en el CTA.',
    badge: 'NEW',
    cardClass: 'border-emerald-100 bg-emerald-50',
    eyebrowClass: 'text-senaColor',
    badgeClass: 'bg-white text-senaColor',
    titleClass: 'text-slate-900',
    valueClass: 'text-senaColor',
    descriptionClass: 'text-slate-600',
  },
  {
    label: 'Mayor ausencia',
    eyebrow: 'Inactividad',
    value: getMaxInactiveDays(aprendices.value),
    description: 'Mayor cantidad de dias sin asistir detectada en la lista.',
    badge: 'DAY',
    cardClass: 'border-slate-900 bg-slate-900 text-white',
    eyebrowClass: 'text-emerald-200',
    badgeClass: 'bg-white text-slate-900',
    titleClass: 'text-white',
    valueClass: 'text-white',
    descriptionClass: 'text-slate-300',
  },
])

function getMaxInactiveDays(rows: AprendizWithActivity[]) {
  const finiteDays = rows
    .map((row) => row.inactiveDays)
    .filter((value) => Number.isFinite(value))

  return finiteDays.length ? Math.max(...finiteDays) : 'N/A'
}

const formatActivity = (hours: number, sessions: number) => {
  const totalMinutes = Number.isFinite(hours) ? Math.max(Math.round(hours * 60), 0) : 0
  const timeLabel = totalMinutes === 0
    ? 'Sin actividad'
    : totalMinutes < 60
      ? `${totalMinutes} min activos`
      : `${(totalMinutes / 60).toFixed(1)} h activas`

  return `${timeLabel} | ${sessions} sesiones`
}

const formatDaysActive = (inactiveDaysValue: number, lastVisit: string | null) => {
  if (!lastVisit || !Number.isFinite(inactiveDaysValue)) {
    return 'Sin asistencia registrada'
  }

  if (inactiveDaysValue === 0) {
    return 'Asistencia hoy'
  }

  if (inactiveDaysValue === 1) {
    return '1 dia de inasistencia'
  }

  return `${inactiveDaysValue} dias de inasistencia`
}

const formatInactivity = (days: number, lastVisit: string | null) => {
  if (!lastVisit || !Number.isFinite(days)) {
    return 'Sin registros'
  }

  if (days === 0) return 'Activo en el CTA'
  if (days === 1) return '1 dia'

  return `${days} dias`
}

const machineBadgeClass = (machine: AdminMachineRecord) =>
  getMachineRole(machine) === 'PRINCIPAL'
    ? 'border-emerald-200 bg-emerald-50 text-senaColor'
    : 'border-slate-200 bg-slate-100 text-slate-700'

const getMachineRole = (machine: AdminMachineRecord) =>
  machine.pc?.estado || machine.vh?.estado || 'SECUNDARIO'

const loadAprendices = async () => {
  if (!auth.token) {
    loadError.value = 'No hay sesion activa para consultar aprendices administrativos.'
    return
  }

  isLoading.value = true
  loadError.value = ''

  try {
    const [aprendicesData, trackData] = await Promise.all([
      getAdminAprendices(auth.token),
      getAdminTrack(auth.token)
    ])

    console.log('Admin aprendices raw response', {
      aprendicesData,
      trackData
    })

    const trackMap = new Map(
      trackData.map((item: AdminTrackRow) => [
        item.id_aprendiz,
        {
          total_sesiones: Number(item.total_sesiones ?? 0),
          dias_activos: Number(item.dias_activos ?? 0),
          horas_reales: Number(item.horas_reales ?? 0),
          ultima_visita: item.ultima_visita ?? null
        }
      ])
    )

    aprendices.value = aprendicesData.map((aprendiz) => {
      const track = trackMap.get(aprendiz.id_aprendiz)
      const lastVisit = track?.ultima_visita ?? null

      return {
        ...aprendiz,
        total_sesiones: track?.total_sesiones ?? 0,
        dias_activos: track?.dias_activos ?? 0,
        horas_reales: track?.horas_reales ?? 0,
        ultima_visita: lastVisit,
        inactiveDays: calculateInactiveDays(lastVisit)
      }
    })

    console.log('Admin aprendices merged rows', aprendices.value)
  } catch (error) {
    console.error(error)
    loadError.value = error instanceof Error
      ? error.message
      : 'No fue posible cargar los aprendices administrativos.'
  } finally {
    isLoading.value = false
  }
}

const openMachinesModal = async (aprendiz: AprendizWithActivity) => {
  if (!auth.token) return

  selectedAprendiz.value = aprendiz
  selectedMachines.value = []
  machinesError.value = ''
  machinesLoading.value = true
  machinesModal.value?.openModal()

  try {
    selectedMachines.value = await getAdminMachinesByAprendiz(auth.token, aprendiz.id_aprendiz)
    console.log('Admin machines by aprendiz response', {
      aprendiz,
      machines: selectedMachines.value
    })
  } catch (error) {
    console.error(error)
    machinesError.value = error instanceof Error
      ? error.message
      : 'No fue posible cargar las maquinas del aprendiz.'
  } finally {
    machinesLoading.value = false
  }
}

onMounted(loadAprendices)
</script>
