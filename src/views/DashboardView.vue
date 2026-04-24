<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#f5fbf5_0%,#ffffff_48%,#f2f8f2_100%)] text-slate-800">
    <HeaderView
      HeaderTitle="DASHBOARD DE CONTROL DE ACCESO"
      eyebrow="SENA | Panel institucional"
    />

    <main class="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 lg:px-8 lg:py-5">
      <section class="grid items-start gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <article class="overflow-hidden rounded-[28px] border border-emerald-200 bg-white shadow-[0_18px_45px_rgba(15,107,63,0.08)] min-h-[620px]">
          <div class="grid gap-4 bg-[linear-gradient(120deg,#0f7b3d_0%,#169051_55%,#ffffff_55%,#ffffff_100%)] px-5 py-5 lg:grid-cols-[1.25fr_0.95fr] lg:px-6">
            <div class="text-white">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">{{ summaryEyebrow }}</p>
              <h1 class="mt-2 max-w-lg font-robotoSlab text-3xl font-bold leading-tight">{{ summaryTitle }}</h1>

              <div class="mt-4 flex flex-wrap gap-2">
                <span class="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">{{ primaryBadge }}</span>
                <span class="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">{{ secondaryBadge }}</span>
                <span class="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">{{ roleBadge }}</span>
              </div>
            </div>

            <div class="flex justify-end">
              <article class="rounded-[22px] border border-slate-200 bg-slate-900 px-4 py-4 text-white shadow-sm">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">Fecha operativa</p>
                <p class="mt-2 font-robotoSlab text-xl font-bold">{{ currentDateLabel }}</p>
                <p class="mt-2 text-xs text-slate-400">
                  Información actualizada en tiempo real del sistema.
                </p>
              </article>
            </div>
          </div>
          <article v-if="isAdmin" class="border border-emerald-200 bg-white shadow-[0_18px_45px_rgba(15,107,63,0.08)]">
            <div class="flex items-end justify-between gap-4 border-b border-emerald-100 px-5 py-5 lg:px-6">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-senaColor">Vista administrativa</p>
                <h2 class="mt-2 font-robotoSlab text-2xl font-bold text-slate-900">Estadisticas de aprendices registrados</h2>
              </div>
              <p class="text-sm text-slate-500">Corte trimestral y anual</p>
            </div>

            <div v-if="adminLoading" class="px-5 py-5 lg:px-6">
              <div class="inline-flex rounded-[20px] border border-emerald-100 bg-[linear-gradient(180deg,#ffffff_0%,#f6fbf6_100%)] px-4 py-3 text-sm font-medium text-slate-500">
                Cargando estadisticas administrativas...
              </div>
            </div>

            <div v-else-if="adminError" class="px-5 py-5 lg:px-6">
              <div class="rounded-[20px] border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {{ adminError }}
              </div>
            </div>

            <div v-else class="grid gap-4 p-5 lg:grid-cols-2 lg:p-6">
              <article class="rounded-[24px] border border-emerald-100 bg-[linear-gradient(180deg,#ffffff_0%,#f6fbf6_100%)] px-4 py-4">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.16em] text-senaColor">Trimestres</p>
                    <h3 class="mt-2 font-robotoSlab text-xl font-bold text-slate-900">Distribucion trimestral</h3>
                  </div>
                  <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-senaColor text-[11px] font-bold uppercase tracking-[0.14em] text-white">
                    QTR
                  </div>
                </div>

                <div v-if="quarterStats.length > 0" class="mt-5 space-y-4">
                  <div v-for="item in quarterStats" :key="item.trimestre" class="space-y-2">
                    <div class="flex items-center justify-between gap-3">
                      <p class="text-sm font-semibold text-slate-700">Trimestre {{ item.trimestre }}</p>
                      <p class="font-robotoSlab text-lg font-bold text-slate-900">{{ item.total }}</p>
                    </div>
                    <div class="h-2 overflow-hidden rounded-full bg-emerald-100">
                      <div class="h-full rounded-full bg-senaColor" :style="{ width: getBarWidth(item.total, quarterMaxTotal) }"></div>
                    </div>
                  </div>
                </div>

                <div v-else class="mt-5 rounded-[18px] border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-500">
                  No hay datos trimestrales disponibles.
                </div>
              </article>

              <article class="rounded-[24px] border border-slate-200 bg-slate-900 px-4 py-4 text-white">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">Anuales</p>
                    <h3 class="mt-2 font-robotoSlab text-xl font-bold text-white">Distribucion anual</h3>
                  </div>
                  <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[11px] font-bold uppercase tracking-[0.14em] text-slate-900">
                    YR
                  </div>
                </div>

                <div v-if="yearStats.length > 0" class="mt-5 space-y-4">
                  <div v-for="item in yearStats" :key="item.year" class="space-y-2">
                    <div class="flex items-center justify-between gap-3">
                      <p class="text-sm font-semibold text-slate-200">{{ item.year }}</p>
                      <p class="font-robotoSlab text-lg font-bold text-white">{{ item.total }}</p>
                    </div>
                    <div class="h-2 overflow-hidden rounded-full bg-slate-700">
                      <div class="h-full rounded-full bg-emerald-400" :style="{ width: getBarWidth(item.total, yearMaxTotal) }"></div>
                    </div>
                  </div>
                </div>

                <div v-else class="mt-5 rounded-[18px] border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-300">
                  No hay datos anuales disponibles.
                </div>
              </article>
            </div>
          </article>

          <article v-else class="border border-emerald-200 bg-white shadow-[0_18px_45px_rgba(15,107,63,0.08)]">
            <div class="flex items-end justify-between gap-4 border-b border-emerald-100 px-5 py-5 lg:px-6">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-senaColor">Actividad reciente</p>
                <h2 class="mt-2 font-robotoSlab text-2xl font-bold text-slate-900">Ultimos 4 registros del dia</h2>
              </div>
              <p class="text-sm text-slate-500">Lectura rapida</p>
            </div>

            <div v-if="activity.length > 0" class="grid gap-3 p-5 lg:grid-cols-2 lg:p-6">
              <article
                v-for="record in activity"
                :key="record.id"
                class="rounded-[20px] border border-emerald-100 bg-[linear-gradient(180deg,#ffffff_0%,#f6fbf6_100%)] px-4 py-4"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <div
                      :class="record.tipo === 'entrada' ? 'bg-senaColor text-white' : 'bg-slate-900 text-white'"
                      class="flex h-10 w-10 items-center justify-center rounded-xl text-[11px] font-bold uppercase tracking-[0.14em]"
                    >
                      {{ record.tipo === 'entrada' ? 'IN' : 'OUT' }}
                    </div>

                    <div>
                      <h3 class="font-robotoSlab text-md font-bold text-slate-900">{{ record.nombre }}</h3>
                      <p class="text-sm text-slate-500">{{ record.documento }}</p>
                    </div>
                  </div>

                  <span class="text-sm font-semibold text-slate-700">{{ record.hora }}</span>
                </div>

                <p class="mt-3 text-sm text-slate-600">{{ record.formacion }}</p>
                <p v-if="record.tiempo==0" class="mt-2 text-sm text-slate-500">Justo Ahora</p>
                <p v-else class="mt-2 text-sm text-slate-500">{{ formatTiempo(record.tiempo) }}</p>
              </article>
            </div>
            <div v-else class="px-5 py-5 lg:px-6">
              <div class="inline-flex rounded-[20px] border border-emerald-100 bg-[linear-gradient(180deg,#ffffff_0%,#f6fbf6_100%)] px-4 py-3 text-sm font-medium text-slate-500">
                Aun no hay registros.
              </div>
            </div>
          </article>
        </article>


        <section class="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <article
            v-for="stat in dashboardStats"
            :key="stat.id"
            :class="stat.accent === 'dark' ? 'border-slate-900 bg-slate-900 text-white' : 'border-emerald-100 bg-white text-slate-900'"
            class="rounded-[24px] border px-4 py-4 shadow-[0_16px_35px_rgba(15,23,42,0.06)]"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p
                  :class="stat.accent === 'dark' ? 'text-emerald-200' : 'text-senaColor'"
                  class="text-xs font-semibold uppercase tracking-[0.16em]"
                >
                  {{ stat.shortLabel }}
                </p>
                <h2
                  :class="stat.accent === 'dark' ? 'text-white' : 'text-slate-900'"
                  class="mt-2 font-robotoSlab text-lg font-bold"
                >
                  {{ stat.label }}
                </h2>
              </div>

              <div
                :class="stat.accent === 'dark' ? 'bg-white text-slate-900' : 'bg-senaColor text-white'"
                class="flex h-10 w-10 items-center justify-center rounded-xl text-[11px] font-bold uppercase tracking-[0.14em]"
              >
                {{ stat.icon }}
              </div>
            </div>

            <div class="mt-4 flex items-end justify-between gap-3">
              <p
                :class="stat.accent === 'dark' ? 'text-white' : 'text-senaColor'"
                class="font-robotoSlab text-4xl font-bold"
              >
                {{ stat.value }}
              </p>
              <p
                :class="stat.accent === 'dark' ? 'text-slate-300' : 'text-slate-500'"
                class="max-w-[10rem] text-right text-xs leading-5"
              >
                {{ stat.description }}
              </p>
            </div>
          </article>

          <article
            v-if="isAdmin"
            class="rounded-[24px] border border-emerald-100 bg-white px-4 py-4 shadow-[0_16px_35px_rgba(15,23,42,0.06)]"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-senaColor">
                  Jornada
                </p>
                <h2 class="mt-2 font-robotoSlab text-lg font-bold text-slate-900">
                  Horario operativo
                </h2>
              </div>

              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-senaColor text-[11px] font-bold uppercase tracking-[0.14em] text-white">
                HRS
              </div>
            </div>

            <div class="mt-4 space-y-3">
              <div class="rounded-[18px] border border-emerald-100 bg-[linear-gradient(180deg,#ffffff_0%,#f6fbf6_100%)] px-4 py-3">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-senaColor">Inicio</p>
                <p class="mt-1 font-robotoSlab text-2xl font-bold text-slate-900">6:00 AM</p>
              </div>

              <div class="rounded-[18px] border border-slate-200 bg-slate-900 px-4 py-3 text-white">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">Cierre</p>
                <p class="mt-1 font-robotoSlab text-2xl font-bold text-white">12:00 AM</p>
              </div>
            </div>
          </article>
        </section>
      </section>

      <section class="overflow-hidden rounded-[28px] border border-emerald-200 bg-[linear-gradient(180deg,#f8fcf8_0%,#eef7f0_100%)] shadow-[0_18px_45px_rgba(15,107,63,0.08)]">
        <div class="flex flex-col gap-1 border-b border-emerald-100 px-5 py-4 lg:flex-row lg:items-end lg:justify-between lg:px-6 bg-white/80">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-senaColor">Modulos del sistema</p>
            <h2 class="mt-2 font-robotoSlab text-2xl font-bold text-slate-900">Accesos principales</h2>
          </div>
          <p class="text-sm text-slate-500">{{ actionsSummary }}</p>
        </div>

        <div class="relative grid gap-4 p-4 md:grid-cols-2 lg:p-6 bg-[linear-gradient(180deg,rgba(255,255,255,0.72)_0%,rgba(244,250,245,0.94)_100%)]">
        <BaseCard
          v-for="(action, index) in dashboardActions"
          :key="action.title"
          :class="[
            index === dashboardActions.length - 1 && dashboardActions.length % 2 !== 0
              ? 'md:col-span-2'
              : ''
          ]"
          :title="action.title"
          :description="action.description"
          :eyebrow="action.eyebrow"
          :CardImg="action.icon"
          :ViewLink="action.to"
          :accentClass="action.accentClass"
        />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import HeaderView from '@/layouts/HeaderView.vue'
