<template>
  <!-- Componente tipo ruta para manejar las vistas -->
  <router-link :to="to">
      <div :class="buttonClass">
        <img class="" :src="ButtonImg" alt="">
      </div>
  </router-link>
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
