<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="flex flex-col min-h-screen bg-slate-50">
    <!-- Header -->
    <HeaderView class="text-sm" -header-title="FIRMA DE APRENDICES" />

    <main class="flex-1 p-4 flex flex-col items-center justify-center max-w-md mx-auto w-full">

      <!-- CASO 1: DISPOSITIVO AUTORIZADO -->
      <div v-if="movilAutorizado === true" class="w-full text-center space-y-4">
        <div class="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm flex flex-col items-center">
          <div class="h-16 w-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold mb-3">
            📱
          </div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider mb-2">
            <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Dispositivo Autorizado
          </span>
          <h2 class="text-lg font-bold text-slate-900">Estación de Firma Activa</h2>
          <p class="text-xs text-slate-500 mt-1">
            Esperando solicitud de firma desde la portería.
          </p>
        </div>

        <div class="pt-2">
          <button
            type="button"
            class="text-xs font-semibold text-slate-500 hover:text-slate-700 underline"
            @click="irASistemaResponsive"
          >
            Ir a la aplicación Responsive (Dashboard)
          </button>
        </div>
      </div>

      <!-- CASO 2: DISPOSITIVO NO AUTORIZADO -->
      <div v-else class="w-full space-y-4">
        <div class="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm text-center">
          <div class="h-14 w-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl font-bold mx-auto mb-3">
            🔒
          </div>
          <h2 class="text-base font-bold text-slate-900">Autorización de Dispositivo</h2>
          <p class="text-xs text-slate-500 mt-1 mb-4">
            {{ movilAuthMessage || 'Para capturar firmas digitales en este dispositivo, requiere la clave de dispositivo oficial.' }}
          </p>

          <div class="space-y-3 text-left">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Clave de Dispositivo Móvil
              </label>
              <input
                v-model="inputKey"
                type="password"
                placeholder="Ingrese clave de dispositivo"
                class="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="button"
              class="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition"
              @click="guardarClaveYVincular"
            >
              Vincular y Autorizar Dispositivo
            </button>
          </div>
        </div>

        <div class="text-center pt-2">
          <button
            type="button"
            class="w-full rounded-2xl border border-slate-300 bg-white py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-100 transition"
            @click="irASistemaResponsive"
          >
            Ir a la Aplicación Responsive
          </button>
        </div>
      </div>
    </main>

    <!-- Modal de firma -->
    <BaseModal ref="modalFirma" :title="`Firma de ${documentoAprendiz}`">
      <SignaturePad @update:signature="guardarFirma" />
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseModal from '@/components/Modals/BaseModal.vue'
import HeaderView from '@/layouts/HeaderView.vue'
import SignaturePad from '@/components/Library/SignaturePad.vue'
import { useMachineSocket } from '@/composables/sockets/useMachineSockets'
import {
  documentoAprendiz,
  movilAutorizado,
  movilAuthMessage,
  registrarDispositivoMovil
} from '@/composables/sockets/InitSocketsEvent'

const router = useRouter()
const route = useRoute()
const { emitirFirmaRegistrada } = useMachineSocket()
const modalFirma = ref<InstanceType<typeof BaseModal> | null>(null)
const inputKey = ref(localStorage.getItem('mobileDeviceKey') || '')

onMounted(() => {
  registrarDispositivoMovil()
})

const guardarClaveYVincular = () => {
  if (inputKey.value) {
    localStorage.setItem('mobileDeviceKey', inputKey.value.trim())
    registrarDispositivoMovil()
  }
}

const irASistemaResponsive = () => {
  router.push('/dashboard')
}

watch(
  () => route.params.documento,
  (doc) => {
    if (doc && movilAutorizado.value === true) {
      modalFirma.value?.openModal()
    }
  },
  { immediate: true }
)

const guardarFirma = (base64: string) => {
  emitirFirmaRegistrada(base64)
  modalFirma.value?.closeModal()
  router.push('/mobile-view')
}
</script>
