import { API_URL } from '@/config/network'

type ApiEnvelope<T> = {
  success: boolean
  data?: T
  message?: string
}

export interface AdminAprendizRow {
  id_aprendiz: string
  nombre: string
  apellido: string
  documento: string
  [key: string]: unknown
}

export interface AdminTrackRow {
  id_aprendiz: string
  nombre: string
  apellido: string
  documento: string
  total_sesiones: number | string
  dias_activos: number | string
  horas_reales: number | string
  ultima_visita: string | null
  [key: string]: unknown
}

export interface AdminExitRow {
  aprendiz: {
    id: string
    documento: string
    nombreCompleto: string
    formacion: string
    salida: 'EXITOSA' | 'NO_EXISTE'
  }
}

export interface AdminMachineRecord {
  pc: {
    marca: string | null
    serial: string | null
    estado?: 'PRINCIPAL' | 'SECUNDARIO'
  } | null
  vh: {
    tipo_vehiculo: string | null
    marca: string | null
    placa: string | null
    estado?: 'PRINCIPAL' | 'SECUNDARIO'
  } | null
  firma: string | null
  aprendices: {
    actual: {
      id: string | null
    }
    owner: {
      id: string | null
      name: string | null
    }
  }
}

const buildHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`
})

const ensureSuccess = async <T>(response: Response): Promise<T> => {
  const text = await response.text()

  const payload = JSON.parse(text)
  return payload.data
}

export const getAdminAprendices = async (token: string) => {
  const response = await fetch(`${API_URL}/api/admin/aprendices`, {
    headers: buildHeaders(token)
  })

  return ensureSuccess<AdminAprendizRow[]>(response)
}

export const getAdminTrack = async (token: string, search = '') => {
  const params = new URLSearchParams()

  if (search.trim()) {
    params.set('search', search.trim())
  }

  const query = params.toString()
  const response = await fetch(`${API_URL}/api/admin/track${query ? `?${query}` : ''}`, {
    headers: buildHeaders(token)
  })

  return ensureSuccess<AdminTrackRow[]>(response)
}

export const getAdminMachinesByAprendiz = async (token: string, idAprendiz: string) => {
  const response = await fetch(`${API_URL}/api/admin/allMachines/${idAprendiz}`, {
    headers: buildHeaders(token)
  })

  const data = await ensureSuccess<AdminMachineRecord[]>(response)

  return [...data].sort((a, b) => {
    const aPriority = a.pc?.estado === 'PRINCIPAL' || a.vh?.estado === 'PRINCIPAL' ? 1 : 0
    const bPriority = b.pc?.estado === 'PRINCIPAL' || b.vh?.estado === 'PRINCIPAL' ? 1 : 0

    return bPriority - aPriority
  })
}

export const getAdminExits = async (token: string) => {
  const response = await fetch(`${API_URL}/api/admin/statsExits`, {
    headers: buildHeaders(token)
  })

  return ensureSuccess<AdminExitRow[]>(response)
}