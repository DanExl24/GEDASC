<template>
  <BaseModal
    ref="baseModalRef"
    title="Gestión de Asociaciones (Monitores y Formaciones)"
    modal-class="my-6 w-full max-w-3xl overflow-hidden rounded-[28px] border border-emerald-100 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
    header-class="relative flex items-center justify-center border-b border-emerald-100 bg-[linear-gradient(90deg,#ffffff_0%,#f3fbf5_40%,#e2f4e6_100%)] px-5 py-4 text-center font-robotoSlab text-lg font-bold text-slate-800"
    body-class="relative max-h-[calc(100vh-8rem)] space-y-5 overflow-y-auto px-5 py-5"
  >
    <!-- 1️⃣ Selector de Aprendiz -->
    <div class="space-y-2">
      <label class="block text-xs font-bold uppercase tracking-wider text-slate-500">Seleccionar Aprendiz</label>
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nombre, apellido o documento..."
          class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-slate-50/50"
          @focus="showDropdown = true"
        />
        
        <!-- Dropdown de resultados de búsqueda -->
        <ul
          v-if="showDropdown && filteredAprendices.length > 0"
          class="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-2xl border border-slate-100 bg-white shadow-xl py-1"
        >
          <li
            v-for="ap in filteredAprendices"
            :key="ap.id_aprendiz"
            class="cursor-pointer px-4 py-2.5 text-sm hover:bg-emerald-50/50 transition flex justify-between items-center"
            @click="selectAprendiz(ap)"
          >
            <div>
              <span class="font-semibold text-slate-800">{{ ap.nombre }} {{ ap.apellido }}</span>
              <span class="text-xs text-slate-400 block">Doc: {{ ap.documento }}</span>
            </div>
            <span
              v-if="ap.es_monitor"
              class="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-senaColor uppercase"
            >
              Monitor
            </span>
          </li>
        </ul>
      </div>
    </div>

    <!-- 2️⃣ Panel de Gestión de la Asociación -->
    <template v-if="selectedAp">
      <!-- Ficha de Aprendiz Seleccionado -->
      <section class="rounded-[22px] border border-emerald-100 bg-emerald-50/60 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-widest text-senaColor">Aprendiz Seleccionado</p>
          <h3 class="mt-1 font-robotoSlab text-lg font-bold text-slate-900">
            {{ selectedAp.nombre }} {{ selectedAp.apellido }}
          </h3>
          <p class="text-xs text-slate-500">Documento: {{ selectedAp.documento }}</p>
        </div>
        
        <!-- Toggle Monitor -->
        <div class="flex items-center gap-3 bg-white/80 border border-emerald-100 rounded-xl px-4 py-2.5 shadow-sm self-start sm:self-auto">
          <label class="text-sm font-semibold text-slate-700 cursor-pointer" for="monitor-toggle">
            Rol de Monitor
          </label>
          <button
            id="monitor-toggle"
            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            :class="selectedAp.es_monitor ? 'bg-emerald-600' : 'bg-slate-200'"
            @click="toggleMonitor"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              :class="selectedAp.es_monitor ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
      </section>

      <!-- Gestión de Formaciones -->
      <div v-if="loadingFormations" class="py-6 text-center text-sm text-slate-400">
        Cargando formaciones asociadas...
      </div>
      
      <div v-else-if="errorFormations" class="rounded-[20px] bg-red-50 border border-red-100 p-4 text-sm text-red-600 text-center">
        {{ errorFormations }}
      </div>

      <div v-else class="grid gap-6 md:grid-cols-2">
        <!-- Listado de Formaciones Vinculadas -->
        <div class="space-y-3">
          <h4 class="font-robotoSlab text-sm font-bold text-slate-800 uppercase tracking-wide">Formaciones Vinculadas</h4>
          
          <div v-if="assigned.length === 0" class="text-sm text-slate-400 italic bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6 text-center">
            Este aprendiz no tiene formaciones vinculadas.
          </div>
          
          <div v-else class="space-y-2">
            <div
              v-for="f in assigned"
              :key="f.id_formacion"
              class="flex items-center justify-between p-3.5 bg-white border border-slate-100 shadow-sm rounded-2xl transition hover:border-emerald-100"
            >
              <div>
                <p class="font-semibold text-sm text-slate-800 leading-snug">{{ f.nombre }}</p>
                <p class="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">
                  {{ f.nivel }} • <span :class="f.estado === 'activo' ? 'text-emerald-600 font-bold' : 'text-slate-400'">{{ f.estado }}</span>
                </p>
              </div>
              
              <BaseButtonOpen
                v-if="f.estado === 'activo'"
                text="Desvincular"
                variant="danger"
                class-button="min-h-0 py-1.5 px-3 rounded-xl text-[11px] font-bold uppercase tracking-wider"
                @click="desvincular(f.id_formacion)"
              />
            </div>
          </div>
        </div>

        <!-- Vincular Nueva Formación -->
        <div class="space-y-3">
          <h4 class="font-robotoSlab text-sm font-bold text-slate-800 uppercase tracking-wide">Vincular Nueva Formación</h4>
          
          <div class="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 space-y-4">
            <p class="text-xs text-slate-500 leading-relaxed">
              Seleccione una de las formaciones disponibles del catálogo para vincularla al aprendiz seleccionado.
            </p>
            
            <div class="space-y-3">
              <select
                v-model="newFormationId"
                class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none bg-white shadow-sm"
              >
                <option value="">Seleccione una formación...</option>
                <option
                  v-for="opt in unassigned"
                  :key="opt.id_formacion"
                  :value="opt.id_formacion"
                >
                  {{ opt.nombre }} ({{ opt.nivel }})
                </option>
              </select>

              <BaseButtonOpen
                text="Vincular Formación"
                variant="green"
                :disabled="!newFormationId"
                class-button="w-full rounded-2xl py-3 text-sm font-bold uppercase tracking-wider"
                @click="vincular"
              />
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="py-12 text-center text-slate-400 italic">
      Busque y seleccione un aprendiz arriba para gestionar sus asociaciones.
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseModal from '@/components/Modals/BaseModal.vue'
import BaseButtonOpen from '@/components/Buttons/BaseButtonOpen.vue'
import {
  getAdminFormacionesAprendiz,
  asignarFormacionAdmin,
  desvincularFormacionAdmin,
  toggleAdminMonitor,
  type AdminAprendizRow
} from '@/Services/adminAprendices'
import { useNotifications } from '@/composables/useNotifications'
import type { Formacion } from '@/types/aprendiz.types'

