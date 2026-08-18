import { fetchWithAuth } from '@/Services/httpClient'

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
  version: string
  id_horario: number
  hora_inicio: string
  hora_fin: string
  jornada: string
  dias_semana: string
  total_aprendices?: number
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

export const deletePrograma = (
  token: string,
  id_programa: number
): Promise<{ success: boolean; message: string }> => {
  return fetchWithAuth<{ success: boolean; message: string }>(
    `/api/admin/programas/${id_programa}`,
    token,
    'DELETE'
  )
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

export const updateHorario = (
  token: string,
  id_horario: number,
  data: { hora_inicio: string; hora_fin: string; jornada?: string; dias_semana: string[] }
): Promise<Horario> => {
  return fetchWithAuth<Horario>(`/api/admin/horarios/${id_horario}`, token, 'PUT', data)
}

export const deleteHorario = (
  token: string,
  id_horario: number
): Promise<{ success: boolean; message: string }> => {
  return fetchWithAuth<{ success: boolean; message: string }>(
    `/api/admin/horarios/${id_horario}`,
    token,
    'DELETE'
  )
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

export const desvincularTodosAprendicesFormacion = (
  token: string,
  id_formacion: number
): Promise<{ success: boolean; message: string; desvinculados: number }> => {
  return fetchWithAuth<{ success: boolean; message: string; desvinculados: number }>(
    `/api/admin/formaciones/${id_formacion}/aprendices/todos`,
    token,
    'DELETE'
  )
}
