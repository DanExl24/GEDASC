<template>
  <!-- Componente para abrir el modal-->
  <button @click="emit('click')" :class="[classButton,'bg-senaColor h-[50px] m-1 text-white flex gap-2 font-quicksand p-3 items-center border rounded-lg cursor-pointer hover:scale-105 transition-transform duration-800 justify-center items-center']">
    <img :src="image" alt="">
    {{ text }}
  </button>
</template>

<script setup lang="ts">

// Evento de click para emitir la funcion
const emit = defineEmits<{
  (e: 'click'): void
}>()



// Props del componente
withDefaults(defineProps<{
  image? : string
  text : string,
  classButton? : string
}>(),{
  text : "texto"
})


</script>

<style>

</style>
