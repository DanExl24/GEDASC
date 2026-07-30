<template>
      <BaseModal @close="close" ref="modalRef"
        :title="`Registro de máquina de ${props.aprendiz?.nombre || 'aprendiz'}`"
      >
        <div class="mb-4 rounded-2xl bg-emerald-50 p-4 text-sm text-slate-600">
          Registre el equipo asociado al ingreso. Si ya existe una firma capturada desde móvil, se mostrará una confirmación antes de enviar el formulario.
        </div>

        <RegisterMachineForm @close="close" :aprendiz="props.aprendiz"/>
      </BaseModal>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import RegisterMachineForm from '../Forms/RegisterMachineForm.vue';
import type { Aprendiz } from '@/types/aprendiz.types';
import BaseModal from '@/components/Modals/BaseModal.vue';
import { connectSocket } from '@/socket';

const socket = connectSocket()
const modalRef = ref()

const props = defineProps<{
  aprendiz: Aprendiz
}>()

const open = () => {
  modalRef.value?.openModal()
}

const close = () => {
  if (props.aprendiz?.documento) {
    socket.emit('cerrarFirmaEnMovil', { documento: props.aprendiz.documento })
  }
  modalRef.value?.closeModal()
}

defineExpose({
  open,
  close
})
</script>
