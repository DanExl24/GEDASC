<template>
  <div class="flex flex-col gap-6">
    <!-- Header Banner -->
    <div class="overflow-hidden rounded-[28px] border border-emerald-200 bg-white shadow-[0_18px_45px_rgba(15,107,63,0.08)]">
      <div class="bg-[linear-gradient(135deg,#0d7a3b_0%,#1a8e52_55%,#0f172a_100%)] px-6 py-5 text-white">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
          Módulo de Exportación Avanzada
        </p>
        <h2 class="mt-1 font-robotoSlab text-2xl font-bold leading-tight">
          Configuración Personalizada de Columnas
        </h2>
        <p class="mt-1 max-w-3xl text-xs leading-5 text-emerald-50/90">
          Selecciona las columnas que deseas incluir u ocultar antes de generar los reportes en formato Excel o PDF.
        </p>
      </div>
    </div>

    <!-- Grid of Advanced Export Cards -->
    <div class="grid gap-6 lg:grid-cols-2 items-start">
      <!-- 1. BASE DE DATOS DE APRENDICES -->
      <article class="flex flex-col justify-between rounded-[28px] border border-emerald-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,107,63,0.06)] transition-all">
        <div>
          <div class="flex items-start justify-between gap-3">
            <div>
              <span class="inline-block rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-800">
                Catálogo Maestro
              </span>
              <h3 class="mt-2 font-robotoSlab text-xl font-bold text-slate-900">
                Exportación Avanzada de Aprendices
              </h3>
              <p class="mt-1 text-xs text-slate-600">
                Base de datos completa con detalles de Programa, Ficha (Formación) y Jornada asociada.
              </p>
            </div>
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              🎓
            </div>
          </div>

          <!-- Búsqueda / Filtro -->
          <div class="mt-4">
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Filtrar aprendices (Opcional)
            </label>
            <input
              v-model="aprendicesSearch"
              type="text"
              placeholder="Buscar por nombre, documento o programa..."
              class="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <!-- Selector de Columnas -->
          <div class="mt-5 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-700">Columnas a exportar</span>
              <div class="flex gap-2">
                <button type="button" class="text-[11px] font-semibold text-emerald-700 hover:underline" @click="selectAllAprendicesCols">Todas</button>
                <span class="text-slate-300">|</span>
                <button type="button" class="text-[11px] font-semibold text-slate-500 hover:underline" @click="deselectAllAprendicesCols">Ninguna</button>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              <label
                v-for="col in aprendicesCols"
                :key="col.key"
                class="flex items-center gap-2 rounded-xl bg-white p-2 border border-slate-100 text-xs font-medium text-slate-700 cursor-pointer select-none transition hover:border-emerald-200"
              >
                <input
                  type="checkbox"
                  v-model="col.selected"
                  class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span :class="{ 'font-semibold text-emerald-950': col.selected }">{{ col.label }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Botones -->
        <div class="mt-6 flex flex-col gap-3 sm:flex-row">
          <BaseButtonOpen :image="sendComputer" text="Exportar a Excel" variant="green" class-button="w-full" image-class="h-4 w-4 object-contain" @click="handleExportAprendices('excel')" />
          <BaseButtonOpen :image="recordPaper" text="Exportar a PDF" variant="danger" class-button="w-full" image-class="h-4 w-4 object-contain" @click="handleExportAprendices('pdf')" />
        </div>
      </article>

      <!-- 2. EXPORTACIÓN POR FICHAS -->
      <article class="flex flex-col justify-between rounded-[28px] border border-amber-200 bg-white p-6 shadow-[0_18px_45px_rgba(245,158,11,0.06)] transition-all">
        <div>
          <div class="flex items-start justify-between gap-3">
            <div>
              <span class="inline-block rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-800">
                Catálogo por Fichas
              </span>
              <h3 class="mt-2 font-robotoSlab text-xl font-bold text-slate-900">
                Exportación Avanzada por Fichas
              </h3>
              <p class="mt-1 text-xs text-slate-600">
                Detalle completo de cada Ficha: Programa, Versión, Jornada, Horario, Días hábiles y total de aprendices inscritos.
              </p>
            </div>
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              📋
            </div>
          </div>

          <!-- Selector de Columnas -->
          <div class="mt-5 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-700">Columnas a exportar</span>
              <div class="flex gap-2">
                <button type="button" class="text-[11px] font-semibold text-amber-700 hover:underline" @click="selectAllFichasCols">Todas</button>
                <span class="text-slate-300">|</span>
                <button type="button" class="text-[11px] font-semibold text-slate-500 hover:underline" @click="deselectAllFichasCols">Ninguna</button>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              <label
                v-for="col in fichasCols"
                :key="col.key"
                class="flex items-center gap-2 rounded-xl bg-white p-2 border border-slate-100 text-xs font-medium text-slate-700 cursor-pointer select-none transition hover:border-amber-200"
              >
                <input
                  type="checkbox"
                  v-model="col.selected"
                  class="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span :class="{ 'font-semibold text-amber-900': col.selected }">{{ col.label }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Botones -->
        <div class="mt-6 flex flex-col gap-3 sm:flex-row">
          <BaseButtonOpen :image="sendComputer" text="Exportar a Excel" variant="green" class-button="w-full" image-class="h-4 w-4 object-contain" @click="handleExportFichas('excel')" />
          <BaseButtonOpen :image="recordPaper" text="Exportar a PDF" variant="danger" class-button="w-full" image-class="h-4 w-4 object-contain" @click="handleExportFichas('pdf')" />
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseButtonOpen from '@/components/Buttons/BaseButtonOpen.vue'
import recordPaper from '@/assets/Icons/RecordPaper.png'
import sendComputer from '@/assets/Icons/SendComputer.png'
import { useAdminCatalogExports } from '@/Services/exports/useAdminCatalogExports'
import { getAdminAprendices } from '@/Services/adminAprendices'
import { getAllFormaciones } from '@/Services/adminAcademic'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@/composables/useNotifications'

const auth = useAuthStore()
const { addNotification } = useNotifications()
const { exportAprendices, exportFormaciones } = useAdminCatalogExports()

const aprendicesSearch = ref('')

// Columnas: Aprendices
const aprendicesCols = ref([
  { key: 'documento', label: 'Documento', selected: true },
  { key: 'nombre', label: 'Nombre', selected: true },
  { key: 'apellido', label: 'Apellido', selected: true },
  { key: 'es_monitor_label', label: 'Monitor', selected: true },
  { key: 'estado_label', label: 'Estado', selected: true },
  { key: 'programa', label: 'Programa', selected: true },
  { key: 'formacion', label: 'Formación (Ficha)', selected: true },
  { key: 'jornada', label: 'Jornada', selected: true },
])
const selectAllAprendicesCols = () => aprendicesCols.value.forEach((c) => (c.selected = true))
const deselectAllAprendicesCols = () => aprendicesCols.value.forEach((c) => (c.selected = false))

// Columnas: Fichas
const fichasCols = ref([
  { key: 'id_formacion', label: 'N° Ficha', selected: true },
  { key: 'nombre_programa', label: 'Programa', selected: true },
  { key: 'version', label: 'Versión Programa', selected: true },
  { key: 'nivel', label: 'Nivel', selected: true },
  { key: 'jornada', label: 'Jornada', selected: true },
  { key: 'hora_inicio', label: 'Hora Inicio', selected: true },
  { key: 'hora_fin', label: 'Hora Fin', selected: true },
  { key: 'dias_semana', label: 'Días Hábiles', selected: true },
  { key: 'estado', label: 'Estado', selected: true },
  { key: 'total_aprendices', label: 'Total Aprendices', selected: true },
])
const selectAllFichasCols = () => fichasCols.value.forEach((c) => (c.selected = true))
const deselectAllFichasCols = () => fichasCols.value.forEach((c) => (c.selected = false))

// Handler: Aprendices
const handleExportAprendices = async (format: 'pdf' | 'excel') => {
  if (!auth.token) { addNotification('Sesión no válida para exportar', 'error'); return }

  const selectedKeys = aprendicesCols.value.filter((c) => c.selected).map((c) => c.key)
  if (selectedKeys.length === 0) { addNotification('Debe seleccionar al menos una columna para exportar', 'warning'); return }

  try {
    const data = await getAdminAprendices(auth.token)
    let filtered = data
    if (aprendicesSearch.value.trim()) {
      const q = aprendicesSearch.value.toLowerCase().trim()
      filtered = data.filter(
        (a: any) =>
          a.nombre?.toLowerCase().includes(q) ||
          a.apellido?.toLowerCase().includes(q) ||
          String(a.documento).includes(q) ||
          a.programa?.toLowerCase().includes(q)
      )
    }
    exportAprendices(filtered, format, selectedKeys)
    addNotification(`Reporte de Aprendices (${format.toUpperCase()}) generado`, 'info')
  } catch (err) {
    console.error('Error exportando aprendices:', err)
    addNotification('Error al generar la exportación de aprendices', 'error')
  }
}

// Handler: Fichas
const handleExportFichas = async (format: 'pdf' | 'excel') => {
  if (!auth.token) { addNotification('Sesión no válida para exportar', 'error'); return }

  const selectedKeys = fichasCols.value.filter((c) => c.selected).map((c) => c.key)
  if (selectedKeys.length === 0) { addNotification('Debe seleccionar al menos una columna para exportar', 'warning'); return }

  try {
    const data = await getAllFormaciones(auth.token)
    exportFormaciones(data, format, selectedKeys)
    addNotification(`Reporte de Fichas (${format.toUpperCase()}) generado`, 'info')
  } catch (err) {
    console.error('Error exportando fichas:', err)
    addNotification('Error al generar la exportación de fichas', 'error')
  }
}
</script>
