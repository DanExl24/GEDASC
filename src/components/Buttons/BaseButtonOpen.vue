<template>
  <button @click="emit('click')" class="bg-senaColor h-[50px] m-3 text-white flex gap-2 font-quicksand p-3 items-center border rounded-lg cursor-pointer hover:scale-105 transition-transform duration-800">
    <img :src="image" alt="">
    {{ text }}
  </button>
</template>

<script setup lang="ts">
import codebar from '@/assets/Icons/barcodeScanner.png'

const emit = defineEmits<{
  (e: 'click'): void
}>()

withDefaults(defineProps<{
  image? : string
  text : string
}>(),{
  image : codebar,
  text : "texto"
})

</script>

<style>

</style>