const props = defineProps<{
  aprendices: AdminAprendizRow[]
  token: string
}>()

const emit = defineEmits<{
  (e: 'update'): void
}>()

const { addNotification } = useNotifications()

const baseModalRef = ref()
const searchQuery = ref('')
const showDropdown = ref(false)
const selectedAp = ref<AdminAprendizRow | null>(null)

// Formaciones
const assigned = ref<Formacion[]>([])
const allFormations = ref<Formacion[]>([])
const loadingFormations = ref(false)
const errorFormations = ref('')
const newFormationId = ref<number | string>('')

// Filtrar aprendices en base a la búsqueda del input
const filteredAprendices = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return []
  return props.aprendices.filter(ap => 
    ap.nombre.toLowerCase().includes(query) ||
    ap.apellido.toLowerCase().includes(query) ||
    ap.documento.includes(query)
  )
})

// Formaciones no asignadas
const unassigned = computed(() => {
  const activeIds = new Set(
    assigned.value
      .filter(f => f.estado === 'activo')
      .map(f => f.id_formacion)
  )
  return allFormations.value.filter(f => !activeIds.has(f.id_formacion))
})

// Abrir/Cerrar Modal
const open = (aprendiz?: AdminAprendizRow) => {
  baseModalRef.value?.openModal()
  searchQuery.value = ''
  selectedAp.value = null
  assigned.value = []
  if (aprendiz) {
    selectAprendiz(aprendiz)
  }
}

const close = () => {
  baseModalRef.value?.closeModal()
}

// Seleccionar un aprendiz
const selectAprendiz = async (aprendiz: AdminAprendizRow) => {
  selectedAp.value = aprendiz
  searchQuery.value = `${aprendiz.nombre} ${aprendiz.apellido}`
  showDropdown.value = false
  await loadFormations()
}

// Cargar formaciones del aprendiz seleccionado
const loadFormations = async () => {
  if (!selectedAp.value || !props.token) return
  
  loadingFormations.value = true
  errorFormations.value = ''
  
  try {
    const data = await getAdminFormacionesAprendiz(props.token, selectedAp.value.id_aprendiz)
    assigned.value = data.asignadas
    allFormations.value = data.todas
  } catch (error) {
    console.error(error)
    errorFormations.value = 'No se pudieron cargar las formaciones del aprendiz.'
  } finally {
    loadingFormations.value = false
  }
}

// Toggle monitor
const toggleMonitor = async () => {
  if (!selectedAp.value || !props.token) return
  
  const original = selectedAp.value.es_monitor
  const target = !original
  
  // Optimistic UI update
  selectedAp.value.es_monitor = target
  
  try {
    await toggleAdminMonitor(props.token, selectedAp.value.id_aprendiz, target)
    addNotification(`Rol de monitor actualizado con éxito`, 'success')
    emit('update')
  } catch (error) {
    console.error(error)
    selectedAp.value.es_monitor = original
    addNotification('No se pudo actualizar el rol de monitor', 'warning')
  }
}

// Vincular formación
const vincular = async () => {
  if (!selectedAp.value || !newFormationId.value || !props.token) return
  
  const idForm = Number(newFormationId.value)
  try {
    await asignarFormacionAdmin(props.token, selectedAp.value.id_aprendiz, idForm)
    addNotification('Formación vinculada con éxito', 'success')
    newFormationId.value = ''
    await loadFormations()
    emit('update')
  } catch (error: any) {
    console.error(error)
    addNotification(error.message || 'No se pudo vincular la formación', 'warning')
  }
}

// Desvincular formación
const desvincular = async (idFormacion: number) => {
  if (!selectedAp.value || !props.token) return
  
  try {
    await desvincularFormacionAdmin(props.token, selectedAp.value.id_aprendiz, idFormacion)
    addNotification('Formación desvinculada con éxito', 'success')
    await loadFormations()
    emit('update')
  } catch (error) {
    console.error(error)
    addNotification('No se pudo desvincular la formación', 'warning')
  }
}

// Cerrar dropdown si se hace click fuera
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.relative')) {
    showDropdown.value = false
  }
}

// Escuchar clicks para cerrar dropdown
watch(showDropdown, (val) => {
  if (val) {
    document.addEventListener('click', handleClickOutside)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})

defineExpose({
  open,
  close
})
</script>
