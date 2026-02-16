<template>
  <header class="grid w-full grid-cols-[auto_1fr_auto] py-3 px-4 items-center bg-senaColor">

    <img class="h-[80px] border rounded-lg" :src="senaLogo" alt="">

  <h1 class="font-robotoSlab text-white text-center text-xl font-semibold">
    {{ HeaderTitle }}
  </h1>

  </header>
</template>
<script setup lang="ts">
import senaLogo from '@/assets/Logos/logo-del-sena-verde.jpg'

withDefaults(
  defineProps<{
    HeaderTitle?: string
  }>(),
  {
    HeaderTitle: 'GESTOR PARA LA ENTRADA Y SALIDA EN EL CENTRO DE FORMACION',
  }
)


</script>
<style>

</style>
