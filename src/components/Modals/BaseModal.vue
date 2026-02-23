<template>
  <section class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-hidden">
    <div class="bg-white h-[450px]  rounded-xl shadow-xl max-w-md">
        <p class="text-white bg-senaColor text-center py-3 font-robotoSlab text-xl flex justify-center items-center relative">
          {{ title }}
          <img @click="emit('close')" class="absolute mr-5 cursor-pointer h-[30px] right-0" :src="closeModal" alt="">
        </p>
      <div class="mx-5 my-5 relative">
        <slot>
        </slot>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import closeModal from '@/assets/Icons/closeModal.png'

const emit = defineEmits<{
  (e: 'close'): void
}>()

withDefaults(defineProps<{
  title : string
}>(),{
  title : 'Titulo de Modal',
})
</script>

<style>
</style>
