import type { MachineDetailApiResponse } from '@/types/machineDetails.types'

export interface HistorialAprendiz {
  id_ingreso: number
  id_aprendiz: number
  nombre: string
  apellido: string
  documento: string
  formacion: string
  hora_ingreso: string | null
  hora_salida: string | null
  id_detallemaquina: number | null
}

export interface HistoryFilters {
  Date: string
  Program: string
}

export type HistoryMachineDetailResponse = MachineDetailApiResponse
