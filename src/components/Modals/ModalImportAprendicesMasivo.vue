<template>
  <BaseModal
    ref="modalRef"
    :title="`Vinculación Masiva de Aprendices - Ficha #${ficha?.id_formacion || ''}`"
    modal-class="w-full max-w-3xl lg:max-w-4xl max-h-[92vh] sm:max-h-[88vh] overflow-hidden flex flex-col rounded-[28px] border border-emerald-100 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
    body-class="flex-1 min-h-0 overflow-y-auto space-y-5 px-6 py-6 font-quicksand"
  >
    <!-- CABECERA: INFO DE LA FICHA -->
    <div class="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <p class="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Ficha de Destino</p>
        <h3 class="font-robotoSlab font-bold text-slate-800 text-sm mt-0.5">{{ ficha?.nombre }}</h3>
        <p class="text-xs text-slate-500 mt-0.5">
          Horario: <span class="font-semibold text-slate-700">{{ ficha?.hora_inicio }} - {{ ficha?.hora_fin }} ({{ ficha?.jornada }})</span>
          | Días: <span class="font-semibold text-slate-700">{{ ficha?.dias_semana }}</span>
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

    <!-- VISTA 1: CARGA Y CONFIGURACIÓN -->
    <div v-if="!importResult" class="space-y-5">
      <!-- SELECTOR DE ESTRATEGIA -->
      <div class="space-y-2">
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
          Comportamiento para aprendices no registrados:
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label
            class="flex items-start gap-3 p-3.5 rounded-2xl border transition cursor-pointer"
            :class="autoCreateNonExisting
              ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-100'
              : 'border-slate-200 bg-white hover:bg-slate-50'"
          >
            <input
              type="radio"
              :value="true"
              v-model="autoCreateNonExisting"
              class="mt-0.5 text-emerald-600 focus:ring-emerald-500"
            />
            <div class="text-xs">
              <p class="font-bold text-slate-800">Crear y vincular nuevos</p>
              <p class="text-slate-500 mt-0.5 leading-relaxed">
                Si un documento no existe en el sistema, lo registra automáticamente (requiere nombre y apellido).
              </p>
            </div>
          </label>

          <label
            class="flex items-start gap-3 p-3.5 rounded-2xl border transition cursor-pointer"
            :class="!autoCreateNonExisting
              ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-100'
              : 'border-slate-200 bg-white hover:bg-slate-50'"
          >
            <input
              type="radio"
              :value="false"
              v-model="autoCreateNonExisting"
              class="mt-0.5 text-emerald-600 focus:ring-emerald-500"
            />
            <div class="text-xs">
              <p class="font-bold text-slate-800">Solo aprendices existentes</p>
              <p class="text-slate-500 mt-0.5 leading-relaxed">
                Solo vincula los que ya estén registrados en la base de datos. Los demás serán omitidos.
              </p>
            </div>
          </label>
        </div>
      </div>

      <!-- ZONA DE CARGA DE ARCHIVO (DRAG & DROP) -->
      <div class="space-y-2">
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
          Seleccionar o arrastrar archivo (.xlsx, .xls, .json):
        </label>
        <div
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          class="relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer"
          :class="isDragging
            ? 'border-emerald-500 bg-emerald-50/60'
            : 'border-slate-300 hover:border-emerald-400 bg-slate-50/60 hover:bg-slate-50'"
          @click="fileInputRef?.click()"
        >
          <input
            ref="fileInputRef"
            type="file"
            accept=".xlsx, .xls, .json"
            class="hidden"
            @change="handleFileChange"
          />

          <div class="flex flex-col items-center justify-center gap-2">
            <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl shadow-sm">
              📁
            </div>
            <p class="text-sm font-bold text-slate-700">
              {{ selectedFile ? selectedFile.name : 'Haz clic o arrastra aquí tu archivo Excel o JSON' }}
            </p>
            <p class="text-xs text-slate-400">
              Formatos soportados: Microsoft Excel (.xlsx, .xls) o archivo estructurado (.json)
            </p>
          </div>
        </div>
      </div>

      <!-- PREVISUALIZACIÓN DE FILAS EXTRAÍDAS -->
      <div v-if="parsedRows.length > 0" class="space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              {{ parsedRows.length }} registros detectados
            </span>
            <span class="text-xs text-slate-500">
              (Columnas: Documento {{ hasDocCol ? '✅' : '❌' }}, Nombre {{ hasNameCol ? '✅' : '⚪' }}, Apellido {{ hasLastNameCol ? '✅' : '⚪' }})
            </span>
          </div>
          <button
            type="button"
            @click="resetFile"
            class="text-xs text-red-500 hover:text-red-700 font-bold hover:underline cursor-pointer self-start sm:self-auto"
          >
            Quitar archivo
          </button>
        </div>

        <!-- Alerta si falta documento -->
        <div v-if="!hasDocCol" class="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
          ⚠️ No se detectó ninguna columna de documento en el archivo. Asegúrate de incluir encabezados como <strong>documento</strong>, <strong>identificacion</strong> o <strong>cedula</strong>.
        </div>

        <!-- Tabla previsualización primeras 5 filas -->
        <div v-else class="overflow-x-auto rounded-2xl border border-slate-200">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold">
                <th class="p-2.5">#</th>
                <th class="p-2.5">Documento</th>
                <th class="p-2.5">Nombre</th>
                <th class="p-2.5">Apellido</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              <tr v-for="(row, idx) in parsedRows.slice(0, 5)" :key="idx" class="hover:bg-slate-50/50">
                <td class="p-2.5 text-slate-400 font-mono">{{ idx + 1 }}</td>
                <td class="p-2.5 font-bold text-slate-800 font-mono">{{ row.documento || '-' }}</td>
                <td class="p-2.5 text-slate-700">{{ row.nombre || '-' }}</td>
                <td class="p-2.5 text-slate-700">{{ row.apellido || '-' }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="parsedRows.length > 5" class="p-2 text-center text-[11px] text-slate-400 bg-slate-50 border-t border-slate-100">
            Mostrando 5 de {{ parsedRows.length }} registros a procesar.
          </div>
        </div>
      </div>

      <!-- BOTONES DE ACCIÓN -->
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
          <span>{{ isProcessing ? 'Importando aprendices...' : `Vincular ${parsedRows.length} Aprendices` }}</span>
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
          <p class="text-[10px] font-bold uppercase text-emerald-700">Vinculados</p>
          <p class="text-xl font-robotoSlab font-bold text-emerald-800 mt-0.5">{{ importResult.summary.vinculados }}</p>
        </div>
        <div class="p-3.5 rounded-2xl bg-teal-50 border border-teal-200">
          <p class="text-[10px] font-bold uppercase text-teal-700">Nuevos Creados</p>
          <p class="text-xl font-robotoSlab font-bold text-teal-800 mt-0.5">{{ importResult.summary.creadosYVinculados }}</p>
        </div>
        <div class="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
          <p class="text-[10px] font-bold uppercase text-rose-700">Omitidos / Error</p>
          <p class="text-xl font-robotoSlab font-bold text-rose-800 mt-0.5">{{ importResult.summary.omitidos }}</p>
        </div>
      </div>

      <!-- FILTRO DE RESULTADOS -->
      <div class="flex items-center justify-between gap-3">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700">Detalle de Registros:</h4>
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
            @click="filterDetail = 'exitos'"
            class="px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
            :class="filterDetail === 'exitos' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          >
            Éxitos ({{ importResult.summary.vinculados }})
          </button>
          <button
            type="button"
            @click="filterDetail = 'omitidos'"
            class="px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
            :class="filterDetail === 'omitidos' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          >
            Omitidos ({{ importResult.summary.omitidos }})
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
                {{ item.motivo || 'Vinculado satisfactoriamente' }}
              </td>
            </tr>
            <tr v-if="filteredResultDetails.length === 0">
              <td colspan="4" class="p-6 text-center text-slate-400">No hay registros para mostrar en esta vista.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- BOTÓN DE CIERRE -->
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
  importarAprendicesMasivo,
  type FormacionCompleta,
  type BulkImportAprendizItem,
  type BulkImportResponse,
  type BulkImportDetail
} from '@/Services/adminAcademic'

