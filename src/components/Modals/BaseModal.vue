<template>
  <!-- Creacion del modal -->
  <section v-if="active" :class="overlayClass">
    <div :class="modalClass">
      <!-- Texto del modal y su imagen -->
        <p :class="headerClass">
          {{ title }}
          <img @click="handleClose" :class="closeIconClass" :src="closeM" alt="">
        </p>
      <div :class="bodyClass">
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
  overlayClass?: string
  modalClass?: string
  headerClass?: string
  bodyClass?: string
  closeIconClass?: string
}>(),{
  title : 'Titulo de Modal',
  overlayClass: 'fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-[3px]',
modalClass: `
  w-full
  max-w-2xl
  max-h-[90vh]
  sm:max-h-[88vh]
  overflow-hidden
  flex
  flex-col
  rounded-[28px]
  border border-emerald-100
  bg-white
  shadow-[0_30px_80px_rgba(0,0,0,0.35)]
`,
  headerClass: 'shrink-0 relative flex items-center justify-center border-b border-emerald-100 bg-[linear-gradient(90deg,#ffffff_0%,#f3fbf5_40%,#e2f4e6_100%)] px-6 py-5 text-center font-robotoSlab text-xl font-bold text-slate-800',
  bodyClass: 'flex-1 min-h-0 relative space-y-4 overflow-y-auto px-6 py-6',
  closeIconClass: 'absolute right-5 h-[30px] cursor-pointer rounded-full bg-white/80 p-1 shadow-sm'
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
