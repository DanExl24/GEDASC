<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#f5fbf5_0%,#ffffff_45%,#eef6f0_100%)] text-slate-800">
    <HeaderView
      HeaderTitle="CENTRO DE REPORTES"
      eyebrow="SENA | Preparacion de consultas"
    />

    <section class="sticky top-[89px] z-20 border-b border-emerald-100 bg-white/95 backdrop-blur-sm shadow-[0_12px_30px_rgba(15,107,63,0.06)]">
      <div class="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 lg:px-8">
        <div class="flex items-center gap-4 flex-wrap">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Flujo</p>
            <h1 class="mt-0.5 font-robotoSlab text-xl font-bold text-slate-900">
              Módulo de Reportes
            </h1>
          </div>

          <!-- Selector de Pestañas: Reportes Sencillos vs Avanzados -->
          <div class="flex gap-1.5 rounded-2xl bg-slate-100 p-1.5 border border-slate-200">
            <button
              type="button"
              :class="moduleTab === 'sencillos' ? 'bg-white text-emerald-950 shadow-sm font-bold border border-emerald-200' : 'text-slate-600 hover:text-slate-900 font-semibold'"
              class="flex items-center gap-2 rounded-xl px-4 py-2 text-xs transition"
              @click="moduleTab = 'sencillos'"
            >
              📊 Reportes sencillos
            </button>

            <button
              type="button"
              :class="moduleTab === 'avanzados' ? 'bg-emerald-700 text-white shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900 font-semibold'"
              class="flex items-center gap-2 rounded-xl px-4 py-2 text-xs transition"
              @click="moduleTab = 'avanzados'"
            >
              ⚡ Reportes avanzados
            </button>
          </div>
        </div>

        <ExitButton
          to="/"
          button-class="flex h-11 w-11 items-center justify-center self-center rounded-2xl border border-emerald-200 bg-white shadow-none transition-transform duration-300 hover:scale-105"
        />
      </div>
    </section>

    <main class="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 lg:px-8">
      <!-- 1. REPORTES SENCILLOS TAB -->
      <template v-if="moduleTab === 'sencillos'">
        <section class="grid gap-4 xl:grid-cols-[1.15fr_0.85fr] items-start">
          <article class="overflow-hidden rounded-[28px] border border-emerald-200 bg-white shadow-[0_18px_45px_rgba(15,107,63,0.08)]">
            <div class="bg-[linear-gradient(135deg,#0d7a3b_0%,#1a8e52_55%,#0f172a_100%)] px-5 py-4 text-white lg:px-6">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
                Punto único de configuración
              </p>
              <h2 class="mt-1 font-robotoSlab text-[1.6rem] font-bold leading-tight">
                Prepara la consulta antes de exportar
              </h2>
              <p class="mt-1 max-w-3xl text-xs leading-5 text-emerald-50/90">
                Selecciona el tipo de reporte que deseas consultar o exportar (operativo o catálogos maestros).
              </p>
            </div>

            <div class="grid gap-3 p-4 md:grid-cols-2 lg:px-5 lg:py-4 max-h-[500px] overflow-y-auto pr-1">
              <button
                v-for="report in reportCards"
                :key="report.id"
                type="button"
                :class="selectedReport.type === report.id ? 'ring-2 ring-emerald-400 shadow-[0_12px_25px_rgba(15,107,63,0.15)] bg-emerald-50/30' : 'hover:-translate-y-0.5'"
                class="rounded-[20px] border p-3.5 text-left transition"
                @click="selectedReport.type = report.id"
              >
                <div
                  :class="report.accentClass"
                  class="rounded-[16px] border px-3.5 py-3 h-full flex flex-col justify-between"
                >
                  <div>
                    <div class="flex items-start justify-between gap-2">
                      <div>
                        <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {{ report.eyebrow }}
                        </p>
                        <h3 class="mt-1 font-robotoSlab text-base font-bold text-slate-900 leading-snug">
                          {{ report.title }}
                        </h3>
                      </div>
                      <div
                        :class="report.badgeClass"
                        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold uppercase tracking-[0.12em]"
                      >
                        {{ report.badge }}
                      </div>
                    </div>

                    <p class="mt-2 text-xs leading-relaxed text-slate-600">
                      {{ report.description }}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </article>

          <aside class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sticky top-[150px] self-start">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-senaColor">
              Configuración actual
            </p>
            <h2 class="mt-2 font-robotoSlab text-2xl font-bold text-slate-900">
              {{ currentReportCard.title }}
            </h2>
            <p class="mt-2 text-sm leading-6 text-slate-600">
              {{ currentReportCard.description }}
            </p>

            <div class="mt-5 rounded-[22px] border border-emerald-100 bg-emerald-50 p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-senaColor">
                Filtros resumidos
              </p>
              <div class="mt-3 grid gap-2">
                <p
                  v-for="item in currentSummary"
                  :key="item"
                  class="rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700"
                >
                  {{ item }}
                </p>
              </div>
            </div>

            <button
              type="button"
              class="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-senaColor"
              @click="resetCurrentReportFilters"
            >
              Limpiar configuracion del reporte actual
            </button>

            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <BaseButtonOpen
                :image="recordPaper"
                text="Exportar a PDF"
                variant="danger"
                class-button="w-full"
                image-class="h-4 w-4 object-contain"
                @click="exportPDF"
              />

              <BaseButtonOpen
                :image="sendComputer"
                text="Exportar a Excel"
                variant="green"
                class-button="w-full"
                image-class="h-4 w-4 object-contain"
                @click="exportEXCEL"
              />
            </div>
          </aside>
        </section>

        <section class="rounded-[28px] border border-emerald-200 bg-white shadow-[0_18px_45px_rgba(15,107,63,0.08)]">
          <div class="flex flex-col gap-1 border-b border-emerald-100 px-5 py-4 lg:flex-row lg:items-end lg:justify-between lg:px-6">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-senaColor">Formulario dinamico</p>
              <h2 class="mt-1 font-robotoSlab text-[1.45rem] font-bold text-slate-900">
                Filtros para {{ currentReportCard.title.toLowerCase() }}
              </h2>
            </div>
            <p class="text-sm text-slate-500">
              Ajusta aqui los datos que luego usaras para exportar la tabla correspondiente.
            </p>
          </div>

          <div class="p-4 lg:px-6 lg:py-5">
            <RecordReportFilterForm
              v-model="filters"
              :fields="reportFields"
            />
          </div>
        </section>
      </template>

      <!-- 2. REPORTES AVANZADOS TAB -->
      <template v-else-if="moduleTab === 'avanzados'">
        <AdvancedReportsSection />
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import HeaderView from '@/layouts/HeaderView.vue'
import BaseButtonOpen from '@/components/Buttons/BaseButtonOpen.vue'
import ExitButton from '@/components/UI/ExitButton.vue'
import RecordReportFilterForm from '@/components/AprendizUI/Forms/RecordReportFilterForm.vue'
import AdvancedReportsSection from '@/components/AprendizUI/AdvancedReportsSection.vue'
import { useRecordReport } from '@/composables/History/useRecordReport'
import recordPaper from '@/assets/Icons/RecordPaper.png'
import sendComputer from '@/assets/Icons/SendComputer.png'
import { useExportPdf } from '@/Services/exports/usePdfExport'
import { exportToExcel } from '@/Services/exports/useExcelExport'
import { useAdminCatalogExports } from '@/Services/exports/useAdminCatalogExports'
import { getAdminAprendices } from '@/Services/adminAprendices'
import { getProgramas, getHorarios } from '@/Services/adminAcademic'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@/composables/useNotifications'

