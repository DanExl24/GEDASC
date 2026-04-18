import { useMachineForm } from "../Forms/useMachineForm";
import { useMessage } from "../useMessage";
import { connectSocket } from '@/socket'
import { documentoAprendiz } from "./InitSocketsEvent";
import router from '@/router'
  const socket = connectSocket()
export const useMachineSocket = (form?: ReturnType<typeof useMachineForm>) => {
  const { setMessage } = useMessage()
  // ======================== LISTENERS PC =========================== //

    const emitirAbrirFirma = () => {
      if (!form?.aprendizMachine.value) {
      console.warn('No hay aprendiz aún')
      return
      }

      socket.emit('abrirFirmaEnMovil', {
      documento: form.aprendizMachine.value.documento
      })
    }

    const recibirFirmaMovil = () => {
      socket.on('firmaRegistrada', ({ documento, firma }: { documento: string; firma: string }) => {
      console.log('Firma recibida del movil:' + documento + firma)

      if (!form?.aprendizMachine.value) return

      form.aprendizMachine.value.firma = firma
      setMessage('Firma registrada con exito','success')


      router.push('/general-entry')

      setTimeout(() => {
      setMessage('','success')
      }, 1000)

      form.submittedMachine.value = false

      })
    }

    const emitirCerrarFirma = () => {
      socket.emit('cerrarFirmaEnMovil', {
      documento: form?.aprendizMachine.value?.documento,
      })
    }

  // ======================== LISTENERS MOVIL ======================== //

    const emitirFirmaRegistrada = (firma : string) => {
      socket.emit('firmaRegistrada', { documento: documentoAprendiz.value, firma: firma })
    }

  return {
    // Movil
    emitirFirmaRegistrada,
    // Pc
    emitirAbrirFirma,
    recibirFirmaMovil,
    emitirCerrarFirma
  }
}
