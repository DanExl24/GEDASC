<template>
  <BaseModal ref="modalRef" title="Desvincular Validador de Firmas" @close="handleClose">
    <div class="space-y-4">
      <div class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
        <div class="h-12 w-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold mx-auto mb-2">
          ⚠️
        </div>
        <h3 class="text-sm font-bold text-slate-900">¿Desea desvincular este dispositivo?</h3>
        <p class="text-xs text-slate-600 mt-1">
          Este teléfono dejará de recibir solicitudes de firma digital de la portería. Para confirmar la desvinculación, ingrese su contraseña de usuario.
        </p>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
          Contraseña de Confirmación
        </label>
        <input
          v-model="passwordInput"
          type="password"
          placeholder="Ingrese su contraseña"
          class="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
          @keyup.enter="confirmarDesvinculacion"
        />
      </div>

      <div v-if="errorMessage" class="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-600">
        {{ errorMessage }}
      </div>

      <div class="flex gap-2 pt-2">
        <button
          type="button"
          class="flex-1 rounded-2xl border border-slate-300 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
          @click="handleClose"
        >
          Cancelar
        </button>

        <button
          type="button"
          class="flex-1 rounded-2xl bg-red-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
          :disabled="cargando"
          @click="confirmarDesvinculacion"
        >
          <span v-if="!cargando">Confirmar Desvinculación</span>
          <span v-else>Verificando...</span>
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from '@/components/Modals/BaseModal.vue'

const emit = defineEmits<{
  (e: 'confirm', password: string): void
}>()

const modalRef = ref()
const passwordInput = ref('')
const errorMessage = ref('')
const cargando = ref(false)

const open = () => {
  passwordInput.value = ''
  errorMessage.value = ''
  cargando.value = false
  modalRef.value?.openModal()
}

const close = () => {
  modalRef.value?.closeModal()
}

const setError = (msg: string) => {
  errorMessage.value = msg
  cargando.value = false
}

const setCargando = (val: boolean) => {
  cargando.value = val
}

const handleClose = () => {
  close()
}

const confirmarDesvinculacion = () => {
  if (!passwordInput.value) {
    errorMessage.value = 'Debe ingresar la contraseña para continuar'
    return
  }
  errorMessage.value = ''
  cargando.value = true
  emit('confirm', passwordInput.value)
}

defineExpose({ open, close, setError, setCargando })
</script>
