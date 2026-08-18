<template>
  <BaseModal
    :is-open="isOpen"
    title="Nuevo Celador"
    subtitle="Alta de operador de portería y control de acceso"
    size="md"
    @close="close"
  >
    <form @submit.prevent="handleSubmit" id="formAddCelador" class="space-y-4">
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
          placeholder="Ej. Carlos Mario Gómez"
          class="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Correo Electrónico</label>
        <input
          v-model="form.email"
          type="email"
          required
          placeholder="celador@gedasc.com"
          class="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Contraseña de Acceso</label>
        <input
          v-model="form.password"
          type="password"
          required
          minlength="8"
          placeholder="Mínimo 8 caracteres"
          class="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
        />
      </div>

      <div class="p-3 bg-gray-800/50 border border-gray-700/40 rounded-xl text-xs text-gray-400">
        <p class="font-medium text-gray-300">Rol asignado: <span class="text-emerald-400 font-bold">CELADOR (Operador)</span></p>
        <p class="mt-0.5">Esta cuenta tendrá acceso exclusivo al registro operativo de entradas, salidas y consulta de historial.</p>
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
        form="formAddCelador"
        :disabled="loading"
        class="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center space-x-2"
      >
        <span v-if="loading">Creando...</span>
        <span v-else>Guardar Celador</span>
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
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created'): void
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
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      form.nombre = ''
      form.email = ''
      form.password = ''
      errorMessage.value = ''
    }
  }
)

const close = () => {
  emit('close')
}

const handleSubmit = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    const response = await fetch(`${API_URL}/api/admin/celadores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`
      },
      body: JSON.stringify(form)
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al crear la cuenta de celador')
    }

    emit('created')
    close()
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Error de conexión con el servidor'
  } finally {
    loading.value = false
  }
}
</script>
