<template>
  <form :method="method" @submit.prevent="submit" class=" gap-1 grid">
    <slot></slot>
  </form>
</template>
<script setup lang="ts">
// Props del Componente y defaults
withDefaults(defineProps<{
  method : string,
  submit : (e : SubmitEvent) => void
}>(),
  {
    method : 'POST',
  }
)
</script>
<style>

</style>
