<template>
  <div class="mt-10 flex flex-col w-full h-full gap-4">
    <div class="flex-1 lg:min-h-0">
      <canvas ref="canvas" class="w-full lg:h-full min-h-[100px] landscape:w-[300px] landscape:h-[50px] border border-black rounded"></canvas>
    </div>
    <div class="flex gap-2 justify-center">
      <BaseButtonOpen class="!bg-red-600" text="Limpiar" @click="limpiar" />
      <BaseButtonOpen text="Guardar" @click="guardar" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import SignaturePad from "signature_pad";
import BaseButtonOpen from "../Buttons/BaseButtonOpen.vue";

const canvas = ref<HTMLCanvasElement | null>(null);
let signaturePad: SignaturePad;

// Emitir evento
const emit = defineEmits<{
  (e: "update:signature", value: string): void;
}>();

onMounted(() => {
  if (!canvas.value) return;
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  canvas.value.width = canvas.value.offsetWidth * ratio;
  canvas.value.height = canvas.value.offsetHeight * ratio;
  const ctx = canvas.value.getContext("2d");
  ctx?.scale(ratio, ratio);

  signaturePad = new SignaturePad(canvas.value, {
    penColor: "black",
    backgroundColor: "rgba(255,255,255,0)",
  });
});

const limpiar = () => {
  signaturePad.clear();
};


const guardar = () => {
  if (signaturePad.isEmpty()) {
    alert("La firma está vacía");
    return;
  }
  // Obtener la imagen en base64 y emitirla
  const dataUrl = canvas.value?.toDataURL("image/png");
  if (dataUrl) {
    emit("update:signature", dataUrl); // <- aquí enviamos la firma al padre
  }
};
</script>
