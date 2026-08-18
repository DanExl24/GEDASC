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
    const doc = formManual.documento.trim()
    if (!doc) {
      setMessage('Ingrese un documento de identidad', 'error')
      return false
    }

    if (doc.length < 5 || doc.length > 20) {
      setMessage('El documento debe tener entre 5 y 20 caracteres', 'error')
      return false
    }

    if (!/^[A-Za-z0-9-]+$/.test(doc)) {
      setMessage('El documento solo puede contener números, letras y guiones', 'error')
      return false
    }

    return true
  }

  const setManualForm = async (documento: string) => {
    const doc = documento ? documento.trim() : ''
    if (!doc || doc.length < 5) {
      alerta.value.message = ''
      formManual.nombre = ''
      formManual.apellido = ''
      formManual.formacion = ''
      return
    }

    try {
      const response = await fetch(`${API}/api/registroIngresos/ingresoManual/${doc}`)
      const data = await response.json()

      if (response.ok && data.result) {
        formManual.nombre = data.result.nombre || ''
        formManual.apellido = data.result.apellido || ''
        formManual.formacion = data.result.formacion || 'Sin formación asignada'
      }
    } catch (error) {
      console.error(error)
    }
  }

  watch(
    () => formManual.documento,
    async (doc) => {
      const cleanDoc = doc ? doc.trim() : ''
      if (!cleanDoc || cleanDoc.length < 5) {
        alerta.value.message = ''
        formManual.nombre = ''
        formManual.apellido = ''
        formManual.formacion = ''
        return
      }

      if (!/^[A-Za-z0-9-]+$/.test(cleanDoc)) {
        setMessage('Caracteres no válidos en el documento', 'error')
        return
      }

      try {
        const res = await fetch(`${API}/api/registroIngresos/ingresoManual/${cleanDoc}`)
        const data = await res.json()

        if (!res.ok || !data.result) {
          formManual.nombre = ''
          formManual.apellido = ''
          formManual.formacion = ''
          setMessage('No existe en la base de datos', 'error')
          return
        }

        formManual.nombre = data.result.nombre || ''
        formManual.apellido = data.result.apellido || ''
        formManual.formacion = data.result.formacion || 'Sin formación asignada'

        setMessage('Aprendiz encontrado', 'success')
      } catch (e) {
        console.error(e)
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
