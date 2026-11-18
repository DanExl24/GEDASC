import { apiFetch } from '@/Services/apiClient'

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

const ensureSuccess = async <T>(response: Response): Promise<T> => {
  const payload = await response.json() as ApiEnvelope<T>

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new Error(payload.message || 'No fue posible completar la operacion administrativa.')
  }

  return payload.data
}

export const getAdminIngressEgress = async (
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
  const response = await apiFetch(`/api/admin/ingresos${query ? `?${query}` : ''}`)

  return ensureSuccess<AdminIngressEgressRecord[]>(response)
}

const deleteAdminRecord = async (
  path: string,
  payload: DeletePayload
) => {
  const response = await apiFetch(path, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const data = await response.json() as ApiEnvelope<null>

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'No fue posible eliminar el registro.')
  }
}

export const deleteAdminIngreso = async (
  idAprendiz: number,
  payload: DeletePayload
) => deleteAdminRecord(`/api/admin/ingresos/${idAprendiz}`, payload)

export const deleteAdminSalida = async (
  idAprendiz: number,
  payload: DeletePayload
) => deleteAdminRecord(`/api/admin/salidas/${idAprendiz}`, payload)
