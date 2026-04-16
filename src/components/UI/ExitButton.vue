<template>
  <!-- Componente tipo ruta para manejar las vistas -->
    <div class="flex items-center">
      <router-link :to="to">
          <div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200 bg-white shadow-[0_10px_25px_rgba(15,23,42,0.08)] transition-transform duration-300 hover:scale-105">
            <img class="" :src="ButtonImg" alt="">
          </div>
      </router-link>
    </div>
</template>

<script setup lang="ts">
// Dependencias
import back from '@/assets/Icons/Back.png'

// Props del componente
withDefaults(defineProps<{
  to : string,
  ButtonImg? : string
  buttonClass?: string
}>(),{
  ButtonImg : back,
  buttonClass: 'bg-senaColor p-3 m-3 mb-14 w-12 border rounded-md hover:scale-110 transition-transform duration-800'
})

</script>
<style>

</style>
