import { useMachineForm } from "../Forms/useMachineForm"
import { API_URL } from '@/config/network'
import { useMessage } from "../useMessage"
import type { SubmitMachineResult,MachineResponse,handleMachineType  } from "@/types/machine.types"
import { useAprendiz } from "../useAprendiz"
import { ref } from "vue"
import { useNotifications } from '@/composables/useNotifications';
const {addNotification} = useNotifications()
const API = API_URL




export const useMachineFormService = (form: ReturnType<typeof useMachineForm>) => {
  const {setMessage} = useMessage()
  const {HistorialIngresoAprendiz} = useAprendiz()
  const forzarExcepcion = ref(false)

  const buildMachinePayload = () => ({
    tipoMaquina: form.formMachine.TipoMaquina,
    tipoVehiculo: form.formMachine.tipoVehiculo,
    modelo: form.formMachine.modeloMaquina.toUpperCase(),
    placaSerial: form.formMachine.placaSerial.toUpperCase(),
    firma: form.aprendizMachine.value?.firma,
    forzarExcepcion: forzarExcepcion.value
  })

  const submitMachine = async (id_aprendiz?: number) : Promise<SubmitMachineResult> => {

  if (!id_aprendiz) return {status:'error'}

  const errorMachine = form.validateMachineForm()
  if (errorMachine) {
    setMessage(errorMachine, 'error')
    return {status:'error'}
  }

  form.submittedMachine.value = true

  try {
    const endpoint = form.dobleMaquina.value
      ? `${API}/api/registroIngresos/ingresoDobleMaquina/${id_aprendiz}`
      : `${API}/api/registroIngresos/ingresoMaquina/${id_aprendiz}`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildMachinePayload()),
    })
    const data: MachineResponse = await response.json()

    console.log(data)


    if (data.inconsistencia) {
      return { status: 'inconsistencia', data }
    }

    if (!response.ok) {
      addNotification('Error al registrar la maquina','error')
      return { status: 'error' }
    }

    console.log(data)

    return {status : await handleMachineSuccess()}

  } catch (error) {
    console.error(error)
    return {status : 'error'}
  } finally {
    form.submittedMachine.value = false
  }
  }


  const handleMachineSuccess = async (): Promise<handleMachineType> => {
    setMessage('Maquina ingresada con exito', 'success')
    addNotification('Maquina ingresada con exito', 'success')
    await HistorialIngresoAprendiz()

    if (form.formMachine.TipoMaquina === 'pc') form.maquinaRegistrada.pc = true
    if (form.formMachine.TipoMaquina === 'vh') form.maquinaRegistrada.vh = true

    if (!form.dobleMaquina.value && form.maquinaRegistrada.pc !== form.maquinaRegistrada.vh) {
      return 'registrarOtraMaquina'
    }

    form.resetMachineForm()
    return 'ok'
  }

  return {
    submitMachine,
    forzarExcepcion
  }
}
