<template>
  <!--Encabezado de la tabla -->
  <th class="border-collapse font-quicksand font-medium text-center border border-black bg-senaColor text-white">{{ name }}</th>
</template>

<script setup lang="ts">
  withDefaults(defineProps<{
    name:string,
  }>(),{
    name:'Name'
  })
</script>

<style>

</style>
