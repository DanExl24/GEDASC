<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <!-- Header -->
    <HeaderView class="text-sm" -header-title="FIRMA DE APRENDICES"/>

    <!-- Modal de firma -->
    <BaseModal class="" ref="modalFirma" :title="`Firma de ${documentoAprendiz}`">
        <SignaturePad  @update:signature="guardarFirma" />
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BaseModal from '@/components/Modals/BaseModal.vue';
import HeaderView from '@/layouts/HeaderView.vue';
import SignaturePad from '@/components/Library/SignaturePad.vue';
import { useMachineSocket } from '@/composables/sockets/useMachineSockets';
import {documentoAprendiz} from '@/composables/sockets/InitSocketsEvent'
import { connectSocket } from '@/socket'
import { useRoute } from 'vue-router';
const socket = connectSocket()

onMounted(() => {
  socket.emit('registrar', { tipo: 'movil' })
})
// ------------------- SOCKET -------------------
const {emitirFirmaRegistrada} = useMachineSocket()

// ------------------- ROUTER -------------------
const router = useRouter();

// ------------------- MODAL -------------------
const modalFirma = ref<InstanceType<typeof BaseModal> | null>(null);

// ------------------- DATOS -------------------

const route = useRoute()

watch(() => route.params.documento, (doc) => {
  if (doc) modalFirma.value?.openModal()
}, { immediate: true })

// ------------------- WATCH RUTA -------------------



// ------------------- GUARDAR FIRMA -------------------

const guardarFirma = (base64: string) => {
  console.log('Firma capturada: ' + base64)
  emitirFirmaRegistrada(base64)

  modalFirma.value?.closeModal()
  router.push('/mobile-view')
}



</script>

<style scoped>
</style>
