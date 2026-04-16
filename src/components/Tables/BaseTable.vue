<template>
  <!-- Tabla de componente-->
  <table :class="tableClass">
    <slot>

    </slot>
  </table>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  tableClass?: string
}>(), {
  tableClass: 'w-full border-separate border-spacing-0 font-quicksand'
})
</script>
