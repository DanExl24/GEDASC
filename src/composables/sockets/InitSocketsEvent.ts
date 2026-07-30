import { connectSocket } from '@/socket'
import { ref } from 'vue'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import { getDeviceId } from '@/composables/useDeviceValidator'

const socket = connectSocket()
export const documentoAprendiz = ref<string | undefined>()
export const movilAutorizado = ref<boolean | null>(null)
export const movilAuthMessage = ref<string>('')

export const eventoCerrarFirma = ref<number>(0)
export const eventoAbrirFirma = ref<{ documento: string; ts: number } | null>(null)

let initialized = false

export const registrarDispositivoMovil = () => {
  const auth = useAuthStore()
  const deviceId = getDeviceId()
  const deviceKey = localStorage.getItem('mobileDeviceKey') || ''
  socket.emit('registrar', {
    tipo: 'movil',
    token: auth.token,
    deviceId,
    device_id: deviceId,
    deviceKey
  })
}

export const InitSocketsEvent = () => {
  if (initialized) return
  initialized = true

  socket.on('connect', () => {
    console.log('Móvil conectado, id socket:', socket.id)
    registrarDispositivoMovil()
  })

  socket.on('autorizacionMovil', ({ status, message }: { status: 'ok' | 'denied'; message: string }) => {
    movilAutorizado.value = status === 'ok'
    movilAuthMessage.value = message
  })

  socket.on('cerrarFirma', ({ documento }) => {
    console.log('Cerrar firma recibido en móvil:', documento)
    eventoCerrarFirma.value++
  })

  socket.on('cerrarFirmaEnMovil', ({ documento }) => {
    console.log('Cerrar firma en móvil recibido:', documento)
    eventoCerrarFirma.value++
  })

  socket.on('abrirFirma', ({ documento }) => {
    if (movilAutorizado.value === true) {
      documentoAprendiz.value = documento
      eventoAbrirFirma.value = { documento, ts: Date.now() }
      if (router.currentRoute.value.path !== `/mobile-view/firma/${documento}`) {
        router.push(`/mobile-view/firma/${documento}`)
      }
    }
  })
}
