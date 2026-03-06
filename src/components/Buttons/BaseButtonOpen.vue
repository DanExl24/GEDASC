<template>
  <!-- Componente para abrir el modal-->
  <button @click="emit('click')" class="bg-senaColor h-[50px] m-1 text-white flex gap-2 font-quicksand p-3 items-center border rounded-lg cursor-pointer hover:scale-105 transition-transform duration-800 justify-center items-center">
    <img :src="image" alt="">
    {{ text }}
  </button>
</template>

<script setup lang="ts">
import codebar from '@/assets/Icons/barcodeScanner.png'

// Evento de click para emitir la funcion
const emit = defineEmits<{
  (e: 'click'): void
}>()



// Props del componente
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
