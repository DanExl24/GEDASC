import { API_URL } from '@/config/network'

export interface Programa {
  id_programa: number
  nombre_programa: string
  version: string
  nivel: string
  estado: string
}

export interface Horario {
  id_horario: number
  hora_inicio: string
  hora_fin: string
  jornada: string
  dias_semana: string
}

export interface FormacionCompleta {
  id_formacion: number
  nombre: string
  nivel: string
  estado: string
  fecha_inicio: string
  fecha_fin: string
  id_programa: number
  nombre_programa: string
  id_horario: number
  hora_inicio: string
  hora_fin: string
  jornada: string
  dias_semana: string
}

type ApiEnvelope<T> = {
  success: boolean
  data?: T
  message?: string
}

const fetchWithAuth = async <T>(
  path: string, 
  token: string, 
  method = 'GET', 
  body?: unknown
): Promise<T> => {
  const options: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_URL}${path}`, options)
  const payload = await response.json() as ApiEnvelope<T>

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || 'Error en la petición al servidor')
  }

  return payload.data as T
}

export const getProgramas = (token: string): Promise<Programa[]> => {
  return fetchWithAuth<Programa[]>('/api/admin/programas', token)
}

export const createPrograma = (token: string, data: Omit<Programa, 'id_programa'>): Promise<Programa> => {
  return fetchWithAuth<Programa>('/api/admin/programas', token, 'POST', data)
}

export const updatePrograma = (
  token: string,
  id_programa: number,
  data: Omit<Programa, 'id_programa'>
): Promise<Programa> => {
  return fetchWithAuth<Programa>(`/api/admin/programas/${id_programa}`, token, 'PUT', data)
}

export const getHorarios = (token: string): Promise<Horario[]> => {
  return fetchWithAuth<Horario[]>('/api/admin/horarios', token)
}

export const createHorario = (
  token: string, 
  data: { hora_inicio: string; hora_fin: string; jornada?: string; dias_semana: string[] }
): Promise<Horario> => {
  return fetchWithAuth<Horario>('/api/admin/horarios', token, 'POST', data)
}

export const getAllFormaciones = (token: string): Promise<FormacionCompleta[]> => {
  return fetchWithAuth<FormacionCompleta[]>('/api/admin/formaciones', token)
}

export const createFormacion = (token: string, data: Partial<FormacionCompleta>): Promise<FormacionCompleta> => {
  return fetchWithAuth<FormacionCompleta>('/api/admin/formaciones', token, 'POST', data)
}

export const updateFormacion = (
  token: string, 
  id_formacion: number, 
  data: Partial<FormacionCompleta>
): Promise<FormacionCompleta> => {
  return fetchWithAuth<FormacionCompleta>(`/api/admin/formaciones/${id_formacion}`, token, 'PUT', data)
}

export const deleteFormacion = (token: string, id_formacion: number): Promise<{ success: boolean; message: string }> => {
  return fetchWithAuth<{ success: boolean; message: string }>(`/api/admin/formaciones/${id_formacion}`, token, 'DELETE')
}

export interface AprendicesVinculacion {
  vinculados: { id_aprendiz: number; documento: string; nombre: string; apellido: string; estado: string; fecha_inicio: string }[];
  noVinculados: { id_aprendiz: number; documento: string; nombre: string; apellido: string }[];
}

export const getFormacionAprendices = (token: string, id_formacion: number): Promise<AprendicesVinculacion> => {
  return fetchWithAuth<AprendicesVinculacion>(`/api/admin/formaciones/${id_formacion}/aprendices`, token)
}
