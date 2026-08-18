export type AssetView = 'computers' | 'vehicles'

export interface AssetOwnerDetail {
  id_propietario: number
  nombre: string
  apellido: string
  formacion: string
  hora_ingreso: string | null
  hora_salida?: string | null
  firma: string | null
  firma_ingreso?: string | null
  firma_salida?: string | null
  estado_equipo?: string | null
  hora_retiro_equipo?: string | null
  id_formacion: number | null
  horario_inicio: string | null
  horario_fin: string | null
  horario_jornada: string | null
}

export interface AssetHistoryBaseRow {
  id_detallemaquina: number
  marca: string
  documento: string
  hora_ingreso: string | null
  hora_salida: string | null
}

export interface ComputerHistoryRow extends AssetHistoryBaseRow {
  serial: string
  id_aprendiz: number
}

export interface VehicleHistoryRow extends AssetHistoryBaseRow {
  tipo_vehiculo: string
  placa: string
  id_aprendiz: number
}

export interface AssetHistoryFilters {
  Date: string
  filterType: string
  searchValue: string
  vehicleType: string
}

export interface AssetSummaryCard {
  label: string
  eyebrow: string
  value: number
  description: string
  badge: string
  cardClass: string
  eyebrowClass: string
  badgeClass: string
  titleClass: string
  valueClass: string
  descriptionClass: string
}
