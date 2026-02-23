<template>
  <!-- Creacion del modal -->
  <section class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-hidden">
    <div class="bg-white h-[450px]  rounded-xl shadow-xl max-w-md">
      <!-- Texto del modal y su imagen -->
        <p class="text-white bg-senaColor text-center py-3 font-robotoSlab text-xl flex justify-center items-center relative">
          {{ title }}
          <img @click="emit('close')" class="absolute mr-5 cursor-pointer h-[30px] right-0" :src="closeModal" alt="">
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
import closeModal from '@/assets/Icons/closeModal.png'

// eventos emitidos del componente, en este caso para cerrar el modal
const emit = defineEmits<{
  (e: 'close'): void
}>()

// props del componente
withDefaults(defineProps<{
  title : string
}>(),{
  title : 'Titulo de Modal',
})
</script>

<style>
</style>
