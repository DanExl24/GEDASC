<template>
  <!-- Encabezado -->
  <header :class="headerClass">
    <div class="mx-auto w-full max-w-7xl px-3 py-3 lg:px-8">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">

        <!-- IZQUIERDA: Logo + Titulo -->
        <section class="flex items-center gap-3">
          <div class="relative shrink-0">
            <div class="absolute -inset-1 rounded-2xl bg-emerald-200/50 blur-sm"></div>
            <img class="relative h-10 w-10 sm:h-[52px] sm:w-auto rounded-2xl border border-emerald-200 bg-white p-1 shadow-sm object-contain" :src="senaLogo" alt="SENA">
          </div>

          <div class="min-w-0 flex-1">
            <p class="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 truncate">
              {{ eyebrow }}
            </p>
            <h1 class="font-robotoSlab text-sm font-bold text-slate-900 sm:text-base lg:text-[1.5rem] leading-tight line-clamp-1">
              {{ HeaderTitle }}
            </h1>
          </div>
        </section>

        <!-- DERECHA: Acciones / Botones -->
        <section class="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          
          <!-- Botón Validador de Firmas para móviles -->
          <template v-if="auth.isAuthenticated && isRealMobileDevice">
            <button
              v-if="esValidadorActivo"
              type="button"
              @click="handleDesactivarValidador"
              class="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-100 px-2.5 py-1.5 text-xs font-bold text-emerald-900 shadow-sm transition hover:bg-emerald-200"
              title="Dispositivo activo para firmas. Clic para desactivar."
            >
              <span class="h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>✓ Validador Activo</span>
            </button>

            <button
              v-else
              type="button"
              @click="handleActivarValidador(false)"
              class="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-100"
              title="Convertir este teléfono en la estación oficial de firma digital"
            >
              <span>📱</span>
              <span>Activar Validador</span>
            </button>
          </template>

          <!-- Reloj -->
          <div class="flex items-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50/60 px-2.5 py-1.5 shadow-sm">
            <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="font-mono text-xs sm:text-sm font-semibold text-slate-700 tracking-wide">
              <ThisTime ref="thisTimeRef" />
            </span>
          </div>

          <!-- Logout -->
          <button
            v-if="auth.isAuthenticated"
            type="button"
            class="rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-xs sm:text-sm font-semibold text-red-700 shadow-sm transition-colors duration-200 hover:border-red-200 hover:bg-red-100 cursor-pointer"
            @click="handleLogout"
          >
            <span class="hidden sm:inline">Cerrar sesión</span>
            <span class="sm:hidden">Salir</span>
          </button>
        </section>

      </div>
    </div>
    <div class="h-1 w-full bg-[linear-gradient(90deg,#0b7a0b_0%,#1ca64a_35%,#ffffff_100%)]"></div>

    <ModalConfirm
      ref="modalReemplazarValidador"
      title="Reemplazar Validador de Firmas"
      :subTitle="conflictMessage"
      ifYes="Sí, Reemplazar y Activar"
      ifNo="No, Cancelar"
      @confirm="handleActivarValidador(true)"
    />

    <ModalDesvincularValidador
      ref="modalDesvincularValidador"
      @confirm="processDesactivacion"
    />
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import senaLogo from '@/assets/Logos/logo-del-sena-verde.jpg'
import ThisTime from '@/components/UI/ThisTime.vue'
import ModalConfirm from '@/components/AprendizUI/Modals/ModalConfirm.vue'
import ModalDesvincularValidador from '@/components/Modals/ModalDesvincularValidador.vue'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useDeviceValidator } from '@/composables/useDeviceValidator'

const auth = useAuthStore()
const modalReemplazarValidador = ref()
const modalDesvincularValidador = ref()
const thisTimeRef = ref()
const conflictMessage = ref('')

const {
  isRealMobileDevice,
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

const handleDesactivarValidador = () => {
  modalDesvincularValidador.value?.open()
}

const processDesactivacion = async (password: string) => {
  const result = await desactivarValidador(password)
  if (!result.ok) {
    modalDesvincularValidador.value?.setError(result.message || 'Contraseña incorrecta')
  } else {
    modalDesvincularValidador.value?.close()
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
