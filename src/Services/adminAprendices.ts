import { API_URL } from '@/config/network'
import type { Formacion } from '@/types/aprendiz.types'

export interface AdminAprendizRow {
  id_aprendiz: string
  nombre: string
  apellido: string
  documento: string
  es_monitor?: boolean
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

export const toggleAdminMonitor = async (token: string, idAprendiz: string, esMonitor: boolean) => {
  const response = await fetch(`${API_URL}/api/admin/aprendices/toggleMonitor/${idAprendiz}`, {
    method: 'POST',
    headers: {
      ...buildHeaders(token),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ es_monitor: esMonitor })
  })

  if (!response.ok) {
    throw new Error('Error al actualizar el estado de monitor')
  }

  return response.json()
}

export const getAdminFormacionesAprendiz = async (token: string, idAprendiz: string) => {
  const response = await fetch(`${API_URL}/api/admin/aprendices/${idAprendiz}/formaciones`, {
    headers: buildHeaders(token)
  })

  return ensureSuccess<{ asignadas: Formacion[]; todas: Formacion[] }>(response)
}

export const asignarFormacionAdmin = async (token: string, idAprendiz: string, idFormacion: number) => {
  const response = await fetch(`${API_URL}/api/admin/aprendices/${idAprendiz}/formaciones`, {
    method: 'POST',
    headers: {
      ...buildHeaders(token),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id_formacion: idFormacion })
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Error al asignar formación')
  }

  return data
}

export const desvincularFormacionAdmin = async (token: string, idAprendiz: string, idFormacion: number) => {
  const response = await fetch(`${API_URL}/api/admin/aprendices/${idAprendiz}/formaciones/${idFormacion}`, {
    method: 'DELETE',
    headers: buildHeaders(token)
  })

  if (!response.ok) {
    throw new Error('Error al desvincular formación')
  }

  return response.json()
}

export interface CreateAprendizPayload {
  documento: string
  nombre: string
  apellido: string
  es_monitor?: boolean
  id_formacion?: number | null
}

export interface UpdateAprendizPayload {
  documento?: string
  nombre?: string
  apellido?: string
  es_monitor?: boolean
  estado?: boolean
}

export interface BulkAprendizItem {
  documento: string
  nombre: string
  apellido: string
  es_monitor?: boolean
}

export interface BulkCreateAprendicesResponse {
  summary: {
    total: number
    creados: number
    yaRegistrados: number
    errores: number
  }
  detalles: Array<{
    documento: string
    nombre?: string
    apellido?: string
    estado: 'creado' | 'ya_registrado' | 'error'
    motivo?: string
  }>
}

export const createAdminAprendiz = async (token: string, payload: CreateAprendizPayload) => {
  const response = await fetch(`${API_URL}/api/admin/aprendices`, {
    method: 'POST',
    headers: {
      ...buildHeaders(token),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || 'Error al registrar aprendiz')
  }
  return data
}

export const bulkCreateAdminAprendices = async (token: string, aprendices: BulkAprendizItem[]): Promise<BulkCreateAprendicesResponse> => {
  const response = await fetch(`${API_URL}/api/admin/aprendices/masivo`, {
    method: 'POST',
    headers: {
      ...buildHeaders(token),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ aprendices })
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || 'Error al procesar registro masivo de aprendices')
  }
  return data.data
}

export const updateAdminAprendiz = async (token: string, idAprendiz: string | number, payload: UpdateAprendizPayload) => {
  const response = await fetch(`${API_URL}/api/admin/aprendices/${idAprendiz}`, {
    method: 'PUT',
    headers: {
      ...buildHeaders(token),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || 'Error al actualizar aprendiz')
  }
  return data
}

export const toggleAdminAprendizStatus = async (token: string, idAprendiz: string | number) => {
  const response = await fetch(`${API_URL}/api/admin/aprendices/${idAprendiz}/toggle-status`, {
    method: 'PATCH',
    headers: buildHeaders(token)
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || 'Error al cambiar estado del aprendiz')
  }
  return data
}

export const deleteAdminAprendiz = async (token: string, idAprendiz: string | number) => {
  const response = await fetch(`${API_URL}/api/admin/aprendices/${idAprendiz}`, {
    method: 'DELETE',
    headers: buildHeaders(token)
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || 'Error al eliminar aprendiz')
  }
  return data
}