import { API_URL } from '@/config/network'
import { normalizeVehicleType } from '@/utils/vehicleType'
import type {
  AssetHistoryFilters,
  AssetOwnerDetail,
  ComputerHistoryRow,
  VehicleHistoryRow,
} from '@/types/assetsHistory.types'

const API = API_URL

const buildQuery = ({ Date, filterType, searchValue }: AssetHistoryFilters) => {
  const params = new URLSearchParams()

  if (Date) {
    params.append('date', Date)
  }

  if (filterType && searchValue.trim()) {
    params.append('type', filterType)
    params.append('value', searchValue.trim())
  }

  const query = params.toString()

  return query ? `?${query}` : ''
}

export const fetchComputerHistory = async (
  filters: AssetHistoryFilters,
): Promise<ComputerHistoryRow[]> => {
  const response = await fetch(
    `${API}/api/HistorialComputadores/historial${buildQuery(filters)}`,
  )

  if (!response.ok) {
    throw new Error('No fue posible cargar el historial de computadores.')
  }

  return response.json() as Promise<ComputerHistoryRow[]>
}

export const fetchVehicleHistory = async (
  filters: AssetHistoryFilters,
): Promise<VehicleHistoryRow[]> => {
  const response = await fetch(
    `${API}/api/HistorialVehiculos/historial${buildQuery(filters)}`,
  )

  if (!response.ok) {
    throw new Error('No fue posible cargar el historial de vehiculos.')
  }

  const data = (await response.json()) as VehicleHistoryRow[]

  return data.map((vehicle) => ({
    ...vehicle,
    tipo_vehiculo: normalizeVehicleType(vehicle.tipo_vehiculo),
  }))
}

export const fetchAssetOwnerDetail = async (
  view: 'computers' | 'vehicles',
  idDetalleMaquina: number,
): Promise<AssetOwnerDetail> => {
  const basePath =
    view === 'computers' ? 'HistorialComputadores' : 'HistorialVehiculos'

  const response = await fetch(
    `${API}/api/${basePath}/propietario/${idDetalleMaquina}`,
  )

  if (!response.ok) {
    throw new Error('No fue posible cargar el detalle del propietario.')
  }

  const data = (await response.json()) as { result: AssetOwnerDetail }

  return data.result
}
