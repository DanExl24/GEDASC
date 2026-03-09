<template>
  <!-- Componente tipo boton -->
    <button :type="type" :class="[buttonClass,ifImage,classButton]" class=" font-quicksand flex items-center gap-2 bg-senaColor text-white py-3 text-center px-4 rounded-lg hover:scale-105 transition-transform duration-800">
      <p>{{ text }}</p>
      <img class="mt-2" :src="buttonImg" alt="">
    </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// props del componente
const props = withDefaults(defineProps<{
  type? : 'button' | 'reset' | 'submit',
  buttonImg?:string,
  text:string,
  buttonClass?:string,
  classButton? : string
}>(),{
  type : 'button',
  text:'Mensaje...',
  buttonImg : 'undefined'
})

const ifImage = computed(()=>{
  if(props.buttonImg=='undefined') return 'justify-center'
  else return ''
})

</script>

<style>

</style>
