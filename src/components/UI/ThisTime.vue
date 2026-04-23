<template>
  <div>
    <p class="font-quicksand font-bold">{{ hour }}</p>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, onUnmounted } from 'vue';
import { useJornadaStore } from '@/stores/jornada';
import { getRealTimeNow } from '@/Services/RealTime';
const jornada = useJornadaStore()
const hour = ref()
let interval: number | undefined = undefined

onMounted(async ()=>{
  const serverTime = await jornada.fetchServerTime()
  let time = new Date(serverTime)
  hour.value = getRealTimeNow(time)
  interval = setInterval(async () => {
    time = new Date(time.getTime() + 1000)
    hour.value = getRealTimeNow(time)
  }, 1000);
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>
