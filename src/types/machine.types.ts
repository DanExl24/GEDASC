export type MachineResponse = {
  message?: string
  tipoEquipo?: "vehiculo" | "computador"
  aviso?: "diferenteAprendiz" | "maquinaSinDueño" | "maquinaPrincipalExistente"
  excepcion?: boolean
  placa?: string
  serial?: string
  marca?: string
  tipo_vehiculo?: string,
}
