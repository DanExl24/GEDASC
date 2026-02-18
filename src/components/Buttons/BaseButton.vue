<template>
  <router-link :to="to">
    <button class="flex items-center justify-center gap-2 bg-senaColor text-white p-2">
      <img :src="buttonImg" alt="">
      <p>{{ buttonMessage }}</p>
    </button>
  </router-link>
</template>

<script setup lang="ts">
import add from '@/assets/Icons/add.png'

withDefaults(defineProps<{
  to:string,
  buttonImg?:string,
  buttonMessage:string,
}>(),{
  buttonImg:add,
  buttonMessage:'Mensaje...'
})
</script>

<style>

</style>
