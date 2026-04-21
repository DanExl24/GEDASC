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
          <div class="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2 shadow-sm">

            <!-- puntico decorativo -->
            <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>

            <!-- hora -->
            <span class="font-mono text-sm font-semibold text-slate-700 tracking-wide">
              <ThisTime />
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
  </header>
</template>
<script setup lang="ts">
// dependencias
import senaLogo from '@/assets/Logos/logo-del-sena-verde.jpg'
import ThisTime from '@/components/UI/ThisTime.vue';
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

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
