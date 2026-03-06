<template>
  <!-- Componente tipo modal que contendra el escaner -->
    <BaseModal @close="closeScanner" ref="modal" class="text-center" title="ESCANEAR APRENDICES" text="Empieza a escanear">
      <div class="overflow-hidden h-[400px] relative rounded-lg" ref="scannerContainer"></div>
      <p class="my-10 absolute bottom-0 w-full font-quicksand font-semibold text-lg text-senaColor " ref="result">{{ resultText }}</p>
    </BaseModal>
</template>

<script setup lang="ts">
// dependencias
import  {ref, nextTick}  from 'vue';
import Quagga from '@ericblade/quagga2'; // ES6
import BaseModal from '../Modals/BaseModal.vue';
import { QueryDocument } from '@/Services/QueryDocument';
import { DetectEntry } from '@/Services/DetectEntrys';
// interfaz del componente

// variables del componente
const scannerContainer = ref<HTMLDivElement | null>(null)
const result = ref<HTMLDivElement | null>(null)
const resultText = ref<string>('')
const modal = ref()
const detectedCode = ref<string>('');



const closeScanner = () =>{
  setTimeout(() => {
    modal.value.closeModal()
    Quagga.offDetected()
    Quagga.stop()
  }, 1000);
}


// Funcion que abre la lectura de codigo de barras
const openScanner = async () => {
  modal.value.openModal()
  resultText.value = 'Esperando aprendiz...'
  // Esperar que cargue el DOM
  await nextTick()
  // Libreria Quagga para lector de codigo de barras,  .init para crear el componente que leera el codigo
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
      createOverlay: false //dibujar canvas encima del video
    },
    decoder: {
      readers: ["code_128_reader"] // Tipo de lector de codigo
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
    // Empezar a escanear
    Quagga.start();
    // Limpiar eventos para no sobrecargar
    Quagga.offDetected()
    Quagga.onDetected(async(result) => {
      const code = result.codeResult.code ?? '' // Codigo del scanner
      detectedCode.value = code
      if(!code) return // Verificar que no llegue vacio


      const validacion = await QueryDocument(code) // Verificar si existe el aprendiz
      if(validacion){
        emit('aprendiz-detectado',detectedCode.value)
        resultText.value = `Aprendiz Encontrado: ${detectedCode.value}`
      }
      else{
        resultText.value = `Aprendiz No encontrado: ${detectedCode.value}` // Si no hay, decir que no existe aprendiz
      }
      const yaIngresado = await DetectEntry(code) // Verificar si ya tiene ingreso
      if(yaIngresado){
        resultText.value = `El aprendiz ya esta registrado...`
        return
      }
    })
  })
}



// Definir emits del componente
const emit = defineEmits<{
  (e: 'aprendiz-detectado', code : string): void
}>()

// props del componente
withDefaults(defineProps<{
  classScanner? : string
}>(),{

})

// Dejar expuesta la funcion para que el padre sepa de su existencia (DE LA FUNCION) y pueda manejarla a su gusto
defineExpose({
  openScanner,
  closeScanner
})

</script>

<style>
</style>
