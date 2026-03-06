<template>
  <p v-if="active = true" :class="[ClaseDinamica,'font-quicksand']">{{ text }}</p>
</template>
<script setup lang="ts">
import { computed,ref } from 'vue';
const props = withDefaults(defineProps<{
  text : string
  type : 'error' | 'success'
}>(),{

})

const active = ref(true)

const ClaseDinamica = computed(()=>{
  if(props.type == 'error') return 'text-red-700'
  else if (props.type == 'success') return 'text-green-700'
  else return ''
})

const clear = () =>{
  active.value = false
}

defineExpose({
  clear
})

</script>
<style>

</style>
