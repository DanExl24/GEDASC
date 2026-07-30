<template>
  <!--Encabezado  -->
  <header :class="headerClass">
    <div class="mx-auto w-full max-w-7xl px-4 py-4 lg:px-8">
    <div class="flex items-center justify-between w-full">

      <!-- IZQUIERDA -->
      <section class="flex items-center gap-4">
        <div class="relative">
          <div class="absolute -inset-1 rounded-2xl bg-emerald-200/50 blur-sm"></div>
          <img class="relative h-[58px] rounded-2xl border border-emerald-200 bg-white p-1 shadow-sm" :src="senaLogo" alt="">
        </div>

        <div class="min-w-0">
          <p class="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
            {{ eyebrow }}
          </p>
          <h1 class="font-robotoSlab text-lg font-bold text-slate-900 lg:text-[1.65rem]">
            {{ HeaderTitle }}
          </h1>
        </div>
      </section>

      <!-- DERECHA -->
        <section class="flex items-center gap-3">
          <!-- Botón de Dispositivo Validador de Firma (para celular/táctil) -->
          <template v-if="auth.isAuthenticated && isTouchDevice">
            <button
              v-if="esValidadorActivo"
              type="button"
              @click="handleDesactivarValidador"
              class="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-900 shadow-sm transition hover:bg-emerald-200"
              title="Dispositivo activo para firmas. Clic para desactivar."
            >
              <span class="h-2 w-2 rounded-full bg-emerald-600 animate-ping"></span>
              ✓ Validador de Firmas Activo
            </button>

            <button
              v-else
              type="button"
              @click="handleActivarValidador(false)"
              class="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
              title="Convertir este teléfono en la estación oficial de firma digital"
            >
              📱 Usar como validador de firmas
            </button>
          </template>

          <!-- Botón de Simulación de Hora para Admin -->
          <button
            v-if="auth.isAuthenticated && auth.isAdmin"
            type="button"
            @click="modalSimulador?.open()"
            class="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 shadow-sm transition hover:bg-amber-100"
            title="Cambiar hora de pruebas"
          >
            ⏱️ Simular Hora
          </button>

          <div class="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2 shadow-sm">

            <!-- puntico decorativo -->
            <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>

            <!-- hora -->
            <span class="font-mono text-sm font-semibold text-slate-700 tracking-wide">
              <ThisTime ref="thisTimeRef" />
            </span>

          </div>

          <button
            v-if="auth.isAuthenticated"
            type="button"
            class="rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 shadow-sm transition-colors duration-200 hover:border-red-200 hover:bg-red-100"
            @click="handleLogout"
          >
            Cerrar sesion
          </button>
        </section>
    </div>
    </div>
    <div class="h-1 w-full bg-[linear-gradient(90deg,#0b7a0b_0%,#1ca64a_35%,#ffffff_100%)]"></div>

    <ModalSimularHora ref="modalSimulador" @updated="handleTimeUpdated" />

    <ModalConfirm
      ref="modalReemplazarValidador"
      title="Reemplazar Validador de Firmas"
      :subTitle="conflictMessage"
      ifYes="Sí, Reemplazar y Activar"
      ifNo="No, Cancelar"
      @confirm="handleActivarValidador(true)"
    />
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import senaLogo from '@/assets/Logos/logo-del-sena-verde.jpg'
import ThisTime from '@/components/UI/ThisTime.vue'
import ModalSimularHora from '@/components/Modals/ModalSimularHora.vue'
import ModalConfirm from '@/components/AprendizUI/Modals/ModalConfirm.vue'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useDeviceValidator } from '@/composables/useDeviceValidator'

const auth = useAuthStore()
const modalSimulador = ref()
const modalReemplazarValidador = ref()
const thisTimeRef = ref()
const conflictMessage = ref('')

const {
  isTouchDevice,
  esValidadorActivo,
  consultarEstadoValidador,
  activarValidador,
  desactivarValidador
} = useDeviceValidator()

onMounted(async () => {
  if (auth.isAuthenticated) {
    await consultarEstadoValidador()
  }
})

const handleActivarValidador = async (forzar = false) => {
  const result = await activarValidador(forzar)

  if (result.conflict) {
    const info = result.data?.validadorActual
    const usuarioNombre = info?.usuario || 'otro celador'
    conflictMessage.value = `Ya existe un dispositivo registrado como validador activo por ${usuarioNombre}. ¿Deseas reemplazarlo y activar este dispositivo como validador único?`
    modalReemplazarValidador.value?.openModal()
    return
  }

  if (result.ok) {
    router.push('/mobile-view')
  }
}

const handleDesactivarValidador = async () => {
  await desactivarValidador()
}

const handleTimeUpdated = () => {
  // Forzar actualización inmediata del reloj en el header
  if (thisTimeRef.value && typeof thisTimeRef.value.getTime === 'function') {
    thisTimeRef.value.getTime()
  } else {
    window.location.reload()
  }
}

const handleLogout = async () => {
  auth.logout()

  try {
    await router.replace('/login')
  } finally {
    if (router.currentRoute.value.path !== '/login') {
      window.location.href = '/login'
    }
  }
}
// props del componente
withDefaults(
  defineProps<{
    HeaderTitle?: string
    eyebrow?: string
    headerClass?: string
  }>(),
  {
    HeaderTitle: 'GESTOR PARA LA ENTRADA Y SALIDA EN EL CENTRO DE FORMACION',
    eyebrow: 'Sistema institucional',
    headerClass: 'sticky top-0 z-30 border-b border-emerald-100 bg-white/95 backdrop-blur-sm shadow-[0_8px_30px_rgba(15,23,42,0.05)]',
  }
)
</script>
<style>

</style>
