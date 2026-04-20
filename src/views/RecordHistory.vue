<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#f5fbf5_0%,#ffffff_45%,#eef6f0_100%)] text-slate-800">
    <HeaderView
      HeaderTitle="CENTRO DE REPORTES"
      eyebrow="SENA | Preparacion de consultas"
    />

    <section class="sticky top-[89px] z-20 border-b border-emerald-100 bg-white/95 backdrop-blur-sm shadow-[0_12px_30px_rgba(15,107,63,0.06)]">
      <div class="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 lg:px-8">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Flujo</p>
          <h1 class="mt-1 font-robotoSlab text-xl font-bold text-slate-900">
            Selecciona el reporte y configura sus filtros
          </h1>
        </div>

        <ExitButton
          to="/"
          button-class="flex h-11 w-11 items-center justify-center self-center rounded-2xl border border-emerald-200 bg-white shadow-none transition-transform duration-300 hover:scale-105"
        />
      </div>
    </section>

    <main class="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 lg:px-8">
      <section class="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <article class="overflow-hidden rounded-[28px] border border-emerald-200 bg-white shadow-[0_18px_45px_rgba(15,107,63,0.08)]">
          <div class="bg-[linear-gradient(135deg,#0d7a3b_0%,#1a8e52_55%,#0f172a_100%)] px-5 py-5 text-white lg:px-6">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
              Punto unico de configuracion
            </p>
            <h2 class="mt-2 font-robotoSlab text-[1.8rem] font-bold leading-tight">
              Prepara la consulta antes de exportar
            </h2>
            <p class="mt-2 max-w-3xl text-sm leading-6 text-emerald-50/90">
              Esta vista solo organiza el tipo de reporte y los filtros de tabla que vas a usar.
              La exportacion a PDF o Excel se conecta despues sobre esta misma configuracion.
            </p>
          </div>

          <div class="grid gap-3 p-4 md:grid-cols-2 lg:px-6 lg:py-5">
            <button
              v-for="report in reportCards"
              :key="report.id"
              type="button"
              :class="selectedReport.type === report.id ? 'ring-2 ring-emerald-300 shadow-[0_16px_35px_rgba(15,107,63,0.12)]' : 'hover:-translate-y-0.5'"
              class="rounded-[24px] border p-4 text-left transition"
              @click="selectedReport.type = report.id"
            >
              <div
                :class="report.accentClass"
                class="rounded-[20px] border px-4 py-4"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {{ report.eyebrow }}
                    </p>
                    <h3 class="mt-2 font-robotoSlab text-lg font-bold text-slate-900">
                      {{ report.title }}
                    </h3>
                  </div>
                  <div
                    :class="report.badgeClass"
                    class="flex h-10 w-10 items-center justify-center rounded-xl text-[11px] font-bold uppercase tracking-[0.14em]"
                  >
                    {{ report.badge }}
                  </div>
                </div>

                <p class="mt-4 text-sm leading-5 text-slate-600">
                  {{ report.description }}
                </p>
              </div>
            </button>
          </div>
        </article>

        <aside class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-senaColor">
            Configuracion actual
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
    </main>
  </div>
</template>

<script setup lang="ts">

import HeaderView from '@/layouts/HeaderView.vue'
import BaseButtonOpen from '@/components/Buttons/BaseButtonOpen.vue'
import ExitButton from '@/components/UI/ExitButton.vue'
import RecordReportFilterForm from '@/components/AprendizUI/Forms/RecordReportFilterForm.vue'
import { useRecordReport } from '@/composables/History/useRecordReport'
import recordPaper from '@/assets/Icons/RecordPaper.png'
import sendComputer from '@/assets/Icons/sendComputer.png'
import { useExportPdf } from '@/Services/exports/usePdfExport'
import { exportToExcel } from '@/Services/exports/useExcelExport'
import { useNotifications } from '@/composables/useNotifications';
const {addNotification} = useNotifications()
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

const exportPDF = async () => {
  const data = await submitData()
  generatePDF(data)
  addNotification('Reporte PDF generado correctamente','info')
}
const exportEXCEL = async() => {
  const data = await submitData()
  exportToExcel(data)
  addNotification('Archivo Excel generado correctamente','info')
}
</script>