const moduleTab = ref<'sencillos' | 'avanzados'>('sencillos')

const auth = useAuthStore()
const { addNotification } = useNotifications()
const { exportAprendices, exportProgramas, exportHorarios } = useAdminCatalogExports()

const {
  reportCards,
  selectedReport,
  filters,
  reportFields,
  currentReportCard,
  currentSummary,
  resetCurrentReportFilters,
} = useRecordReport()

const { submitData, generatePDF } = useExportPdf(
  () => filters.value,
  selectedReport
)

const handleCatalogExport = async (format: 'pdf' | 'excel') => {
  try {
    if (selectedReport.type === 'aprendices') {
      if (!auth.token) return false
      const data = await getAdminAprendices(auth.token)
      let filtered = data
      if (filters.value.searchRegister) {
        const q = filters.value.searchRegister.toLowerCase().trim()
        filtered = data.filter(
          (a) =>
            a.nombre.toLowerCase().includes(q) ||
            a.apellido.toLowerCase().includes(q) ||
            a.documento.includes(q)
        )
      }
      exportAprendices(filtered, format)
      addNotification(`Reporte de Aprendices (${format.toUpperCase()}) generado`, 'info')
      return true
    }

    if (selectedReport.type === 'formaciones') {
      if (!auth.token) return false
      const data = await getProgramas(auth.token)
      exportProgramas(data, format)
      addNotification(`Reporte de Programas (${format.toUpperCase()}) generado`, 'info')
      return true
    }

    if (selectedReport.type === 'horarios') {
      if (!auth.token) return false
      const data = await getHorarios(auth.token)
      exportHorarios(data, format)
      addNotification(`Reporte de Horarios (${format.toUpperCase()}) generado`, 'info')
      return true
    }

    return false
  } catch (err) {
    console.error('Error al exportar catálogo:', err)
    addNotification('Error al generar la exportación del catálogo', 'error')
    return true
  }
}

const exportPDF = async () => {
  const handled = await handleCatalogExport('pdf')
  if (handled) return

  const data = await submitData()
  generatePDF(data)
  addNotification('Reporte PDF generado correctamente','info')
}

const exportEXCEL = async() => {
  const handled = await handleCatalogExport('excel')
  if (handled) return

  const data = await submitData()
  exportToExcel(data)
  addNotification('Archivo Excel generado correctamente','info')
}
</script>
