import { PoolClient } from 'pg'
import { getHistory } from '../query/history.query'
import { CTAResponse } from '../shared/contract.type'
import { HistoryFilters } from '../query/history.query'

export type HistoryDTO = {
  id_aprendiz: number
  nombre: string
  apellido: string
  documento: string
  formacion: string
  hora_ingreso: string
  hora_salida: string | null
  id_ingreso: number
  id_detallemaquina: number
}

export const useHistory = async (client: PoolClient,filters: HistoryFilters): Promise<CTAResponse<HistoryDTO[]>> => {
  const data = await getHistory(client, filters)

  return {
    success: true,
    data,
    meta: {
      count: data.length,
      source: 'history'
    }
  }
}
