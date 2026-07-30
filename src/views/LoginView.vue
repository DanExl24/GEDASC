<template>
  <div class="min-h-screen bg-slate-100 flex items-center justify-center lg:p-5">

    <section class="relative w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-800 shadow-[0_32px_80px_rgba(0,0,0,0.22)] flex flex-col m-0 lg:flex-row">

      <!-- LADO IZQUIERDO: Carta oscura -->
      <aside class="relative gap-6 flex flex-col justify-start bg-slate-900 p-8 lg:p-10 lg:pb-0 lg:pt-8 lg:w-[52%] text-white">

        <div class="pointer-events-none absolute inset-0 overflow-hidden">
          <div class="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-emerald-900/20 blur-3xl"></div>
          <div class="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-slate-800/60 blur-2xl"></div>
        </div>

        <div class="relative">
          <p class="inline-flex rounded-full border border-emerald-800 bg-emerald-950/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            SENA · Control de acceso
          </p>

          <h1 class="mt-6 max-w-sm font-robotoSlab text-2xl font-bold leading-tight text-slate-100 lg:text-[1.75rem]">
            Acceso institucional con trazabilidad en cada ingreso.
          </h1>

          <p class="mt-4 max-w-md text-sm leading-6 text-slate-400">
            Ingreso reservado para administradores y celadores del centro. Cada sesión queda auditada automáticamente.
          </p>

          <div class="mt-5 flex flex-wrap gap-2">
            <span class="rounded-full border border-emerald-800 bg-emerald-950/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-400">Acceso seguro</span>
            <span class="rounded-full border border-emerald-800 bg-emerald-950/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-400">Operación diaria</span>
            <span class="rounded-full border border-emerald-800 bg-emerald-950/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-400">Trazabilidad</span>
          </div>
        </div>

        <div class="relative mt-0 flex flex-col gap-3">
          <article class="rounded-[18px] border border-slate-700 bg-slate-800/60 px-4 py-4">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Perfil de acceso</p>
            <p class="mt-2 font-robotoSlab text-base font-bold text-slate-100">Solo personal interno</p>
            <p class="mt-1 text-sm text-slate-400">Administradores y celadores del centro.</p>
          </article>

          <article class="rounded-[18px] border border-slate-700 bg-slate-800/60 px-4 py-4">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Plataforma institucional</p>
            <p class="mt-2 font-robotoSlab text-base font-bold text-slate-100">Acceso auditado</p>
            <p class="mt-1 text-sm text-slate-400">Información actualizada en tiempo real.</p>
          </article>
          <p class="mt-2 text-center text-xs text-slate-400">
            SENA · Sistema de control de acceso · Solo personal autorizado
          </p>
        </div>
      </aside>

      <!-- LADO DERECHO: Formulario -->
      <section class="relative flex flex-1 items-center justify-center bg-slate-50 p-8 lg:pt-6 lg:p-10">
        <div class="w-full max-w-sm">

          <div class="mb-6 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-[10px] bg-slate-900 text-xs font-bold uppercase tracking-[0.14em] text-white">
              CTA
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Plataforma institucional</p>
              <p class="text-sm text-slate-500">Centro de tecnología y academia</p>
            </div>
          </div>

          <div class="mb-6">
            <h2 class="font-robotoSlab text-2xl font-bold text-slate-900">Iniciar sesión</h2>
            <p class="mt-2 text-sm leading-5 text-slate-500">
              Ingresa tus credenciales institucionales para continuar.
            </p>
          </div>

          <formLogin @success="handleSuccess"/>


        </div>
      </section>

    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import formLogin from '@/components/AprendizUI/Forms/formLogin.vue'
import router from '@/router'
import { useNotifications } from '@/composables/useNotifications'

const route = useRoute()
const { addNotification } = useNotifications()

onMounted(() => {
  if (route.query.reason === 'expired') {
    addNotification('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'warning')
  } else if (route.query.reason === 'unauthorized') {
    addNotification('Sesión no autorizada o caducada. Inicia sesión para continuar.', 'error')
  }
})

const handleSuccess = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