import registerPerson from '@/assets/Icons/registerPerson.png'
import ExitDoor from '@/assets/Icons/ExitDoor.png'
import RecordPaper from '@/assets/Icons/RecordPaper.png'
import SendComputer from '@/assets/Icons/SendComputer.png'
import Clock from '@/assets/Icons/Clock.png'
import { getActivity, type DashboardActivityItem } from '@/constants/optionsActivity'
import { getEstadisticas, type DashboardStatItem } from '@/constants/optionsStats'
import book from '@/assets/Icons/book.png'
import BaseCard from '@/components/Cards/BaseCard.vue'
import { useAuthStore } from '@/stores/auth'
import {
  getAdminDashboardStats,
  type AdminQuarterStat,
  type AdminYearStat,
} from '@/Services/adminStats'
interface DashboardAction {
  title: string
  eyebrow: string
  description: string
  to: string
  icon: string
  accentClass: string
}

const auth = useAuthStore()
const stats = ref<DashboardStatItem[]>([])
const activity = ref<DashboardActivityItem[]>([])
const quarterStats = ref<AdminQuarterStat[]>([])
const yearStats = ref<AdminYearStat[]>([])
const adminLoading = ref(false)
const adminError = ref('')
const currentDate = new Date()

const allDashboardActions: DashboardAction[] = [
  {
    title: 'Ingreso general',
    eyebrow: 'Registro',
    description: 'Entrada de aprendices al centro.',
    to: '/general-entry',
    icon: registerPerson,
    accentClass: 'bg-senaColor',
  },
  {
    title: 'Salida general',
    eyebrow: 'Control',
    description: 'Salida general de aprendices.',
    to: '/general-exit',
    icon: ExitDoor,
    accentClass: '!bg-[rgb(21,142,79)]',
  },
  {
    title: 'Historial general',
    eyebrow: 'Consulta',
    description: 'Consulta historica de movimientos.',
    to: '/general-history',
    icon: RecordPaper,
    accentClass: 'bg-slate-900',
  },
  {
    title: 'Equipos y vehiculos',
    eyebrow: 'Activos',
    description: 'Consulta unificada de computadores y vehiculos registrados.',
    to: '/assets-history',
    icon: SendComputer,
    accentClass: '!bg-senaColor',
  },
  {
    title: 'Reportes y Estadisticas',
    eyebrow: 'Informes',
    description: 'Consulta reportes y estadisticas de los aprendices.',
    to: '/record-history',
    icon: book,
    accentClass: '!bg-[rgb(21,142,79)]',
  },
  {
    title: 'Correccion de registros',
    eyebrow: 'Admin',
    description: 'Eliminacion segura de ingresos y salidas con validacion administrativa.',
    to: '/admin-record-control',
    icon: ExitDoor,
    accentClass: 'bg-slate-900',
  },
  {
    title: 'Maquinas prestadas',
    eyebrow: 'Admin',
    description: 'Consulta las maquinas prestadas, quien las presta y el aprendiz que las recibe.',
    to: '/admin-borrowed-assets',
    icon: SendComputer,
    accentClass: '!bg-[rgb(21,142,79)]',
  },
  {
    title: 'Aprendices y actividad',
    eyebrow: 'Admin',
    description: 'Consulta todos los aprendices, su actividad en el CTA y el detalle completo de sus maquinas.',
    to: '/admin-aprendices',
    icon: RecordPaper,
    accentClass: 'bg-slate-900',
  },
  {
    title: 'Centro de alertas',
    eyebrow: 'Admin',
    description: 'Notificaciones por prestamos de maquinas e inasistencias prolongadas en el CTA.',
    to: '/admin-alerts',
    icon: Clock,
    accentClass: 'bg-senaColor',
  },
]

