<template>
  <BaseModal
    ref="modalRef"
    title="Registro Masivo de Aprendices"
    modal-class="w-full max-w-3xl lg:max-w-4xl max-h-[92vh] sm:max-h-[88vh] overflow-hidden flex flex-col rounded-[28px] border border-emerald-100 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
    body-class="flex-1 min-h-0 overflow-y-auto space-y-5 px-6 py-6 font-quicksand"
  >
    <!-- CABECERA: DESCRIPCIÓN Y DESCARGA DE PLANTILLAS -->
    <div class="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <p class="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Catálogo Maestro de Aprendices</p>
        <h3 class="font-robotoSlab font-bold text-slate-800 text-sm mt-0.5">Importación Masiva (.xlsx / .json)</h3>
        <p class="text-xs text-slate-500 mt-0.5">
          Cargue la lista de aprendices para registrarlos masivamente en la base de datos del CTA.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="downloadTemplateXLSX"
          class="px-3 py-1.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          title="Descargar archivo Excel de muestra"
        >
          <span>📗</span>
          <span>Plantilla .xlsx</span>
        </button>
        <button
          type="button"
          @click="downloadTemplateJSON"
          class="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          title="Descargar archivo JSON de muestra"
        >
          <span>📄</span>
          <span>Plantilla .json</span>
        </button>
      </div>
    </div>

    <!-- VISTA 1: CARGA Y PREVISUALIZACIÓN -->
    <div v-if="!importResult" class="space-y-5">
      <!-- ZONA DRAG & DROP -->
      <div
        class="border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 bg-slate-50/50 hover:bg-emerald-50/30"
        :class="isDragging ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]' : 'border-slate-300 hover:border-emerald-400'"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        @click="triggerFileInput"
      >
        <input
          ref="fileInputRef"
          type="file"
          accept=".xlsx,.xls,.json"
          class="hidden"
          @change="handleFileSelected"
        />

        <div class="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl shadow-inner">
          📊
        </div>

        <div class="space-y-1">
          <p class="font-robotoSlab font-bold text-slate-800 text-sm">
            {{ selectedFile ? selectedFile.name : 'Arrastra tu archivo aquí o haz clic para examinar' }}
          </p>
          <p class="text-xs text-slate-500">
            Formatos compatibles: Microsoft Excel (.xlsx, .xls) o archivos estructurados JSON (.json)
          </p>
        </div>

        <span v-if="selectedFile" class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          ✓ Archivo cargado ({{ (selectedFile.size / 1024).toFixed(1) }} KB)
        </span>
      </div>

      <!-- PREVISUALIZACIÓN DE FILAS DETECTADAS -->
      <div v-if="parsedRows.length > 0" class="space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="font-robotoSlab text-xs font-bold uppercase tracking-wider text-slate-700">
            Previsualización de Registros ({{ parsedRows.length }} detectados)
          </h4>
          <button
            type="button"
            @click="resetFile"
            class="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
          >
            Cambiar archivo
          </button>
        </div>

        <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th class="p-2.5">#</th>
                <th class="p-2.5">Documento</th>
                <th class="p-2.5">Nombre</th>
                <th class="p-2.5">Apellido</th>
                <th class="p-2.5">Monitor</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(row, idx) in parsedRows.slice(0, 5)" :key="idx" class="hover:bg-slate-50/50">
                <td class="p-2.5 text-slate-400 font-mono">{{ idx + 1 }}</td>
                <td class="p-2.5 font-bold text-slate-800 font-mono">{{ row.documento }}</td>
                <td class="p-2.5 text-slate-700">{{ row.nombre || '-' }}</td>
                <td class="p-2.5 text-slate-700">{{ row.apellido || '-' }}</td>
                <td class="p-2.5">
                  <span v-if="row.es_monitor" class="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold uppercase">
                    Monitor
                  </span>
                  <span v-else class="text-slate-400 text-xs">-</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="parsedRows.length > 5" class="p-2.5 text-center text-xs bg-slate-50 border-t border-slate-100 text-slate-500 italic">
            Mostrando los primeros 5 de {{ parsedRows.length }} registros a procesar.
          </div>
        </div>
      </div>

      <!-- ALERTA SI NO HAY COLUMNA DE DOCUMENTO -->
      <div v-if="selectedFile && parsedRows.length > 0 && !hasDocCol" class="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
        ⚠️ <strong>Aviso:</strong> No se detectó ninguna columna de documento o identificación en el archivo. Verifique los encabezados usando la plantilla de muestra.
      </div>

      <!-- BOTONES DE ACCIÓN STICKY -->
      <div class="sticky -bottom-6 bg-white/95 backdrop-blur-sm pt-4 pb-4 -mx-6 px-6 border-t border-slate-100 flex items-center justify-end gap-3 z-20 shadow-[0_-8px_20px_rgba(0,0,0,0.03)]">
        <button
          type="button"
          @click="close"
          class="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-600 transition cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="button"
          @click="submitImport"
          :disabled="!canSubmit || isProcessing"
          class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-xs font-bold text-white transition flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <span v-if="isProcessing" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>{{ isProcessing ? 'Registrando aprendices...' : `Registrar ${parsedRows.length} Aprendices` }}</span>
        </button>
      </div>
    </div>

    <!-- VISTA 2: INFORME DE RESULTADOS -->
    <div v-else class="space-y-5">
      <!-- RESUMEN DE MÉTRICAS -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <p class="text-[10px] font-bold uppercase text-slate-400">Total Leídos</p>
          <p class="text-xl font-robotoSlab font-bold text-slate-800 mt-0.5">{{ importResult.summary.total }}</p>
        </div>
        <div class="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
          <p class="text-[10px] font-bold uppercase text-emerald-700">Nuevos Creados</p>
          <p class="text-xl font-robotoSlab font-bold text-emerald-800 mt-0.5">{{ importResult.summary.creados }}</p>
        </div>
        <div class="p-3.5 rounded-2xl bg-blue-50 border border-blue-200">
          <p class="text-[10px] font-bold uppercase text-blue-700">Ya Existían</p>
          <p class="text-xl font-robotoSlab font-bold text-blue-800 mt-0.5">{{ importResult.summary.yaRegistrados }}</p>
        </div>
        <div class="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
          <p class="text-[10px] font-bold uppercase text-rose-700">Errores / Omitidos</p>
          <p class="text-xl font-robotoSlab font-bold text-rose-800 mt-0.5">{{ importResult.summary.errores }}</p>
        </div>
      </div>

      <!-- FILTRO DE RESULTADOS -->
      <div class="flex items-center justify-between gap-2">
        <h4 class="font-robotoSlab text-xs font-bold uppercase tracking-wider text-slate-700">
          Detalle de Registros:
        </h4>
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            @click="filterDetail = 'todos'"
            class="px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
            :class="filterDetail === 'todos' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          >
            Todos ({{ importResult.detalles.length }})
          </button>
          <button
            type="button"
            @click="filterDetail = 'creados'"
            class="px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
            :class="filterDetail === 'creados' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          >
            Creados ({{ importResult.summary.creados }})
          </button>
          <button
            type="button"
            @click="filterDetail = 'ya_registrados'"
            class="px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
            :class="filterDetail === 'ya_registrados' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          >
            Ya Registrados ({{ importResult.summary.yaRegistrados }})
          </button>
          <button
            v-if="importResult.summary.errores > 0"
            type="button"
            @click="filterDetail = 'errores'"
            class="px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
            :class="filterDetail === 'errores' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          >
            Errores ({{ importResult.summary.errores }})
          </button>
        </div>
      </div>

      <!-- TABLA DETALLADA DE NOVEDADES -->
      <div class="overflow-x-auto max-h-64 overflow-y-auto rounded-2xl border border-slate-200">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="sticky top-0 bg-slate-100 border-b border-slate-200 text-slate-600 font-bold z-10">
            <tr>
              <th class="p-2.5">Documento</th>
              <th class="p-2.5">Nombre Aprendiz</th>
              <th class="p-2.5">Estado</th>
              <th class="p-2.5">Observación / Motivo</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr v-for="(item, idx) in filteredResultDetails" :key="idx" class="hover:bg-slate-50/50">
              <td class="p-2.5 font-bold text-slate-800 font-mono">{{ item.documento }}</td>
              <td class="p-2.5 text-slate-700">{{ item.nombre ? `${item.nombre} ${item.apellido || ''}` : '-' }}</td>
              <td class="p-2.5">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block"
                  :class="getStatusBadgeClass(item.estado)"
                >
                  {{ formatStatusLabel(item.estado) }}
                </span>
              </td>
              <td class="p-2.5 text-slate-600 font-medium">
                {{ item.motivo || 'Procesado' }}
              </td>
            </tr>
            <tr v-if="filteredResultDetails.length === 0">
              <td colspan="4" class="p-6 text-center text-slate-400">No hay registros para mostrar en esta vista.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- BOTÓN DE CIERRE STICKY -->
      <div class="sticky -bottom-6 bg-white/95 backdrop-blur-sm pt-4 pb-4 -mx-6 px-6 border-t border-slate-100 flex items-center justify-end z-20 shadow-[0_-8px_20px_rgba(0,0,0,0.03)]">
        <button
          type="button"
          @click="finishAndClose"
          class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition shadow-sm cursor-pointer"
        >
          Finalizar y Volver
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx'
import BaseModal from '@/components/Modals/BaseModal.vue'
import { useNotifications } from '@/composables/useNotifications'
import { useAuthStore } from '@/stores/auth'
import {
  bulkCreateAdminAprendices,
  type BulkAprendizItem,
  type BulkCreateAprendicesResponse
} from '@/Services/adminAprendices'

