<template>
  <p v-if="active = true" :class="[ClaseDinamica,'font-quicksand']">{{ text }}</p>
</template>
<script setup lang="ts">
import { computed,ref } from 'vue';
// props del componente
const props = withDefaults(defineProps<{
  text : string
  type : 'error' | 'success'
}>(),{

})

// ref para manejar la activacion
const active = ref(true)

// clases dinamicas segun props
const ClaseDinamica = computed(()=>{
  if(props.type == 'error') return 'text-red-700'
  else if (props.type == 'success') return 'text-senaColor'
  else return ''
})

// funcion para desaparecer el texto
const clear = () =>{
  active.value = false
}

defineExpose({
  clear
})

</script>
<style>

</style>
