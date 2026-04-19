<template>
      <img
        v-if="form.aprendizMachine.value?.firma"
        :src="form.aprendizMachine.value?.firma"
        class="fixed top-24 right-8 z-[9999] hidden w-40 rounded-2xl border border-emerald-100 bg-white p-2 shadow-2xl lg:block"
        alt="Vista previa de firma"
      />

      <BaseForm v-if="handleForm" method="POST" :submit="handleSubmitMachine">
        <BaseSelect
          :disabled="maquinaRegistrada.pc || maquinaRegistrada.vh"
          placeholder="Tipo de máquina"
          v-model:model-value="formMachine.TipoMaquina"
          :options="optionsMachine"
        />
        <BaseSelect
          v-if="formMachine.TipoMaquina === 'vh'"
          placeholder="Tipo de vehículo"
          v-model:model-value="formMachine.tipoVehiculo"
          :options="optionsVehicle"
        />
        <BaseField
          v-model="formMachine.modeloMaquina"
          label="Marca de la máquina"
          place-holder="Marca"
          type="text"
        />
        <BaseField
          v-model="formMachine.placaSerial"
          :max-length="formMachine.TipoMaquina === 'vh' ? 7 : 100"
          label="Placa o serial"
          place-holder="Placa o serial"
          type="text"
        />

        <BaseText :text="errorMachine" :type="message.type" text-class="text-sm font-medium" />

        <BaseButtonOpen
          v-if="!form.aprendizMachine.value?.firma"
          class-button="rounded-2xl border-orange-500 bg-orange-500 px-4 py-3 text-white shadow-none"
          text="Capturar firma"
          @click="emitirAbrirFirma"
        />
        <BaseText
          v-if="form.aprendizMachine.value?.firma"
          text="Firma ya registrada"
          type="success"
          text-class="font-semibold"
        />

        <BaseButton
          text="Añadir máquina"
          type="submit"
          button-class="mt-2 rounded-2xl !bg-emerald-700 shadow-[0_14px_30px_rgba(15,107,63,0.18)]"
        />
      </BaseForm>


      <ModalConfirm
        ref="modalConfirmAnother"
        title="Registrar otra máquina"
        :subTitle="confirmMessage"
        ifYes="Sí, Registrar"
        ifNo="No, Finalizar"
        @confirm="handleConfirmAnother"
        @cancel="handleCancelAnother"
      />

      <ModalConfirm
        ref="modalBorrow"
        title="Registro de Maquina"
        subTitle="Esta máquina ya tiene un dueño. ¿El aprendiz decidio prestar esta maquina?"
        ifYes="Sí, y quiero prestarla"
        ifNo="No, no lo hizo"
        @confirm="handleBorrowedMachine"
        @cancel="handleNotBorrowedMachine"
      />

      <ModalConfirm
        ref="modalConfirmExists"
        title="Registro de Maquina"
        subTitle="El aprendiz ya tiene maquina principal, ¿Seguro?"
        ifYes="Sí, quiero registrar otra"
        ifNo="No, fue un error"
        @confirm="handleRegisterOther"
        @cancel="handleNotRegisterOther"
      />

</template>
<script setup lang="ts">
import { ref,watch, computed, onMounted} from 'vue'
import BaseForm from '@/components/Forms/BaseForm.vue'
import BaseSelect from '@/components/Forms/BaseSelect.vue'
import BaseField from '@/components/Forms/BaseField.vue'
import BaseText from '@/components/Text/BaseText.vue'
import BaseButtonOpen from '@/components/Buttons/BaseButtonOpen.vue'
import BaseButton from '@/components/Buttons/BaseButton.vue'
import { useMachineForm } from '@/composables/Forms/useMachineForm'
import { useMachineFormService } from '@/composables/API/useMachineFormService'
import { useMessage } from '@/composables/useMessage'
import { useMachineSocket } from '@/composables/sockets/useMachineSockets'
import { optionsMachine } from '@/constants/optionsMachine'
import { optionsVehicle } from '@/constants/optionsVehicle'
import type { Aprendiz } from '@/types/aprendiz.types'
import ModalConfirm from '../Modals/ModalConfirm.vue'
import { connectSocket } from '@/socket'
const modalConfirmAnother = ref()
const modalBorrow = ref()
const modalConfirmExists = ref()
const socket = connectSocket()
onMounted(() => {
  socket.emit('registrar', { tipo: 'pc' })
})

const handleForm = ref(true)
const emit = defineEmits<{
  (e: "close"): void
}>()

onMounted(() => {
  form.aprendizMachine.value = { ...props.aprendiz, firma: '' }
})

// 🔹 1. crear el form
const form = useMachineForm()

// 🔹 2. pasar el form al service
const {submitMachine,forzarExcepcion} = useMachineFormService(form)
const {emitirAbrirFirma,recibirFirmaMovil} = useMachineSocket(form)
// 🔹 3. mensajes
const { message } = useMessage()

// 🔹 4. desestructurar lo que necesitas del form
const {
  formMachine,
  maquinaRegistrada,
  validateMachineForm,
  errorMachine,
  registerOtherMachine,
  endFlowMachine,
  resetMachineForm
} = form


const confirmMessage = computed(() => {
  if (maquinaRegistrada.pc) return 'Desea registrar tambien un vehiculo?'
  if (maquinaRegistrada.vh) return 'Desea registrar tambien un computador?'
  return ''
})

const handleSubmitMachine = async () => {
  const result = await submitMachine(form.aprendizMachine.value?.id_aprendiz)

  recibirFirmaMovil()

  if (result.status === 'inconsistencia') {
    const aviso = result.data.aviso

    switch (aviso) {
      case 'diferenteAprendiz':
        modalBorrow.value.open()
        return

      case 'maquinaPrincipalExistente':
        modalConfirmExists.value.open()
        return

      case 'maquinaYaPrestadaHoy':
      case 'maquinaSinDueño':
        console.log('caso especial', result.data)
        return
    }
  }

  switch (result.status) {
    case 'registrarOtraMaquina':
        setTimeout(() => {
        modalConfirmAnother.value.open()
      }, 600)
      break

    case 'ok':
      forzarExcepcion.value = false
      handleForm.value = false
      resetMachineForm()
      emit('close')
      break

    case 'error':
    default:
      validateMachineForm()
  }
}

const handleConfirmAnother = () => {
  registerOtherMachine()
  handleForm.value = true
}

const handleCancelAnother = () => {
  endFlowMachine()
  handleForm.value = false
  emit('close')
}

const handleBorrowedMachine = async () => {
  forzarExcepcion.value = true
  modalBorrow.value.close()

  setTimeout(async () => {
    await handleSubmitMachine()
  }, 300)
}

const handleNotBorrowedMachine = () => {
  // no necesitas cerrar, el modal ya se cerró solo
}

const handleRegisterOther = () => {
    forzarExcepcion.value = true
  modalConfirmExists.value.close()

  setTimeout(async () => {
    await handleSubmitMachine()
  }, 300)
}

const handleNotRegisterOther = () => {
  // igual aquí
}

const props = defineProps<{
  aprendiz: Aprendiz
}>()

watch(()=>props.aprendiz,(aprendiz)=>{
  if(aprendiz){
    form.aprendizMachine.value = { ...aprendiz, firma: '' }
  }
})



</script>
