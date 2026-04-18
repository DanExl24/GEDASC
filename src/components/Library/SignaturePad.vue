<template>
  <div class="mt-10 flex flex-col w-full h-full gap-4">
    <div class="flex-1 lg:min-h-0">
      <canvas ref="canvas" class="w-full lg:h-full min-h-[100px] landscape:w-[300px] landscape:h-[50px] border border-black rounded"></canvas>
    </div>
    <div class="flex gap-2 justify-center">
      <BaseButtonOpen class="!bg-red-600" text="Limpiar" @click="limpiar" />
      <BaseButtonOpen text="Guardar" @click="onGuardarFirma" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import BaseButtonOpen from "../Buttons/BaseButtonOpen.vue";
import { useAprendizFirma } from "@/composables/Library/useAprendizFirma";
const canvas = ref<HTMLCanvasElement | null>(null)
// Emitir evento
const emit = defineEmits<{
  (e: "update:signature", value: string): void;
}>();

const { guardar, limpiar } = useAprendizFirma(canvas)

const onGuardarFirma = () => {
  const firma = guardar()
  if (firma) {
    emit("update:signature", firma)
  }
}









</script>
