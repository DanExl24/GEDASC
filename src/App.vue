<script setup lang="ts">
import Notifications from './components/UI/Notifications.vue';
import { InitSocketsEvent } from './composables/sockets/InitSocketsEvent';
import { onMounted, onUnmounted } from 'vue'
import { useJornadaStore } from '@/stores/jornada'
import { useAuthStore } from '@/stores/auth'
import { isTokenExpired, forceLogout } from '@/Services/httpClient'

const jornada = useJornadaStore()
const auth = useAuthStore()

// Comprueba cada 60 segundos si el token expiró mientras la app estaba en uso
let tokenCheckInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  jornada.startAutoLockWatcher()

  tokenCheckInterval = setInterval(() => {
    if (auth.token && isTokenExpired(auth.token)) {
      forceLogout('expired')
    }
  }, 60_000)
})

onUnmounted(() => {
  if (tokenCheckInterval !== null) {
    clearInterval(tokenCheckInterval)
  }
})

InitSocketsEvent()
</script>

<template>
  <router-view />
  <Notifications />
</template>

<style scoped>
</style>
