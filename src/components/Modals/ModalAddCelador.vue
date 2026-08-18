<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
    <div class="bg-gray-900 border border-gray-700/60 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 bg-gray-800/80 border-b border-gray-700/50">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-white tracking-wide">Nuevo Celador</h3>
        </div>
        <button @click="close" class="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700/50">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
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
            minlength="6"
            placeholder="Mínimo 6 caracteres"
            class="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-sm"
          />
        </div>

        <div class="p-3 bg-gray-800/50 border border-gray-700/40 rounded-xl text-xs text-gray-400">
          <p class="font-medium text-gray-300">Rol asignado: <span class="text-emerald-400 font-bold">CELADOR (Operador)</span></p>
          <p class="mt-0.5">Esta cuenta tendrá acceso exclusivo al registro operativo de entradas, salidas y consulta de historial.</p>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-800">
          <button
            type="button"
            @click="close"
            class="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center space-x-2"
          >
            <span v-if="loading">Creando...</span>
            <span v-else>Guardar Celador</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { API_URL } from '@/config/network'
import { useAuthStore } from '@/stores/auth'

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

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    form.nombre = ''
    form.email = ''
    form.password = ''
    errorMessage.value = ''
  }
})

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
  } catch (err: any) {
    errorMessage.value = err.message || 'Error de conexión con el servidor'
  } finally {
    loading.value = false
  }
}
</script>
