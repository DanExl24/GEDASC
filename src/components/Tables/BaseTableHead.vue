<template>
  <!--Encabezado de la tabla -->
  <th :class="headClass">{{ name }}</th>
</template>

<script setup lang="ts">
  withDefaults(defineProps<{
    name:string,
    headClass?: string
  }>(),{
    name:'Name',
    headClass: 'bg-senaColor px-4 py-3 text-center font-quicksand font-medium text-white'
  })
</script>

<style>

</style>
