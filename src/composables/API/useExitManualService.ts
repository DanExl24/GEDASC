import { API_URL } from '@/config/network'
import { DetectExit } from '@/Services/DetectExits'
import { useExitManualForm } from '@/composables/Forms/useExitManualForm'
import { useExitAprendiz } from '@/composables/useExitAprendiz'
import type { ManualExitLookupResponse } from '@/types/manualExit.types'
import { useNotifications } from '@/composables/useNotifications';
const {addNotification} = useNotifications()
const API = API_URL

export const useExitManualService = (
  form: ReturnType<typeof useExitManualForm>,
) => {
  const { AñadirSalidaAprendiz } = useExitAprendiz()

  const loadAprendizByDocument = async (documento: string) => {
    if (!documento || documento.length !== 10) {
      form.clearMessage()
      form.clearAprendizData()
      return
    }

    if (!/^\d{10}$/.test(documento)) {
      form.setMessage('Solo numeros validos', 'error')
      form.clearAprendizData()
      return
    }

    try {
      const response = await fetch(
        `${API}/api/registroIngresos/ingresoManual/${documento}`,
      )
      const data: ManualExitLookupResponse = await response.json()

      if (!response.ok) {
        form.clearAprendizData()
        form.setMessage('No existe en la base de datos', 'error')
        return
      }

      form.formManual.nombre = data.result.nombre
      form.formManual.apellido = data.result.apellido
      form.formManual.formacion = data.result.formacion

      form.clearMessage()
    } catch (error) {
      console.error(error)
      form.setMessage('Error consultando datos', 'error')
    }
  }

  const submitManualExit = async () => {
    if (!form.validateForm()) return false

    const documento = form.formManual.documento.trim()
    const estado = await DetectExit(documento)

    if (estado === 'no_existe') {
      form.setMessage('El aprendiz no existe', 'error')
      return false
    }

    if (estado === 'ya_registrado') {
      addNotification('El aprendiz no tiene ingreso o ya tiene salida', 'warning')
      form.setMessage('El aprendiz no tiene ingreso o ya tiene salida', 'error')
      return false
    }

    if (estado === 'error') {
      form.setMessage('Ocurrio un error al procesar la solicitud', 'error')
      return false
    }

    const registrado = await AñadirSalidaAprendiz(documento)

    if (!registrado) {
      form.setMessage('Error al registrar la salida', 'error')
      return false
    }

    form.setMessage('Registro aceptado', 'success')
    addNotification('Registro Aceptado','success')
    return true
  }

  return {
    loadAprendizByDocument,
    submitManualExit,
  }
}
