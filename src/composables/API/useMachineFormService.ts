import { useMachineForm } from "../Forms/useMachineForm"
import { API_URL } from '@/config/network'
import { useMessage } from "../useMessage"
import type { MachineResponse } from "@/types/machine.types"
import { useAprendiz } from "../useAprendiz"
import type { handleMachineType } from "@/types/handleMachine.types"
const API = API_URL




export const useMachineFormService = (form: ReturnType<typeof useMachineForm>) => {
  const {setMessage} = useMessage()
  const {HistorialIngresoAprendiz} = useAprendiz()

  const buildMachinePayload = () => ({
    tipoMaquina: form.formMachine.TipoMaquina,
    tipoVehiculo: form.formMachine.tipoVehiculo,
    modelo: form.formMachine.modeloMaquina.toUpperCase(),
    placaSerial: form.formMachine.placaSerial.toUpperCase(),
    firma: form.aprendizMachine.value?.firma,
  })

  const submitMachine = async (id_aprendiz?: number) => {

  if (!id_aprendiz || form.submittedMachine.value) return

  const errorMachine = form.validateMachineForm()
  if (errorMachine) {
    setMessage(errorMachine, 'error')
    return
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


    if (!response.ok) {
      setMessage('Error al registrar la maquina','error')
      form.submittedMachine.value = false // desbloquea pero no deja spam
      return
    }

    console.log(data)

    return  await handleMachineSuccess()

  } catch (error) {
    console.error(error)
  } finally {
    form.submittedMachine.value = false
  }
  }

  const handleMachineSuccess = async () : Promise<handleMachineType> =>  {
    setMessage('Maquina ingresada con exito','success')
    await HistorialIngresoAprendiz()

    if (form.formMachine.TipoMaquina === 'pc') form.maquinaRegistrada.pc = true
    if (form.formMachine.TipoMaquina === 'vh') form.maquinaRegistrada.vh = true

    if (!form.dobleMaquina.value && form.maquinaRegistrada.pc !== form.maquinaRegistrada.vh) {
      return 'registrarOtraMaquina'
    } else {
      form.resetMachineForm()
    }
    return 'ok'
  }



  return {
    submitMachine
  }
}
