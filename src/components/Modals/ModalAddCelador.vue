<template>
  <BaseModal
    :is-open="isOpen"
    title="Nuevo Celador"
    subtitle="Alta de operador de portería y control de acceso"
    size="md"
    @close="close"
  >
    <form @submit.prevent="handleSubmit" id="formAddCelador" class="space-y-4">
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
          placeholder="Ej. Carlos Mario Gómez"
          class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all text-xs sm:text-sm"
        />
      </div>

      <div>
        <label class="block text-xs font-bold font-robotoSlab text-slate-700 uppercase tracking-wider mb-1.5">Correo Electrónico</label>
        <input
          v-model="form.email"
          type="email"
          required
          placeholder="celador@gedasc.com"
          class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all text-xs sm:text-sm"
        />
      </div>

      <div>
        <label class="block text-xs font-bold font-robotoSlab text-slate-700 uppercase tracking-wider mb-1.5">Contraseña de Acceso</label>
        <input
          v-model="form.password"
          type="password"
          required
          minlength="8"
          placeholder="Mínimo 8 caracteres"
          class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all text-xs sm:text-sm"
        />
      </div>

      <div class="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs text-slate-600">
        <p class="font-medium text-slate-800">Rol asignado: <span class="text-emerald-700 font-bold">CELADOR (Operador)</span></p>
        <p class="mt-0.5 text-slate-500">Esta cuenta tendrá acceso exclusivo al registro operativo de entradas, salidas y consulta de historial.</p>
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
        form="formAddCelador"
        :disabled="loading"
        class="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
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