const isAdmin = computed(() => auth.isAdmin)
const isCelador = computed(() => auth.isCelador)

const formatTiempo = (min : number) => {
  if (min < 1) return 'Justo ahora'
  if (min < 60) return `Hace ${min} minutos`

  const horas = Math.floor(min / 60)
  const minutos = min % 60

  if (horas < 24) {
    return minutos > 0
      ? `Hace ${horas}h ${minutos}min`
      : `Hace ${horas}h`
  }

  const dias = Math.floor(horas / 24)
  return `Hace ${dias} día${dias > 1 ? 's' : ''}`
}

const currentDateLabel = computed(() =>
  new Intl.DateTimeFormat('es-CO', { dateStyle: 'full' }).format(currentDate),
)

const summaryEyebrow = computed(() =>
  isAdmin.value ? 'Panel administrativo' : 'Resumen general'
)

const summaryTitle = computed(() =>
  isAdmin.value
    ? 'Vision ejecutiva del acceso institucional'
    : 'Control central del acceso institucional'
)

const primaryBadge = computed(() =>
  isAdmin.value ? 'Analitica historica' : '4 vistas operativas'
)

const secondaryBadge = computed(() =>
  isAdmin.value ? 'Corte trimestral y anual' : 'Monitoreo diario'
)

const roleBadge = computed(() =>
  isAdmin.value ? 'Rol ADMIN' : isCelador.value ? 'Rol CELADOR' : 'Sin rol'
)

