export type ComputerDTO = {
  serial: string
  marca: string
  principal?: boolean
}

export type VehicleDTO = {
  placa: string
  modelo: string
  tipo_vehiculo: string
  principal?: boolean
}

export type MachinesDTO = {
  computers: ComputerDTO[]
  vehicles: VehicleDTO[]
}
