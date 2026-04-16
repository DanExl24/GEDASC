<template>
  <div>
    <p class="font-quicksand font-bold">{{ hour }}</p>
  </div>
</template>
<script lang="ts" setup>
import { getRealTimeNow } from '@/Services/RealTime';
import { onMounted, ref, onUnmounted } from 'vue';

const hour = ref()
let interval: number | undefined = undefined

onMounted(()=>{
  hour.value = getRealTimeNow()
  interval = setInterval(() => {
    hour.value = getRealTimeNow()
  }, 1000);
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>
