<template>
  <BaseForm method="POST" :submit="submitManual">
    <BaseField
      v-model="form.formManual.documento"
      label="Documento de identidad"
      place-holder="Documento de identidad"
      type="text"
      :max-length="10"
    />
    <BaseField
      v-model="form.formManual.nombre"
      label="Nombre del aprendiz"
      place-holder="Esperando documento..."
      type="text"
      readonly
    />
    <BaseField
      v-model="form.formManual.apellido"
      label="Apellido del aprendiz"
      place-holder="Esperando documento..."
      type="text"
      readonly
    />
    <BaseField
      v-model="form.formManual.formacion"
      label="Programa de formacion"
      place-holder="Esperando documento..."
      type="text"
      readonly
    />

    <BaseText :text="message.message" :type="message.type" text-class="text-sm font-medium" />

    <BaseButton
      text="Añadir salida"
      type="submit"
      button-class="mt-2 rounded-2xl !bg-emerald-700 shadow-[0_14px_30px_rgba(15,107,63,0.18)]"
    />
  </BaseForm>
</template>

<script setup lang="ts">
import BaseForm from '@/components/Forms/BaseForm.vue'
import BaseField from '@/components/Forms/BaseField.vue'
import BaseText from '@/components/Text/BaseText.vue'
import BaseButton from '@/components/Buttons/BaseButton.vue'
import { useExitManualForm } from '@/composables/Forms/useExitManualForm'
import { useExitManualService } from '@/composables/API/useExitManualService'

const emit = defineEmits<{
  (e: 'cerrar-modal'): void
}>()

const form = useExitManualForm()
const { message } = form
const { loadAprendizByDocument, submitManualExit } = useExitManualService(form)
form.watchDocument(loadAprendizByDocument)

const submitManual = async () => {
  const ok = await submitManualExit()

  if (!ok) return

  setTimeout(() => {
    form.resetForm()
    emit('cerrar-modal')
  }, 1000)
}
</script>
