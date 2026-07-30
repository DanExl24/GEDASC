<template>
      <img
        v-if="form.aprendizMachine.value?.firma"
        :src="form.aprendizMachine.value?.firma"
        class="fixed top-24 right-8 z-[9999] hidden w-40 rounded-2xl border border-emerald-100 bg-white p-2 shadow-2xl lg:block"
        alt="Vista previa de firma"
      />

      <BaseForm v-if="handleForm" method="POST" :submit="handleSubmitMachine">
        <div
          v-if="hasPrincipalMachine"
          class="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-slate-600"
        >
          Se detecto una maquina principal asociada al aprendiz. Los datos se cargan automaticamente y puedes ajustarlos si necesitas registrar otra referencia.
        </div>

        <BaseSelect
          :disabled="maquinaRegistrada.pc || maquinaRegistrada.vh"
          placeholder="Tipo de máquina"
          v-model:model-value="formMachine.TipoMaquina"
          :options="optionsMachine"
        />
        <BaseSelect
          v-if="formMachine.TipoMaquina === 'vh'"
          placeholder="Tipo de vehiculo"
          v-model:model-value="formMachine.tipoVehiculo"
          :options="optionsVehicle"
        />
        <BaseField
          v-if="!isBicycle"
          v-model="formMachine.modeloMaquina"
          label="Marca de la máquina"
          place-holder="Marca"
          type="text"
        />
        <BaseField
          v-if="!isBicycle"
          v-model="formMachine.placaSerial"
          :max-length="formMachine.TipoMaquina === 'vh' ? 7 : 100"
          label="Placa o serial"
          place-holder="Placa o serial"
          type="text"
        />

        <BaseText
          :text="message.message || errorMachine"
          :type="message.message ? message.type : 'error'"
          text-class="text-sm font-medium"
        />

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
        ifYes="Sí­, Registrar"
        ifNo="No, Finalizar"
        @confirm="handleConfirmAnother"
        @cancel="handleCancelAnother"
      />

      <ModalConfirm
        ref="modalBorrow"
        title="Registro de Maquina"
        subTitle="Esta máquina ya tiene un dueño. ¿El aprendiz decidio prestar esta maquina?"
        ifYes="Sí­, y quiero prestarla"
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
import { ref,watch, computed, onMounted, nextTick } from 'vue'
import BaseForm from '@/components/Forms/BaseForm.vue'
import BaseSelect from '@/components/Forms/BaseSelect.vue'
import BaseField from '@/components/Forms/BaseField.vue'
import BaseText from '@/components/Text/BaseText.vue'
import BaseButtonOpen from '@/components/Buttons/BaseButtonOpen.vue'
import BaseButton from '@/components/Buttons/BaseButton.vue'
import { useMachineForm } from '@/composables/Forms/useMachineForm'
import { useMachineFormService } from '@/composables/API/useMachineFormService'
import { useMachineService } from '@/composables/API/useMachineService'
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
const principalMachineLoading = ref(false)
const emit = defineEmits<{
  (e: "close"): void
}>()

const props = defineProps<{
  aprendiz: Aprendiz
}>()

// 1. crear el form
const form = useMachineForm()

// 2. pasar el form al service
const {submitMachine,forzarExcepcion} = useMachineFormService(form)
const { getPrincipalMachine } = useMachineService()
const {emitirAbrirFirma,recibirFirmaMovil} = useMachineSocket(form)

// 3. mensajes
const { message, clearMessage } = useMessage()

// 4. desestructurar lo necesario del form
const {
  formMachine,
  maquinaRegistrada,
  validateMachineForm,
  errorMachine,
  isBicycle,
  registerOtherMachine,
  endFlowMachine,
  resetMachineForm
} = form

const hasPrincipalMachine = computed(() =>
  !!form.principalMachine.value?.pc || !!form.principalMachine.value?.vh
)

const confirmMessage = computed(() => {
  if (maquinaRegistrada.pc) return 'Desea registrar tambien un vehiculo?'
  if (maquinaRegistrada.vh) return 'Desea registrar tambien un computador?'
  return ''
})

