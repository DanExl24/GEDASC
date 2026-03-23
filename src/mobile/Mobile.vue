<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <!-- Header -->
    <HeaderView class="text-sm" -header-title="FIRMA DE APRENDICES"/>

    <!-- Modal de firma -->
    <BaseModal class="" ref="modalFirma" :title="`Firma de ${documentoAprendiz}`">
        <SignaturePad class="" @update:signature="guardarFirma" />
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { io } from 'socket.io-client';
import BaseModal from '@/components/Modals/BaseModal.vue';
import HeaderView from '@/layouts/HeaderView.vue';
import SignaturePad from '@/components/Library/SignaturePad.vue';

// ------------------- SOCKET -------------------
const socket = io("http://192.168.1.7:3000");

// ------------------- ROUTER -------------------
const router = useRouter();
const route = useRoute();

// ------------------- MODAL -------------------
const modalFirma = ref<InstanceType<typeof BaseModal> | null>(null);

// ------------------- DATOS -------------------
const documentoAprendiz = ref(''); // Para mostrar en el título del modal

// ------------------- SOCKET LISTEN -------------------
socket.on('connect', () => {
  console.log('Móvil conectado, id socket:', socket.id);
  socket.emit('registrarMovil', { dispositivo: 'movil' });
});

// Recibir evento desde PC
socket.on('abrirFirma',async ({ documento }) => {
  documentoAprendiz.value = documento;
  router.push(`/mobile-view/firma/${documento}`);

  // esperar a que Vue renderice la ruta y las refs
  await nextTick();

  modalFirma.value?.openModal(); // ahora sí existe
});

// ------------------- WATCH RUTA -------------------
watch(
  () => route.fullPath,
  (path) => {
    if (path.startsWith('/mobile-view/firma/')) {
      modalFirma.value?.openModal();
    } else {
      modalFirma.value?.closeModal();
    }
  }
);

// ------------------- GUARDAR FIRMA -------------------
const guardarFirma = (base64: string) => {
  console.log('Firma capturada: ' + base64)

  socket.emit('firmaRegistrada', { documento: documentoAprendiz.value, firma: base64 })

  modalFirma.value?.closeModal()
  router.push('/mobile-view')
}

</script>

<style scoped>
</style>
