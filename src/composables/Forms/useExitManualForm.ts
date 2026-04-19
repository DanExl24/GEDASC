import { reactive, watch } from 'vue'
import { useMessage } from '@/composables/useMessage'
import type {
  ManualExitDocumentHandler,
  ManualExitFormData,
} from '@/types/manualExit.types'

export const useExitManualForm = () => {
  const { message, setMessage, clearMessage } = useMessage()

  const formManual = reactive<ManualExitFormData>({
    documento: '',
    nombre: '',
    apellido: '',
    formacion: '',
  })

  const clearAprendizData = () => {
    formManual.nombre = ''
    formManual.apellido = ''
    formManual.formacion = ''
  }

  const resetForm = () => {
    formManual.documento = ''
    clearAprendizData()
    clearMessage()
  }

  const validateForm = () => {
    if (!formManual.documento) {
      setMessage('Ingrese un documento de identidad', 'error')
      return false
    }

    if (formManual.documento.length !== 10) {
      setMessage('El DNI debe tener 10 digitos', 'error')
      return false
    }

    if (!/^\d{10}$/.test(formManual.documento)) {
      setMessage('El DNI debe contener solo numeros', 'error')
      return false
    }

    return true
  }

  const validateDocumentRealtime = (documento: string) => {
    if (!documento) {
      clearMessage()
      clearAprendizData()
      return false
    }

    if (documento.length !== 10) {
      clearMessage()
      clearAprendizData()
      return false
    }

    if (!/^\d{10}$/.test(documento)) {
      setMessage('Solo numeros validos', 'error')
      clearAprendizData()
      return false
    }

    return true
  }

  const watchDocument = (onDocumentChange: ManualExitDocumentHandler) =>
    watch(
      () => formManual.documento,
      async (documento) => {
        if (!validateDocumentRealtime(documento)) return

        await onDocumentChange(documento)
      },
    )

  return {
    formManual,
    message,
    setMessage,
    clearMessage,
    clearAprendizData,
    resetForm,
    validateForm,
    watchDocument,
  }
}
