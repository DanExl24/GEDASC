import type { MachineDetailApiResponse } from '@/types/machineDetails.types'

export interface FormacionItem {
  id_formacion: number
  nombre_programa: string
}

export interface HistorialAprendiz {
  id_ingreso: number
  id_aprendiz: number
  nombre: string
  apellido: string
  documento: string
  es_monitor?: boolean
  total_formaciones?: number
  todas_formaciones?: FormacionItem[]
  formacion: string
  nombre_programa?: string
  id_formacion?: number
  motivo_visita?: string
  hora_ingreso: string | null
  hora_salida: string | null
  id_detallemaquina: number | null
}

export interface HistoryFilters {
  Date: string
  Program?: string
  Ficha?: string
}

export type HistoryMachineDetailResponse = MachineDetailApiResponse