const props = defineProps<{
  ficha: FormacionCompleta | null
}>()

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
const autoCreateNonExisting = ref(true)
const parsedRows = ref<BulkImportAprendizItem[]>([])
const importResult = ref<BulkImportResponse | null>(null)
const filterDetail = ref<'todos' | 'exitos' | 'omitidos'>('todos')

const hasDocCol = computed(() => parsedRows.value.some(r => !!r.documento))
const hasNameCol = computed(() => parsedRows.value.some(r => !!r.nombre))
const hasLastNameCol = computed(() => parsedRows.value.some(r => !!r.apellido))

const canSubmit = computed(() => {
  return parsedRows.value.length > 0 && hasDocCol.value
})

const filteredResultDetails = computed(() => {
  if (!importResult.value) return []
  if (filterDetail.value === 'exitos') {
    return importResult.value.detalles.filter(d => d.estado === 'vinculado' || d.estado === 'creado_y_vinculado')
  }
  if (filterDetail.value === 'omitidos') {
    return importResult.value.detalles.filter(d => d.estado !== 'vinculado' && d.estado !== 'creado_y_vinculado')
  }
  return importResult.value.detalles
})

const getStatusBadgeClass = (estado: BulkImportDetail['estado']) => {
  switch (estado) {
    case 'vinculado':
      return 'bg-emerald-100 text-emerald-800'
    case 'creado_y_vinculado':
      return 'bg-teal-100 text-teal-800'
    case 'conflicto_horario':
      return 'bg-amber-100 text-amber-800'
    case 'no_encontrado':
    case 'error':
      return 'bg-rose-100 text-rose-800'
    case 'ya_vinculado':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

const formatStatusLabel = (estado: BulkImportDetail['estado']) => {
  switch (estado) {
    case 'vinculado': return 'Vinculado'
    case 'creado_y_vinculado': return 'Creado y Vinculado'
    case 'conflicto_horario': return 'Cruce Horario'
    case 'no_encontrado': return 'No Registrado'
    case 'error': return 'Error'
    case 'ya_vinculado': return 'Ya Vinculado'
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
      const rawList = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet)
      extractRows(rawList)
    }
  } catch (error) {
    console.error('Error al procesar archivo:', error)
    addNotification('Error al leer el archivo. Verifica que tenga un formato válido.', 'error')
    resetFile()
  }
}

