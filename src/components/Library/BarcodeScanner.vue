<template>
    <BaseModal @close="active = false" class="text-center" v-if="active" title="ESCANEAR APRENDICES" text="Empieza a escanear">
      <div class="overflow-hidden h-[400px] relative rounded-lg" ref="scannerContainer"></div>
      <p class="my-10 absolute bottom-0 w-full font-quicksand text-lg text-senaColor " ref="result">{{ resultText }}</p>
    </BaseModal>
</template>

<script setup lang="ts">
import  {ref, nextTick, watch}  from 'vue';
import Quagga from '@ericblade/quagga2'; // ES6

import BaseModal from '../Modals/BaseModal.vue';
const scannerContainer = ref<HTMLDivElement | null>(null)
const result = ref<HTMLDivElement | null>(null)
const resultText = ref<string>('')
const active = ref(false)



watch(active, (value) =>{
  if(!value){
    Quagga.stop()
  }
})



const openScanner = async () => {
  active.value = true
  resultText.value = ''
  await nextTick()

  Quagga.init({
    inputStream: { //De donde sale la imagen
      type: "LiveStream", // Tipo de camara
      target: scannerContainer.value!, //Elemento DOM donde cargara
      constraints: {
        facingMode: "environment" // Si es movil
      },
    area: { //Que parte del area de analiza
        top: '0%',
        right: '0%',
        left: '0%',
        bottom: '0%'
    },
    },
    locate : true, //encontrar codigo aunque no este alineado
    canvas: {
      createOverlay: true //dibujar canvas encima del video
    },
    decoder: {
      readers: ["code_128_reader"]
    },
    locator: {
        halfSample: false,
        patchSize: 'medium', // x-small, small, medium, large, x-large
    },
  }, function(err) {
    if (err) {
      console.error("Failed to initialize:", err);
      resultText.value = "Error: " + err.message;
      return;
    }
    Quagga.start();
    // Limpiar eventos para no sobrecargar
    Quagga.offDetected()
    Quagga.onDetected((result) => {
      const code = result.codeResult.code
      resultText.value = `Aprendiz Encontrado: ${code}`
    })
  })
}

withDefaults(defineProps<{
  classScanner? : string
}>(),{

})

defineExpose({
  openScanner
})

</script>

<style>
</style>
