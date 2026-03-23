<template>
  <!-- Creacion del modal -->
  <section v-if="active" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-hidden">
    <div class="bg-white lg:min-h-[100px] rounded-xl shadow-xl lg:w-4/12 overflow">
      <!-- Texto del modal y su imagen -->
        <p class="text-white bg-senaColor text-center py-3 font-robotoSlab text-xl flex justify-center items-center relative">
          {{ title }}
          <img @click="handleClose" class="absolute mr-5 cursor-pointer h-[30px] right-0" :src="closeM" alt="">
        </p>
      <div class="mx-5 my-5 relative">
        <!-- Slot para insertar lo que se desee -->
        <slot>
        </slot>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import closeM from '@/assets/Icons/closeModal.png'
import {ref } from 'vue';

// variables del componente
const active = ref(false)



// eventos emitidos del componente, en este caso para cerrar el modal
const emit = defineEmits<{
  (e: 'close'): void
}>()

// funcion para abrir modal
const openModal = ()=>{
  active.value = true
}

// funcion para cerrar modal
const closeModal = ()=>{
  active.value = false
}

// props del componente
withDefaults(defineProps<{
  title : string
}>(),{
  title : 'Titulo de Modal',
})

// funcion para que al emitir close, se cierre el modal
const handleClose = () => {
  closeModal()
  emit('close')
}

defineExpose({
  openModal,
  closeModal
})

</script>

<style>
</style>
