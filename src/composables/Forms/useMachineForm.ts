import { reactive,ref,computed,watch } from "vue"
import { useMessage } from "../useMessage"
import type { Aprendiz } from "@/types/aprendiz.types"

export const useMachineForm = () => {
  const submittedMachine = ref(false)
  const aprendizMachine = ref<Aprendiz | null>()
  const {setMessage} = useMessage()

  const formMachine = reactive({ modeloMaquina: '', TipoMaquina: '', tipoVehiculo: '', placaSerial: '' })
  const maquinaRegistrada = reactive({ pc: false, vh: false })

  const dobleMaquina = ref(false)

  const openMachineForm = (aprendiz: Aprendiz) => {
    maquinaRegistrada.pc = false
    maquinaRegistrada.vh = false
    aprendizMachine.value = aprendiz


    for (const key in formMachine) {
      formMachine[key as keyof typeof formMachine] = ''
    }
  }

  const resetMachineForm = () => {
    formMachine.TipoMaquina = ''
    formMachine.tipoVehiculo = ''
    formMachine.modeloMaquina = ''
    formMachine.placaSerial = ''

    if (aprendizMachine.value) {
      aprendizMachine.value = null
    }

    maquinaRegistrada.pc = false
    maquinaRegistrada.vh = false

    dobleMaquina.value = false
    submittedMachine.value = false
  }

  const validateMachineForm = () => {
    if (!formMachine.TipoMaquina) return 'Debe seleccionar el tipo de maquina'
    if (formMachine.TipoMaquina === 'vh' && !formMachine.tipoVehiculo) return 'Debe seleccionar tipo de vehiculo'
    if (!formMachine.modeloMaquina) return 'Todos los campos son obligatorios'
    if (!formMachine.placaSerial) return 'Todos los campos son obligatorios'
    if (!aprendizMachine.value?.firma) return 'Debe ingresar una firma'
    return ''
  }

  const errorMachine = computed(() => {
    if (!submittedMachine.value) return ''
    return validateMachineForm() || ''
  })


  const registerOtherMachine = () => {
    dobleMaquina.value = true
    if (maquinaRegistrada.pc) formMachine.TipoMaquina = 'vh'
    if (maquinaRegistrada.vh) formMachine.TipoMaquina = 'pc'

  }
  const endFlowMachine = () => {
    dobleMaquina.value = false
    resetMachineForm()
  }

  //  RESET DE ESTADO
  watch(formMachine, () => {
    submittedMachine.value = false
  }, { deep: true })

  //  CAMBIO DE TIPO
  watch(() => formMachine.TipoMaquina, () => {
    formMachine.placaSerial = ''
    formMachine.tipoVehiculo = ''
    formMachine.modeloMaquina = ''
    setMessage('', 'error')
  })

  //  NORMALIZACIÓN
  watch(() => formMachine.modeloMaquina, (v) => {
    if (!v) return
    const upper = v.toUpperCase()
    if (upper !== v) formMachine.modeloMaquina = upper
  })

  //  FORMATO DE PLACA
  watch(() => formMachine.placaSerial, (v) => {
    if (!v) return

    let value = v.replace(/[^A-Za-z0-9]/g, '').toUpperCase()

    if (formMachine.TipoMaquina === 'vh') {
      if (value.length > 7) value = value.slice(0, 7)
      if (value.length > 3) value = value.slice(0, 3) + '-' + value.slice(3)
    }

    if (value !== v) formMachine.placaSerial = value
  })

  return {
    openMachineForm,
    resetMachineForm,
    validateMachineForm,
    errorMachine,
    formMachine,
    dobleMaquina,
    maquinaRegistrada,
    submittedMachine,
    aprendizMachine,
    registerOtherMachine,
    endFlowMachine
  }
}
