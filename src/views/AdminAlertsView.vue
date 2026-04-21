<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#f5fbf5_0%,#ffffff_45%,#eef6f0_100%)] text-slate-800">
    <HeaderView
      HeaderTitle="CENTRO DE ALERTAS"
      eyebrow="SENA | Vista administrativa"
    />

    <section class="sticky top-[89px] z-20 border-b border-emerald-100 bg-white/95 backdrop-blur-sm shadow-[0_12px_30px_rgba(15,107,63,0.06)]">
      <div class="mx-auto flex w-full max-w-7xl items-end justify-between gap-3 px-4 py-3 lg:px-8">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Monitoreo</p>
          <h1 class="mt-1 font-robotoSlab text-xl font-bold text-slate-900">
            Alertas por prestamos e inasistencias
          </h1>
        </div>

        <ExitButton
          to="/"
          button-class="flex h-11 w-11 items-center justify-center self-center rounded-2xl border border-emerald-200 bg-white shadow-none transition-transform duration-300 hover:scale-105"
        />
      </div>
    </section>

    <main class="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 lg:px-8 lg:py-5">
      <section class="grid gap-4 sm:grid-cols-3">
        <article class="rounded-[24px] border border-emerald-100 bg-white px-4 py-4 shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-senaColor">Alertas totales</p>
          <p class="mt-3 font-robotoSlab text-4xl font-bold text-senaColor">{{ alerts.length }}</p>
          <p class="mt-2 text-sm text-slate-600">Eventos administrativos detectados en la vista actual.</p>
        </article>

        <article class="rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Prestamos</p>
          <p class="mt-3 font-robotoSlab text-4xl font-bold text-slate-900">{{ borrowedAlertsCount }}</p>
          <p class="mt-2 text-sm text-slate-600">Alertas por maquinas prestadas entre aprendices.</p>
        </article>

        <article class="rounded-[24px] border border-slate-900 bg-slate-900 px-4 py-4 text-white shadow-[0_16px_35px_rgba(15,23,42,0.12)]">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">Inasistencia</p>
          <p class="mt-3 font-robotoSlab text-4xl font-bold text-white">{{ inactivityAlertsCount }}</p>
          <p class="mt-2 text-sm text-slate-300">Aprendices con 3 dias o mas sin asistir.</p>
        </article>
      </section>

      <section class="rounded-[28px] border border-emerald-200 bg-white shadow-[0_18px_45px_rgba(15,107,63,0.08)]">
        <div class="flex flex-col gap-1 border-b border-emerald-100 px-5 py-4 lg:flex-row lg:items-end lg:justify-between lg:px-6">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-senaColor">Notificaciones</p>
            <h2 class="mt-1 font-robotoSlab text-[1.45rem] font-bold text-slate-900">Alertas del sistema</h2>
          </div>
          <p class="text-sm text-slate-500">Solo se muestran prestamos detectados e inasistencias de 3 dias o mas.</p>
        </div>

        <div class="p-4 lg:px-6 lg:py-5">
          <div v-if="isLoading" class="rounded-[20px] border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm text-slate-600">
            Cargando centro de alertas...
          </div>

          <div v-else-if="loadError" class="rounded-[20px] border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-600">
            {{ loadError }}
          </div>

          <div v-else-if="alerts.length === 0" class="rounded-[20px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
            No hay alertas activas para mostrar.
          </div>

          <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <article
              v-for="alert in alerts"
              :key="alert.id"
              :class="alert.level === 'warning' ? 'border-amber-200 bg-[linear-gradient(180deg,#fff8eb_0%,#ffffff_100%)]' : 'border-emerald-100 bg-[linear-gradient(180deg,#f6fbf6_0%,#ffffff_100%)]'"
              class="rounded-[24px] border p-4 shadow-[0_16px_35px_rgba(15,23,42,0.06)]"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p
                    :class="alert.level === 'warning' ? 'text-amber-700' : 'text-senaColor'"
                    class="text-[11px] font-semibold uppercase tracking-[0.16em]"
                  >
                    {{ alert.type === 'BORROWED_MACHINE' ? 'Prestamo' : 'Inasistencia' }}
                  </p>
                  <h3 class="mt-2 font-robotoSlab text-lg font-bold text-slate-900">{{ alert.title }}</h3>
                </div>

                <div
                  :class="alert.level === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-senaColor'"
                  class="flex h-10 w-10 items-center justify-center rounded-xl text-[11px] font-bold uppercase tracking-[0.14em]"
                >
                  {{ alert.type === 'BORROWED_MACHINE' ? 'BRW' : 'ALT' }}
                </div>
              </div>

              <p class="mt-4 text-sm leading-6 text-slate-600">{{ alert.summary }}</p>

              <div class="mt-4 rounded-[18px] border border-slate-100 bg-white px-4 py-3">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Aprendiz</p>
                <p class="mt-1 font-semibold text-slate-900">{{ alert.subjectName }}</p>
                <p class="mt-1 text-sm text-slate-500">{{ alert.subjectDocument }}</p>
              </div>

              <div class="mt-4 space-y-2">
                <p
                  v-for="detail in alert.details"
                  :key="`${alert.id}-${detail.label}`"
                  class="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600"
                >
                  <span class="font-semibold text-slate-900">{{ detail.label }}:</span>
                  {{ detail.value }}
                </p>
              </div>

              <p class="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                {{ alert.timestampLabel }}
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import ExitButton from '@/components/UI/ExitButton.vue'
import HeaderView from '@/layouts/HeaderView.vue'
import { getAdminAlerts } from '@/Services/adminAlerts'
import { useAuthStore } from '@/stores/auth'
import type { AdminAlertItem } from '@/types/adminAlerts.types'

const auth = useAuthStore()
const alerts = ref<AdminAlertItem[]>([])
const isLoading = ref(false)
const loadError = ref('')

const borrowedAlertsCount = computed(() =>
  alerts.value.filter((alert) => alert.type === 'BORROWED_MACHINE').length
)

const inactivityAlertsCount = computed(() =>
  alerts.value.filter((alert) => alert.type === 'INACTIVITY').length
)

const loadAlerts = async () => {
  if (!auth.token) {
    loadError.value = 'No hay sesion activa para consultar alertas administrativas.'
    return
  }

  isLoading.value = true
  loadError.value = ''

  try {
    alerts.value = await getAdminAlerts(auth.token)
  } catch (error) {
    console.error(error)
    loadError.value = error instanceof Error
      ? error.message
      : 'No fue posible cargar el centro de alertas.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadAlerts)
</script>
