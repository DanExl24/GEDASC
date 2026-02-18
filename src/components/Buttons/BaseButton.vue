<template>
  <router-link :to="to">
    <button :class="buttonClass" class=" w-full flex items-center gap-2 bg-senaColor text-white py-1 px-4 rounded-lg hover:scale-105 transition-transform duration-800">
      <img class="mt-2" :src="buttonImg" alt="">
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
  buttonClass?:string,
}>(),{
  buttonImg:add,
  buttonMessage:'Mensaje...'
})
</script>

<style>

</style>
