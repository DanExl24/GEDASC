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
const emit = defineEmits(['cerrar-modal'])

const submitManual = async () => {
  if (!validateForm()) return

  const documento = formManual.documento.trim()

  await setManualForm(documento)

  const estado = await DetectEntry(documento)

  if (estado === 'ok') {
    addNotification("Registro aceptado", "success")
    setTimeout(() => emit('cerrar-modal'), 1000)

  } else if (estado === 'ya_registrado') {
    addNotification("El aprendiz ya tiene un registro", "warning")

  } else if (estado === 'no_existe') {
    addNotification("Este documento no existe", "error")

  } else {
    setMessage("Error en el registro", "error")
  }


  const res = await AñadirIngresoAprendiz(documento)


  if (!res) {
    setMessage("Error registrando ingreso", "error")
    return
  }

  setMessage("Registro aceptado", "success")

  setTimeout(() => {
    emit('cerrar-modal')
  }, 1000)
}

</script>