const quarterMaxTotal = computed(() =>
  Math.max(...quarterStats.value.map((item) => item.total), 0)
)

const yearMaxTotal = computed(() =>
  Math.max(...yearStats.value.map((item) => item.total), 0)
)

const dashboardStats = computed<DashboardStatItem[]>(() =>
  isAdmin.value
    ? stats.value.filter((stat) => stat.id === 'entriesToday' || stat.id === 'exitsToday')
    : stats.value
)

const dashboardActions = computed(() => {
  if (!isAdmin.value) {
    return allDashboardActions.filter((action) =>
      action.to !== '/admin-record-control' &&
      action.to !== '/admin-borrowed-assets' &&
      action.to !== '/admin-aprendices' &&
      action.to !== '/admin-alerts'
    )
  }

  return allDashboardActions.filter((action) =>
    action.to !== '/general-entry' && action.to !== '/general-exit'
  )
})

const actionsSummary = computed(() =>
  `${dashboardActions.value.length} vistas operativas del sistema en acceso directo.`
)

const getBarWidth = (value: number, max: number) => {
  if (max <= 0) return '0%'
  return `${Math.max((value / max) * 100, 8)}%`
}

onMounted(async () => {
  if (isAdmin.value && auth.token) {
    adminLoading.value = true

    try {
      const [adminStatsData, baseStatsData] = await Promise.all([
        getAdminDashboardStats(auth.token),
        getEstadisticas()
      ])
      quarterStats.value = adminStatsData.quarterStats
      yearStats.value = adminStatsData.yearStats
      stats.value = baseStatsData
      adminError.value = ''
    } catch (error) {
      console.error(error)
      adminError.value = 'No fue posible cargar las estadisticas administrativas.'
    } finally {
      adminLoading.value = false
    }

    return
  }

  const [statsData, activityData] = await Promise.all([getEstadisticas(), getActivity()])
  stats.value = statsData
  activity.value = activityData
})
</script>

<style scoped>
</style>
