<template>
  <!--Columnas de la tabla -->
  <tr :class="rowClass">
    <slot></slot>
  </tr>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  rowClass?: string
}>(), {
  rowClass: 'text-center'
})
</script>

<style scoped>
</style>
