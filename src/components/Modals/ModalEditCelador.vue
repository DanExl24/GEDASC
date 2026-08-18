<template>
  <BaseModal
    :is-open="isOpen"
    title="Editar Celador"
    subtitle="Modificación de datos y credenciales de acceso"
    size="md"
    @close="close"
  >
    <form @submit.prevent="handleSubmit" id="formEditCelador" class="space-y-4">
      <div v-if="errorMessage" class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center space-x-2">
        <svg class="w-5 h-5 flex-shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ errorMessage }}</span>
      </div>

      <div>
        <label class="block text-xs font-bold font-robotoSlab text-slate-700 uppercase tracking-wider mb-1.5">Nombre Completo</label>
        <input
          v-model="form.nombre"
          type="text"
          required
          class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-xs sm:text-sm"
        />
      </div>

      <div>
        <label class="block text-xs font-bold font-robotoSlab text-slate-700 uppercase tracking-wider mb-1.5">Correo Electrónico</label>
        <input
          v-model="form.email"
          type="email"
          required
          class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-xs sm:text-sm"
        />
      </div>

      <div>
        <label class="block text-xs font-bold font-robotoSlab text-slate-700 uppercase tracking-wider mb-1.5">Nueva Contraseña (Opcional)</label>
        <input
          v-model="form.password"
          type="password"
          minlength="8"
          placeholder="Dejar en blanco para mantener la actual (mínimo 8 caracteres)"
          class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-xs sm:text-sm"
        />
      </div>
    </form>

    <template #footer>
      <button
        type="button"
        @click="close"
        class="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition cursor-pointer"
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="formEditCelador"
        :disabled="loading"
        class="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
      >
        <span v-if="loading">Actualizando...</span>
        <span v-else>Actualizar Celador</span>
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { API_URL } from '@/config/network'
import { useAuthStore } from '@/stores/auth'
import BaseModal from '@/components/UI/BaseModal.vue'

const props = defineProps<{
  isOpen: boolean
  celador: {
    id_usuario: number
    nombre: string
    email: string
  } | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updated'): void
}>()

const auth = useAuthStore()
const loading = ref(false)
const errorMessage = ref('')

const form = reactive({
  nombre: '',
  email: '',
  password: ''
})

watch(
  () => props.celador,
  (newVal) => {
    if (newVal) {
      form.nombre = newVal.nombre || ''
      form.email = newVal.email || ''
      form.password = ''
      errorMessage.value = ''
    }
  },
  { immediate: true }
)

const close = () => {
  emit('close')
}

const handleSubmit = async () => {
  if (!props.celador) return
  errorMessage.value = ''
  loading.value = true

  try {
    const payload: Record<string, string> = {
      nombre: form.nombre,
      email: form.email
    }
    if (form.password && form.password.trim().length > 0) {
      payload.password = form.password.trim()
    }

    const response = await fetch(`${API_URL}/api/admin/celadores/${props.celador.id_usuario}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al actualizar la cuenta de celador')
    }

    emit('updated')
    close()
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Error de conexión con el servidor'
  } finally {
    loading.value = false
  }
}
</script>
