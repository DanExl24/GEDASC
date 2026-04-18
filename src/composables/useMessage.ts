import { ref } from "vue"

export const useMessage = () => {
  const message = ref({ message: '', type: 'error' as 'error' | 'success' })
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