const extractRows = (rawList: Record<string, unknown>[]) => {
  const normalized: BulkImportAprendizItem[] = []

  for (const item of rawList) {
    let doc = ''
    let nom = ''
    let ape = ''

    for (const [key, val] of Object.entries(item)) {
      const normKey = normalizeKey(key)
      const strVal = val !== undefined && val !== null ? String(val).trim() : ''

      if (['documento', 'identificacion', 'cedula', 'doc', 'dni', 'id', 'num_documento'].includes(normKey)) {
        doc = strVal
      } else if (['nombre', 'nombres', 'primer_nombre', 'first_name', 'name'].includes(normKey)) {
        nom = strVal
      } else if (['apellido', 'apellidos', 'primer_apellido', 'last_name', 'surname'].includes(normKey)) {
        ape = strVal
      }
    }

    if (doc) {
      normalized.push({
        documento: doc,
        nombre: nom || undefined,
        apellido: ape || undefined
      })
    }
  }

  parsedRows.value = normalized
  if (normalized.length === 0) {
    addNotification('No se encontraron filas con número de documento en el archivo', 'error')
  } else {
    addNotification(`Se extrajeron ${normalized.length} aprendices listos para procesar`, 'success')
  }
}

const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) {
    selectedFile.value = input.files[0]
    parseExcelOrJson(input.files[0])
  }
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
    selectedFile.value = e.dataTransfer.files[0]
    parseExcelOrJson(e.dataTransfer.files[0])
  }
}

const downloadTemplateXLSX = () => {
  const sampleData = [
    { documento: '1075289101', nombre: 'Carlos Eduardo', apellido: 'Gómez Ruiz' },
    { documento: '1075289102', nombre: 'María Paula', apellido: 'López Vargas' },
    { documento: '1075289103', nombre: 'Andrés Felipe', apellido: 'Mendoza Díaz' }
  ]
  const worksheet = XLSX.utils.json_to_sheet(sampleData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Aprendices')
  XLSX.writeFile(workbook, `plantilla_aprendices_ficha_${props.ficha?.id_formacion || 'formacion'}.xlsx`)
}

const downloadTemplateJSON = () => {
  const sampleData = [
    { documento: '1075289101', nombre: 'Carlos Eduardo', apellido: 'Gómez Ruiz' },
    { documento: '1075289102', nombre: 'María Paula', apellido: 'López Vargas' },
    { documento: '1075289103', nombre: 'Andrés Felipe', apellido: 'Mendoza Díaz' }
  ]
  const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `plantilla_aprendices_ficha_${props.ficha?.id_formacion || 'formacion'}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const submitImport = async () => {
  if (!props.ficha || !auth.token) return
  isProcessing.value = true
  try {
    const res = await importarAprendicesMasivo(auth.token, props.ficha.id_formacion, {
      aprendices: parsedRows.value,
      autoCreateNonExisting: autoCreateNonExisting.value
    })

    importResult.value = res
    if (res.success) {
      addNotification(res.message, 'success')
      emit('imported')
    } else {
      addNotification(res.message || 'Error en la importación', 'error')
    }
  } catch (error: unknown) {
    console.error('Error al importar aprendices:', error)
    const errorMsg = error instanceof Error ? error.message : 'Error al conectar con el servidor'
    addNotification(errorMsg, 'error')
  } finally {
    isProcessing.value = false
  }
}

const finishAndClose = () => {
  close()
}

defineExpose({
  open,
  close
})
</script>
