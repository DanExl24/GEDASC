<template>
  <BaseModal
    ref="modalRef"
    :title="isEditing ? 'Editar Aprendiz' : 'Registrar Nuevo Aprendiz'"
    modal-class="w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col rounded-[28px] border border-emerald-100 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
    body-class="flex-1 min-h-0 overflow-y-auto space-y-4 px-6 py-6 font-quicksand"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100/80">
        <p class="text-xs font-bold uppercase tracking-wider text-emerald-800">
          {{ isEditing ? 'Actualización de Datos' : 'Registro en el Sistema' }}
        </p>
        <p class="text-xs text-slate-500 mt-0.5">
          {{ isEditing ? 'Modifique los campos necesarios para actualizar al aprendiz.' : 'Ingrese la información requerida para registrar al aprendiz en la base de datos del CTA.' }}
        </p>
      </div>

      <div class="space-y-3">
        <BaseField
          v-model="form.documento"
          label="Documento de Identidad (C.C. / T.I.)"
          place-holder="Ej: 1099742508"
          :disabled="isEditing"
          required
        />

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <BaseField
            v-model="form.nombre"
            label="Nombre(s)"
            place-holder="Ej: Juan Camilo"
            required
          />
          <BaseField
            v-model="form.apellido"
            label="Apellido(s)"
            place-holder="Ej: Pérez Gómez"
            required
          />
        </div>

        <!-- Selector de Ficha Inicial (Solo en creación) -->
        <div v-if="!isEditing && formacionesOptions.length > 0" class="space-y-1.5">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Ficha de Formación Inicial (Opcional)
          </label>
          <BaseSelect
            v-model="form.id_formacion"
            :options="formacionesOptions"
            placeholder="Seleccionar cohorte/ficha académica..."
          />
        </div>

        <!-- Checkbox de Rol Monitor -->
        <div class="pt-1">
          <label class="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer">
            <input
              type="checkbox"
              v-model="form.es_monitor"
              class="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <div class="flex-1">
              <p class="text-xs font-bold text-slate-800">Designar como Aprendiz Monitor</p>
              <p class="text-[11px] text-slate-500">Permite ingresar con privilegios de monitoría o fuera de horario formativo.</p>
            </div>
            <span v-if="form.es_monitor" class="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold uppercase">
              Monitor
            </span>
          </label>
        </div>
      </div>

      <!-- Botones de Acción Sticky -->
      <div class="sticky -bottom-6 bg-white/95 backdrop-blur-sm pt-4 pb-4 -mx-6 px-6 border-t border-slate-100 flex items-center justify-end gap-3 z-20">
        <button
          type="button"
          @click="close"
          class="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-600 transition cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-xs font-bold text-white transition flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <span v-if="isSubmitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>{{ isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar Aprendiz' : 'Registrar Aprendiz') }}</span>
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseModal from '@/components/Modals/BaseModal.vue'
import BaseField from '@/components/Forms/BaseField.vue'
import BaseSelect from '@/components/Forms/BaseSelect.vue'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@/composables/useNotifications'
import {
  createAdminAprendiz,
  updateAdminAprendiz,
  type AdminAprendizRow
} from '@/Services/adminAprendices'

const props = withDefaults(defineProps<{
  formacionesOptions?: Array<{ value: number | string; label: string }>
}>(), {
  formacionesOptions: () => []
})

const emit = defineEmits<{
  (e: 'saved'): void
}>()

const auth = useAuthStore()
const { addNotification } = useNotifications()

const modalRef = ref<InstanceType<typeof BaseModal> | null>(null)
const isSubmitting = ref(false)
const editingId = ref<number | string | null>(null)

const isEditing = computed(() => editingId.value !== null)

const form = ref({
  documento: '',
  nombre: '',
  apellido: '',
  es_monitor: false,
  id_formacion: '' as string | number
})

const resetForm = () => {
  editingId.value = null
  form.value = {
    documento: '',
    nombre: '',
    apellido: '',
    es_monitor: false,
    id_formacion: ''
  }
}

const openCreate = () => {
  resetForm()
  modalRef.value?.openModal()
}

const openEdit = (aprendiz: AdminAprendizRow) => {
  resetForm()
  editingId.value = aprendiz.id_aprendiz
  form.value = {
    documento: String(aprendiz.documento || ''),
    nombre: String(aprendiz.nombre || ''),
    apellido: String(aprendiz.apellido || ''),
    es_monitor: Boolean(aprendiz.es_monitor),
    id_formacion: ''
  }
  modalRef.value?.openModal()
}

const close = () => {
  modalRef.value?.closeModal()
}

const handleSubmit = async () => {
  if (!auth.token) return

  const doc = form.value.documento.trim()
  const nom = form.value.nombre.trim()
  const ape = form.value.apellido.trim()

  if (!doc || !nom || !ape) {
    addNotification('Por favor diligencie todos los campos requeridos', 'warning')
    return
  }

  isSubmitting.value = true
  try {
    if (isEditing.value && editingId.value) {
      await updateAdminAprendiz(auth.token, editingId.value, {
        documento: doc,
        nombre: nom,
        apellido: ape,
        es_monitor: form.value.es_monitor
      })
      addNotification('Aprendiz actualizado con éxito', 'success')
    } else {
      await createAdminAprendiz(auth.token, {
        documento: doc,
        nombre: nom,
        apellido: ape,
        es_monitor: form.value.es_monitor,
        id_formacion: form.value.id_formacion ? Number(form.value.id_formacion) : null
      })
      addNotification('Aprendiz registrado exitosamente', 'success')
    }

    emit('saved')
    close()
  } catch (error: unknown) {
    console.error(error)
    const msg = error instanceof Error ? error.message : 'Error al guardar los datos del aprendiz'
    addNotification(msg, 'error')
  } finally {
    isSubmitting.value = false
  }
}

defineExpose({
  openCreate,
  openEdit,
  close
})
</script>
