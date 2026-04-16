<template>
  <!-- Componente para abrir el modal-->
  <button @click="emit('click')" :class="[variantClass, classButton]">
    <img v-if="image" :class="imageClass" :src="image" alt="">
    <span class="leading-none">{{ text }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Evento de click para emitir la funcion
const emit = defineEmits<{
  (e: 'click'): void
}>()



// Props del componente
const props = withDefaults(defineProps<{
  image? : string
  text : string,
  classButton? : string
  variant?: 'green' | 'white' | 'dark' | 'ghost' | 'danger'
  imageClass?: string
}>(),{
  text : "texto",
  variant: 'green',
  imageClass: 'h-5 w-5 object-contain'
})

const variantClass = computed(() => {
  const base = 'inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border px-5 py-3.5 font-quicksand font-semibold transition duration-300'

  if (props.variant === 'white') {
    return `${base} border-emerald-200 bg-white text-slate-800 shadow-[0_10px_25px_rgba(15,23,42,0.08)] hover:scale-[1.02]`
  }

  if (props.variant === 'dark') {
    return `${base} border-slate-900 bg-slate-900 text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] hover:scale-[1.02]`
  }

  if (props.variant === 'ghost') {
    return `${base} border-transparent bg-transparent text-senaColor hover:bg-emerald-50`
  }

  if (props.variant === 'danger') {
    return `${base} border-red-600 bg-red-600 text-white shadow-[0_14px_30px_rgba(220,38,38,0.18)] hover:scale-[1.02]`
  }

  return `${base} border-emerald-700 bg-senaColor text-white shadow-[0_14px_30px_rgba(15,107,63,0.18)] hover:scale-[1.02]`
})

</script>

<style>

</style>
