<template>
  <BaseModal
    ref="modalRef"
    :title="isEditing ? 'Editar Aprendiz' : 'Registrar Nuevo Aprendiz'"
    modal-class="w-full max-w-lg overflow-hidden flex flex-col rounded-[28px] border border-emerald-100 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
    body-class="p-6 space-y-4 font-quicksand"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="space-y-3.5">
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
        <div v-if="!isEditing" class="space-y-1.5">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Ficha de Formación Inicial (Opcional)
          </label>
          <div class="relative">
            <select
              v-model="form.id_formacion"
              class="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm font-quicksand text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 cursor-pointer pr-10"
            >
              <option value="">Seleccionar cohorte/ficha académica (opcional)...</option>
              <option
                v-for="opt in formacionesOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
        <button
          type="button"
          @click="close"
          class="h-10 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-600 transition cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="h-10 px-5 rounded-xl bg-senaColor hover:bg-emerald-700 disabled:opacity-50 text-xs font-bold text-white transition flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
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
  id_formacion: '' as string | number
})

const resetForm = () => {
  editingId.value = null
  form.value = {
    documento: '',
    nombre: '',
    apellido: '',
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
        apellido: ape
      })
      addNotification('Aprendiz actualizado con éxito', 'success')
    } else {
      await createAdminAprendiz(auth.token, {
        documento: doc,
        nombre: nom,
        apellido: ape,
        es_monitor: false,
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
