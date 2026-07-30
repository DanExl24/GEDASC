import { ref, computed } from 'vue'
import { API_URL } from '@/config/network'
import { useAuthStore } from '@/stores/auth'
import { registrarDispositivoMovil } from '@/composables/sockets/InitSocketsEvent'

const esValidadorActivo = ref<boolean>(false)
const cargandoValidador = ref<boolean>(false)
const validadorExistenteInfo = ref<any>(null)

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

export const isTouchDevice = computed(() => {
  if (typeof window === 'undefined') return false
  const hasTouchPoints = navigator.maxTouchPoints > 0
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  return hasTouchPoints || isMobileUA
})

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

  const desactivarValidador = async () => {
    cargandoValidador.value = true
    try {
      const response = await fetch(`${API_URL}/api/validador/desactivar`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ device_id: deviceId })
      })

      if (response.ok) {
        esValidadorActivo.value = false
        registrarDispositivoMovil()
        return true
      }
      return false
    } catch (error) {
      console.error('[useDeviceValidator] Error al desactivar validador:', error)
      return false
    } finally {
      cargandoValidador.value = false
    }
  }

  return {
    deviceId,
    isTouchDevice,
    esValidadorActivo,
    cargandoValidador,
    validadorExistenteInfo,
    consultarEstadoValidador,
    activarValidador,
    desactivarValidador
  }
}
