import { API_URL } from '@/config/network'

export type AdminDateFilter =
  | 'TODAY'
  | 'YESTERDAY'
  | 'THIS_WEEK'
  | 'LAST_WEEK'
  | 'THIS_MONTH'
  | 'LAST_MONTH'
  | 'THIS_QUARTER'

export interface AdminIngressEgressRecord {
  id_ingreso: number
  id_aprendiz: number
  nombre: string
  apellido: string
  documento: string
  hora_ingreso: string | null
  hora_salida: string | null
}

type ApiEnvelope<T> = {
  success: boolean
  data?: T
  message?: string
}

type DeletePayload = {
  verification: string
  date: string
  observation: string
}

const buildHeaders = (token: string, withJson = false) => ({
  Authorization: `Bearer ${token}`,
  ...(withJson ? { 'Content-Type': 'application/json' } : {})
})

const ensureSuccess = async <T>(response: Response): Promise<T> => {
  const payload = await response.json() as ApiEnvelope<T>

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new Error(payload.message || 'No fue posible completar la operacion administrativa.')
  }

  return payload.data
}

export const getAdminIngressEgress = async (
  token: string,
  filters: { search?: string; date?: AdminDateFilter } = {}
) => {
  const params = new URLSearchParams()

  if (filters.search?.trim()) {
    params.set('search', filters.search.trim())
  }

  if (filters.date) {
    params.set('dates', filters.date)
  }

  const query = params.toString()
  const response = await fetch(`${API_URL}/api/admin/ingresos${query ? `?${query}` : ''}`, {
    headers: buildHeaders(token)
  })

  return ensureSuccess<AdminIngressEgressRecord[]>(response)
}

const deleteAdminRecord = async (
  token: string,
  path: string,
  payload: DeletePayload
) => {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    headers: buildHeaders(token, true),
    body: JSON.stringify(payload)
  })

  const data = await response.json() as ApiEnvelope<null>

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'No fue posible eliminar el registro.')
  }
}

export const deleteAdminIngreso = async (
  token: string,
  idAprendiz: number,
  payload: DeletePayload
) => deleteAdminRecord(token, `/api/admin/ingresos/${idAprendiz}`, payload)

export const deleteAdminSalida = async (
  token: string,
  idAprendiz: number,
  payload: DeletePayload
) => deleteAdminRecord(token, `/api/admin/salidas/${idAprendiz}`, payload)
