export type AssetView = 'computers' | 'vehicles'

export interface AssetOwnerDetail {
  id_propietario: number
  nombre: string
  apellido: string
  formacion: string
  hora_ingreso: string | null
  firma: string | null
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
