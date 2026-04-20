<script setup lang="ts">
import Notifications from './components/UI/Notifications.vue';
import { InitSocketsEvent } from './composables/sockets/InitSocketsEvent';

InitSocketsEvent()
</script>

<template>
  <router-view />
  <Notifications />
</template>

<style scoped>
</style>
