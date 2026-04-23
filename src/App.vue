<script setup lang="ts">
import Notifications from './components/UI/Notifications.vue';
import { InitSocketsEvent } from './composables/sockets/InitSocketsEvent';
import { onMounted } from 'vue'
import { useJornadaStore } from '@/stores/jornada'
const jornada = useJornadaStore()

onMounted(() => {
  jornada.startAutoLockWatcher()
})
InitSocketsEvent()
</script>

<template>
  <router-view />
  <Notifications />
</template>

<style scoped>
</style>
