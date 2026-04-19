<template>
  <BaseModal @close="close" ref="modalRef" title="Registro manual de salida">
    <div class="rounded-2xl bg-slate-50 p-4">
      <p class="mb-1 text-sm font-semibold text-slate-700">
        Verifique el documento antes de confirmar la salida del aprendiz.
      </p>
      <p class="text-sm text-slate-500">
        Los datos se completan automaticamente cuando el aprendiz existe en la base de datos.
      </p>
    </div>

    <ManualExitForm :key="formKey" @cerrar-modal="close" />
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from '@/components/Modals/BaseModal.vue'
import ManualExitForm from '@/components/AprendizUI/Forms/ManualExitForm.vue'

const modalRef = ref()
const formKey = ref(0)

const open = () => {
  formKey.value += 1
  modalRef.value?.openModal()
}

const close = () => {
  modalRef.value?.closeModal()
}

defineExpose({
  open,
  close,
})
</script>
