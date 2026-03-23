<template>
  <!--Encabezado  -->
  <header class="grid w-full grid-cols-[auto_1fr_auto] py-2 px-4 items-center bg-senaColor">

    <img class="h-[50px] border rounded-lg" :src="senaLogo" alt="">

  <h1 class="font-robotoSlab text-white text-center lg:text-xl font-semibold">
    {{ HeaderTitle }}
  </h1>

  </header>
</template>
<script setup lang="ts">
// dependencias
import senaLogo from '@/assets/Logos/logo-del-sena-verde.jpg'

// props del componente
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
