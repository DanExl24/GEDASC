import { ref, computed } from 'vue'
import { API_URL } from '@/config/network'
import { useAuthStore } from '@/stores/auth'
import { registrarDispositivoMovil } from '@/composables/sockets/InitSocketsEvent'

export interface ValidadorInfo {
  device_id?: string
  nombre_dispositivo?: string
  usuario?: string
  fecha_registro?: string
  ultimo_ping?: string
}

const esValidadorActivo = ref<boolean>(false)
const cargandoValidador = ref<boolean>(false)
const validadorExistenteInfo = ref<ValidadorInfo | null>(null)

export const getDeviceId = (): string => {
  let id = localStorage.getItem('gedasc_device_id')
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'dev_' + Math.random().toString(36).substring(2, 15)
    localStorage.setItem('gedasc_device_id', id)
  }
  return id
}

export const getDeviceName = (): string => {
  const userAgent = navigator.userAgent
  let deviceName = 'Dispositivo Móvil'

  if (/iPhone/i.test(userAgent)) deviceName = 'iPhone'
  else if (/iPad/i.test(userAgent)) deviceName = 'iPad'
  else if (/Android/i.test(userAgent)) deviceName = 'Dispositivo Android'
  else if (/Macintosh/i.test(userAgent)) deviceName = 'Mac'
  else if (/Windows/i.test(userAgent)) deviceName = 'Windows PC'

  return deviceName
}

interface NavigatorWithUserAgentData extends Navigator {
  userAgentData?: {
    mobile?: boolean
  }
}

export const isRealMobileDevice = computed(() => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false

  const ua = navigator.userAgent || ''

  // Descartar explícitamente sistemas de escritorio Windows y macOS
  if (/Windows NT/i.test(ua)) return false
  if (/Macintosh/i.test(ua) && !('ontouchend' in document)) return false

  // Validar si el agente pertenece a un SO móvil real (Android, iPhone, iPad, etc.)
  const isMobileOS = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
  const nav = navigator as NavigatorWithUserAgentData
  const isMobileUAData = nav.userAgentData?.mobile === true

  return isMobileOS || isMobileUAData
})

export const isTouchDevice = isRealMobileDevice

export const useDeviceValidator = () => {
  const auth = useAuthStore()
  const deviceId = getDeviceId()

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {})
  })

  const consultarEstadoValidador = async () => {
    cargandoValidador.value = true
    try {
      const response = await fetch(`${API_URL}/api/validador/estado`, {
        headers: getHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        if (data.activo && data.validador?.device_id === deviceId) {
          esValidadorActivo.value = true
        } else {
          esValidadorActivo.value = false
          if (data.activo) {
            validadorExistenteInfo.value = data.validador
          }
        }
      }
    } catch (error) {
      console.error('[useDeviceValidator] Error consultando estado:', error)
    } finally {
      cargandoValidador.value = false
    }
  }

  const activarValidador = async (forzarDesactivacion = false) => {
    cargandoValidador.value = true
    try {
      const response = await fetch(`${API_URL}/api/validador/activar`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          device_id: deviceId,
          nombre_dispositivo: getDeviceName(),
          forzarDesactivacion
        })
      })

      const data = await response.json()

      if (response.status === 409) {
        validadorExistenteInfo.value = data.validadorActual
        return { ok: false, conflict: true, data }
      }

      if (response.ok) {
        esValidadorActivo.value = true
        validadorExistenteInfo.value = null
        registrarDispositivoMovil()
        return { ok: true, data }
      }

      return { ok: false, conflict: false, data }
    } catch (error) {
      console.error('[useDeviceValidator] Error al activar validador:', error)
      return { ok: false, conflict: false, message: String(error) }
    } finally {
      cargandoValidador.value = false
    }
  }

  const desactivarValidador = async (password: string) => {
    cargandoValidador.value = true
    try {
      const response = await fetch(`${API_URL}/api/validador/desactivar`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ device_id: deviceId, password })
      })

      const data = await response.json()

      if (response.ok) {
        esValidadorActivo.value = false
        registrarDispositivoMovil()
        return { ok: true, data }
      }

      return { ok: false, message: data.message || 'No se pudo desvincular el dispositivo.' }
    } catch (error) {
      console.error('[useDeviceValidator] Error al desactivar validador:', error)
      return { ok: false, message: 'Error de conexión al servidor' }
    } finally {
      cargandoValidador.value = false
    }
  }

  return {
    deviceId,
    isRealMobileDevice,
    isTouchDevice,
    esValidadorActivo,
    cargandoValidador,
    validadorExistenteInfo,
    consultarEstadoValidador,
    activarValidador,
    desactivarValidador
  }
}
