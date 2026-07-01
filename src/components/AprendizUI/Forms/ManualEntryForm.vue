<template>
  <BaseForm method="POST" :submit="submitManual">
    <BaseField
      v-model="formManual.documento"
      label="Documento de identidad"
      place-holder="Documento de identidad"
      type="text"
    />
    <BaseField
      v-model="formManual.nombre"
      label="Nombre del aprendiz"
      place-holder="Esperando documento..."
      type="text"
      readonly
    />
    <BaseField
      v-model="formManual.apellido"
      label="Apellido del aprendiz"
      place-holder="Esperando documento..."
      type="text"
      readonly
    />
    <BaseField
      v-model="formManual.formacion"
      label="Programa de formación"
      place-holder="Esperando documento..."
      type="text"
      readonly
    />

    <BaseText :text="message.message" :type="message.type" text-class="text-sm font-medium" />

    <BaseButton
      text="Añadir ingreso"
      type="submit"
      button-class="mt-2 rounded-2xl !bg-emerald-700 shadow-[0_14px_30px_rgba(15,107,63,0.18)]"
    />
  </BaseForm>
</template>
<script setup lang="ts">
import BaseForm from '@/components/Forms/BaseForm.vue';
import BaseField from '@/components/Forms/BaseField.vue';
import BaseText from '@/components/Text/BaseText.vue';
import BaseButton from '@/components/Buttons/BaseButton.vue';
import { useManualForm } from '@/composables/useManualForm';
import { DetectEntry } from '@/Services/DetectEntrys';
import { useAprendiz } from '@/composables/useAprendiz';
import { useMessage } from '@/composables/useMessage';
import { useNotifications } from '@/composables/useNotifications';
const {addNotification} = useNotifications()
const { AñadirIngresoAprendiz } = useAprendiz()
const {message, setMessage} = useMessage()
const { formManual, validateForm, setManualForm } = useManualForm()
const emit = defineEmits<{
  (e: 'submit-manual', documento: string): void
}>()

const submitManual = async () => {
  if (!validateForm()) return

  const documento = formManual.documento.trim()

  // Validar primero si el documento existe en BD antes de proceder
  const resDetect = await DetectEntry(documento)

  if (resDetect.status === 'no_existe') {
    addNotification("Este documento no existe", "error")
    setMessage("Este documento no existe", "error")
    return
  }

  if (resDetect.status === 'error') {
    setMessage("Error en el registro", "error")
    return
  }

  emit('submit-manual', documento)
}

</script>