const emit = defineEmits<{
  (e: 'imported'): void
}>()

const auth = useAuthStore()
const { addNotification } = useNotifications()

const modalRef = ref<InstanceType<typeof BaseModal> | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const isDragging = ref(false)
const isProcessing = ref(false)
const selectedFile = ref<File | null>(null)
const parsedRows = ref<BulkAprendizItem[]>([])
const importResult = ref<BulkCreateAprendicesResponse | null>(null)
const filterDetail = ref<'todos' | 'creados' | 'ya_registrados' | 'errores'>('todos')

const hasDocCol = computed(() => parsedRows.value.some(r => !!r.documento))

const canSubmit = computed(() => {
  return parsedRows.value.length > 0 && hasDocCol.value
})

const filteredResultDetails = computed(() => {
  if (!importResult.value) return []
  if (filterDetail.value === 'creados') {
    return importResult.value.detalles.filter(d => d.estado === 'creado')
  }
  if (filterDetail.value === 'ya_registrados') {
    return importResult.value.detalles.filter(d => d.estado === 'ya_registrado')
  }
  if (filterDetail.value === 'errores') {
    return importResult.value.detalles.filter(d => d.estado === 'error')
  }
  return importResult.value.detalles
})

const getStatusBadgeClass = (estado: string) => {
  switch (estado) {
    case 'creado':
      return 'bg-emerald-100 text-emerald-800'
    case 'ya_registrado':
      return 'bg-blue-100 text-blue-800'
    case 'error':
      return 'bg-rose-100 text-rose-800'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

const formatStatusLabel = (estado: string) => {
  switch (estado) {
    case 'creado': return 'Creado'
    case 'ya_registrado': return 'Ya Existía'
    case 'error': return 'Error'
    default: return estado
  }
}

const open = () => {
  resetFile()
  importResult.value = null
  modalRef.value?.openModal()
}

const close = () => {
  modalRef.value?.closeModal()
}

const resetFile = () => {
  selectedFile.value = null
  parsedRows.value = []
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const normalizeKey = (key: string) => {
  return key
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

const parseExcelOrJson = async (file: File) => {
  try {
    const isJson = file.name.endsWith('.json')
    if (isJson) {
      const text = await file.text()
      const rawData = JSON.parse(text)
      const list = Array.isArray(rawData) ? rawData : rawData.aprendices || []
      extractRows(list)
    } else {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      if (!firstSheetName || !workbook.Sheets[firstSheetName]) {
        throw new Error('El archivo no contiene hojas de cálculo válidas')
      }
      const worksheet = workbook.Sheets[firstSheetName]
      const rawList = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet)
      extractRows(rawList)
    }
  } catch (error) {
    console.error('Error al procesar archivo:', error)
    addNotification('Error al leer el archivo. Verifica que tenga un formato válido.', 'error')
    resetFile()
  }
}

const extractRows = (rawList: Record<string, any>[]) => {
  const normalized: BulkAprendizItem[] = []

  for (const rawItem of rawList) {
    const item: Record<string, any> = {}
    for (const key of Object.keys(rawItem)) {
      item[normalizeKey(key)] = rawItem[key]
    }

    const documento = String(
      item.documento || item.identificacion || item.cedula || item.doc || item.dni || item.id || ''
    ).trim()

    const nombre = String(
      item.nombre || item.nombres || item.primer_nombre || item.name || item.first_name || ''
    ).trim()

    const apellido = String(
      item.apellido || item.apellidos || item.primer_apellido || item.last_name || ''
    ).trim()

    const monitorVal = item.es_monitor || item.monitor || false
    const es_monitor = monitorVal === true || monitorVal === 'true' || monitorVal === 'si' || monitorVal === 'SI' || monitorVal === 1

    if (documento) {
      normalized.push({
        documento,
        nombre,
        apellido,
        es_monitor
      })
    }
  }

  if (normalized.length === 0) {
    addNotification('No se encontraron registros de aprendices válidos en el archivo', 'warning')
    resetFile()
    return
  }

  parsedRows.value = normalized
  addNotification(`Se detectaron ${normalized.length} aprendices en el archivo`, 'success')
}

const handleFileSelected = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (file) {
      selectedFile.value = file
      parseExcelOrJson(file)
    }
  }
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  if (e.dataTransfer && e.dataTransfer.files.length > 0) {
    const file = e.dataTransfer.files[0]
    if (file) {
      selectedFile.value = file
      parseExcelOrJson(file)
    }
  }
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const downloadTemplateXLSX = () => {
  const sampleData = [
    { Documento: '1099742501', Nombre: 'Carlos Andrés', Apellido: 'Gómez Ruiz', Es_Monitor: 'NO' },
    { Documento: '1099742502', Nombre: 'María Camila', Apellido: 'López Ramos', Es_Monitor: 'SI' },
    { Documento: '1099742503', Nombre: 'Diego Fernando', Apellido: 'Martínez Soto', Es_Monitor: 'NO' }
  ]

  const worksheet = XLSX.utils.json_to_sheet(sampleData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Aprendices')
  XLSX.writeFile(workbook, 'plantilla_aprendices_general.xlsx')
}

const downloadTemplateJSON = () => {
  const sampleData = {
    aprendices: [
      { documento: '1099742501', nombre: 'Carlos Andrés', apellido: 'Gómez Ruiz', es_monitor: false },
      { documento: '1099742502', nombre: 'María Camila', apellido: 'López Ramos', es_monitor: true },
      { documento: '1099742503', nombre: 'Diego Fernando', apellido: 'Martínez Soto', es_monitor: false }
    ]
  }

  const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'plantilla_aprendices_general.json'
  a.click()
  URL.revokeObjectURL(url)
}

const submitImport = async () => {
  if (!auth.token || parsedRows.value.length === 0) return

  isProcessing.value = true
  try {
    const res = await bulkCreateAdminAprendices(auth.token, parsedRows.value)
    importResult.value = res
    addNotification('Proceso de importación masiva finalizado', 'success')
  } catch (error: unknown) {
    console.error(error)
    const msg = error instanceof Error ? error.message : 'Error al procesar la importación masiva'
    addNotification(msg, 'error')
  } finally {
    isProcessing.value = false
  }
}

const finishAndClose = () => {
  emit('imported')
  close()
}

defineExpose({
  open,
  close
})
</script>
