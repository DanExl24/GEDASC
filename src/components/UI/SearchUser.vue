<template>
  <!-- Boton de la barra de busqueda para encontrar aprendices -->
  <div class="bg-senaColor mx-3 p-2 rounded-md border flex justify-items-center cursor-pointer hover:scale-105 transition-transform duration-600">
    <img class="h-[25px]" :src="SearchUser" alt="">
  </div>
</template>
<script setup lang="ts">
import SearchUser from '@/assets/Icons/SearchUser.png';

</script>
<style>

</style>
