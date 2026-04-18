<script setup lang="ts">
import { InitSocketsEvent } from './composables/sockets/InitSocketsEvent';
InitSocketsEvent()
</script>

<template>
  <!--Renderizar rutas -->
  <router-view />
</template>

<style scoped>
</style>
