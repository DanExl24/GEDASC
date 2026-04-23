import { ref } from "vue"

const message = ref({ message: '', type: 'error' as 'error' | 'success' })

export const useMessage = () => {
  const setMessage = (msg : string, type : "error" | "success" ) => {
    message.value.message = msg
    message.value.type = type
  }
  const clearMessage = () => {
    message.value.message = ''
    message.value.type = 'error'
  }
  return {
    message,
    setMessage,
    clearMessage
  }
}
