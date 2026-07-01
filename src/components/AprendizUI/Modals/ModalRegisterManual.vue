<template>
  <BaseModal @close="close" ref="modalRef" title="Registro manual de ingreso">
    <div class="rounded-2xl bg-slate-50 p-4">
      <p class="mb-1 text-sm font-semibold text-slate-700">Complete el documento y valide la identidad antes de registrar el acceso.</p>
      <p class="text-sm text-slate-500">Los datos del aprendiz se completan automáticamente cuando el documento existe en la base de datos.</p>
    </div>
    <ManualEntryForm @submit-manual="handleSubmit"/>
  </BaseModal>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import BaseModal from '@/components/Modals/BaseModal.vue';
import ManualEntryForm from '../Forms/ManualEntryForm.vue';
const modalRef = ref()

const emit = defineEmits<{
  (e: 'submit-manual', documento: string): void
}>()

const open = () => {
  modalRef.value?.openModal()
}

const close = () => {
  modalRef.value?.closeModal()
}

const handleSubmit = (doc: string) => {
  emit('submit-manual', doc)
  close()
}

defineExpose({
  open,
  close
})

</script>