const applyPrincipalMachine = async (preferredType?: 'pc' | 'vh') => {
  const principalData = form.principalMachine.value

  if (!principalData?.pc && !principalData?.vh) {
    console.log('[RegisterMachine] No hay maquina principal para autocompletar')
    return
  }

  const resolvedType = preferredType
    ?? ((formMachine.TipoMaquina as 'pc' | 'vh' | '') || (principalData.pc ? 'pc' : 'vh'))

  formMachine.TipoMaquina = resolvedType
  await nextTick()
  console.log('[RegisterMachine] Aplicando autocompletado:', {
    resolvedType,
    principalData
  })

  if (resolvedType === 'pc' && principalData.pc) {
    formMachine.tipoVehiculo = ''
    formMachine.modeloMaquina = principalData.pc.marca ?? ''
    formMachine.placaSerial = principalData.pc.serial ?? ''
    console.log('[RegisterMachine] Formulario autocompletado con computador principal:', {
      tipo: formMachine.TipoMaquina,
      marca: formMachine.modeloMaquina,
      serial: formMachine.placaSerial
    })
    return
  }

  if (resolvedType === 'vh' && principalData.vh) {
    formMachine.tipoVehiculo = principalData.vh.tipo_vehiculo ?? ''
    formMachine.modeloMaquina = principalData.vh.marca ?? ''
    formMachine.placaSerial = principalData.vh.placa ?? ''
    console.log('[RegisterMachine] Formulario autocompletado con vehiculo principal:', {
      tipo: formMachine.TipoMaquina,
      tipoVehiculo: formMachine.tipoVehiculo,
      marca: formMachine.modeloMaquina,
      placa: formMachine.placaSerial
    })
  }
}

const loadPrincipalMachine = async (aprendiz?: Aprendiz) => {
  if (!aprendiz?.id_aprendiz) {
    form.principalMachine.value = null
    console.log('[RegisterMachine] Aprendiz sin id, no se consulta maquina principal')
    return
  }

  principalMachineLoading.value = true
  console.log('[RegisterMachine] Consultando maquina principal para:', {
    id_aprendiz: aprendiz.id_aprendiz,
    nombre: aprendiz.nombre,
    apellido: aprendiz.apellido
  })

  try {
    const data = await getPrincipalMachine(aprendiz.id_aprendiz)
    form.principalMachine.value = data
    console.log('[RegisterMachine] Maquina principal cargada en el formulario:', data)
    await applyPrincipalMachine()
  } catch (error) {
    console.error(error)
    form.principalMachine.value = null
  } finally {
    principalMachineLoading.value = false
  }
}

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
  // no necesitas cerrar, el modal ya se cerro solo
}

const handleRegisterOther = () => {
    forzarExcepcion.value = true
  modalConfirmExists.value.close()

  setTimeout(async () => {
    await handleSubmitMachine()
  }, 300)
}

const handleNotRegisterOther = () => {
  // igual aqui­
}

onMounted(() => {
  form.aprendizMachine.value = { ...props.aprendiz, firma: '' }
  clearMessage()
  loadPrincipalMachine(props.aprendiz)
})

watch(()=>props.aprendiz, (aprendiz) => {
  if (aprendiz) {
    console.log('[RegisterMachine] Cambio de aprendiz recibido por props:', aprendiz)
    form.aprendizMachine.value = { ...aprendiz, firma: '' }
    clearMessage()
    loadPrincipalMachine(aprendiz)
  }
})

watch(() => formMachine.TipoMaquina, (tipo) => {
  if (!tipo || principalMachineLoading.value || !form.principalMachine.value) {
    return
  }

  if (tipo === 'pc' && form.principalMachine.value.pc) {
    formMachine.tipoVehiculo = ''
    formMachine.modeloMaquina = form.principalMachine.value.pc.marca ?? ''
    formMachine.placaSerial = form.principalMachine.value.pc.serial ?? ''
  }

  if (tipo === 'vh' && form.principalMachine.value.vh) {
    formMachine.tipoVehiculo = form.principalMachine.value.vh.tipo_vehiculo ?? ''
    formMachine.modeloMaquina = form.principalMachine.value.vh.marca ?? ''
    formMachine.placaSerial = form.principalMachine.value.vh.placa ?? ''
  }
})

</script>
