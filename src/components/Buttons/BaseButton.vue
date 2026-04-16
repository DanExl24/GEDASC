<template>
  <!-- Componente tipo boton -->
  <button :type="type" :class="[variantClass, alignClass, buttonClass, classButton]">
    <p class="leading-none">{{ text }}</p>
    <img v-if="hasImage" :class="imageClass" :src="buttonImg" alt="">
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
  variant?: 'green' | 'white' | 'dark' | 'ghost'
  imageClass?: string
}>(),{
  type : 'button',
  text:'Mensaje...',
  buttonImg : 'undefined',
  variant: 'green',
  imageClass: 'h-4 w-4 object-contain'
})

const hasImage = computed(() => props.buttonImg !== 'undefined')

const alignClass = computed(()=>{
  if(!hasImage.value) return 'justify-center'
  return 'justify-center'
})

const variantClass = computed(() => {
  const base = 'inline-flex min-h-[52px] items-center gap-2 rounded-2xl px-5 py-3.5 text-center font-quicksand font-semibold transition duration-300'

  if (props.variant === 'white') {
    return `${base} border border-emerald-200 bg-white text-slate-800 shadow-[0_10px_25px_rgba(15,23,42,0.08)] hover:scale-[1.02]`
  }

  if (props.variant === 'dark') {
    return `${base} border border-slate-900 bg-slate-900 text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] hover:scale-[1.02]`
  }

  if (props.variant === 'ghost') {
    return `${base} border border-transparent bg-transparent text-senaColor hover:bg-emerald-50`
  }

  return `${base} border border-emerald-700 bg-senaColor text-white shadow-[0_14px_30px_rgba(15,107,63,0.18)] hover:scale-[1.02]`
})

</script>

<style>

</style>
