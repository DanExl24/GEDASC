<template>
  <div
    class="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
  >
    <BaseForm method="POST" :submit="handleLogin" class="space-y-4">

      <!-- USER -->
      <div>
        <label class="mb-2 block text-sm font-medium text-slate-600">
          Usuario
        </label>

        <BaseField
          v-model="form.email"
          type="text"
          place-holder="ej: celador.cta01"
          label=""
        />
      </div>

      <!-- PASSWORD -->
      <div>
        <label class="mb-2 block text-sm font-medium text-slate-600">
          Contraseña
        </label>

        <BaseField
          v-model="form.password"
          type="password"
          place-holder="••••••••"
          label=""
        />
      </div>

      <!-- INFO BOX -->
      <div
        class="rounded-[14px] border border-slate-100 bg-slate-50 px-4 py-3"
      >
        <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Acceso institucional
        </p>
        <p class="mt-1 text-sm text-slate-500">
          Usa tu usuario asignado para ingresar al panel de control.
        </p>
      </div>

      <!-- ERROR -->
      <Transition name="fade">
        <div
          v-if="message.type === 'error' && message.message"
          class="rounded-[14px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {{ message.message }}
        </div>
      </Transition>

      <!-- BUTTON -->
      <BaseButtonOpen
        text="Acceder al sistema"
        type="submit"
        :disabled="loading"
        class-button="w-full rounded-2xl bg-slate-900 py-3 font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99] disabled:opacity-60"
      >
        <span v-if="!loading">Acceder al sistema</span>

        <span v-else class="flex items-center justify-center gap-2">
          <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Verificando...
        </span>
      </BaseButtonOpen>

    </BaseForm>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import BaseForm from '@/components/Forms/BaseForm.vue'
import BaseField from '@/components/Forms/BaseField.vue'
import { ref } from 'vue'
import BaseButtonOpen from '@/components/Buttons/BaseButtonOpen.vue'

import { useMessage } from '@/composables/useMessage'
import { useAuth } from '@/composables/useAuth'
import { useNotifications } from '@/composables/useNotifications'
const { setMessage, message } = useMessage()
const { login } = useAuth()
const { addNotification } = useNotifications()
const loading = ref(false)
const emit = defineEmits(['success'])

const form = reactive({
  email: '',
  password: ''
})

const handleLogin = async () => {
  if (!form.email || !form.password) {
    setMessage('Completa todos los campos', 'error')
    return
  }
  loading.value = true
  const res = await login(form.email.trim(), form.password)
  loading.value = false
  if (!res) {
    setMessage('Credenciales inválidas', 'error')
    addNotification('Error al iniciar sesión', 'error')
    return
  }

  setMessage('Bienvenido', 'success')
  addNotification('Login exitoso', 'success')

  setTimeout(() => {
    emit('success')
  }, 800)
}
</script>
