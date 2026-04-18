import { reactive, ref , watch } from "vue";
import { API_URL } from '@/config/network'
import { useMessage } from "./useMessage";
const {setMessage} = useMessage()
const API = API_URL

export const useManualForm = () => {
  const formManual = reactive({ documento: '', nombre: '', apellido: '', formacion: '' })
  const alerta = ref({ message: '', type: 'error' as 'error' | 'success' })
  const clearForm = () => {
    alerta.value.message = ''
    formManual.documento = ''
    formManual.nombre = ''
    formManual.apellido = ''
    formManual.formacion = ''
  }
  const validateForm = () => {
    if (!formManual.documento) {
      setMessage('Ingrese un documento de identidad', 'error')
      return false
    }

    if (formManual.documento.length !== 10) {
      setMessage('El DNI debe tener 10 dígitos', 'error')
      return false
    }

    if (!/^\d{10}$/.test(formManual.documento)) {
      setMessage('El DNI debe contener solo números', 'error')
      return false
    }

    return true
  }
  const setManualForm = async (documento : string) => {
    if (!documento || documento.length !== 10) {
      alerta.value.message = ''
      formManual.nombre = ''
      formManual.apellido = ''
      formManual.formacion = ''
      return
    }

    try {
      const response = await fetch(`${API}/api/registroIngresos/ingresoManual/${documento}`)
      const data = await response.json()

      formManual.nombre = data.result.nombre
      formManual.apellido = data.result.apellido
      formManual.formacion = data.result.formacion
    } catch (error) {
      console.error(error)
    }
  }
  watch(
    () => formManual.documento,
    async (doc) => {
      if (!doc) return

      if (doc.length !== 10) {
        alerta.value.message = ''
        formManual.nombre = ''
        formManual.apellido = ''
        formManual.formacion = ''
        return
      }

      if (!/^\d{10}$/.test(doc)) {
        setMessage('Solo números válidos', 'error')
        return
      }

      try {
        const res = await fetch(`${API}/api/registroIngresos/ingresoManual/${doc}`)
        const data = await res.json()

        if (!res.ok) {
          setMessage('No existe en la base de datos', 'error')
          return
        }

        formManual.nombre = data.result.nombre
        formManual.apellido = data.result.apellido
        formManual.formacion = data.result.formacion

        setMessage('Aprendiz encontrado', 'success')

      } catch (e) {
        console.log(e)
        setMessage('Error consultando datos', 'error')
      }
    }
  )
  return {
    formManual,
    clearForm,
    validateForm,
    alerta,
    setManualForm
  }
}
