<template>
  <BaseModal
    :is-open="isOpen"
    title="Editar Celador"
    subtitle="Modificación de datos y credenciales de acceso"
    size="md"
    @close="close"
  >
    <form @submit.prevent="handleSubmit" id="formEditCelador" class="space-y-4">
      <div v-if="errorMessage" class="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-center space-x-2">
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ errorMessage }}</span>
      </div>

      <div>
        <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Nombre Completo</label>
        <input
          v-model="form.nombre"
          type="text"
          required
          class="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Correo Electrónico</label>
        <input
          v-model="form.email"
          type="email"
          required
          class="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Nueva Contraseña (Opcional)</label>
        <input
          v-model="form.password"
          type="password"
          minlength="6"
          placeholder="Dejar en blanco para mantener la actual"
          class="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
        />
      </div>
    </form>

    <template #footer>
      <button
        type="button"
        @click="close"
        class="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="formEditCelador"
        :disabled="loading"
        class="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center space-x-2"
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
  } catch (err: any) {
    errorMessage.value = err.message || 'Error de conexión con el servidor'
  } finally {
    loading.value = false
  }
}
</script>
