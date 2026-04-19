export type MachineResponse = {
  message?: string
  tipoEquipo?: "vehiculo" | "computador"
  aviso?: "diferenteAprendiz" | "maquinaSinDueño" | "maquinaPrincipalExistente" | "maquinaYaPrestadaHoy"
  excepcion?: boolean
  placa?: string
  serial?: string
  marca?: string
  tipo_vehiculo?: string,
  inconsistencia : true
}

export type handleMachineType =
  | 'ok'
  | 'registrarOtraMaquina'
  | 'error'


export type SubmitMachineResult =
  | { status: 'ok' }
  | { status: 'registrarOtraMaquina'}
  | { status: 'error' }
  | { status: 'inconsistencia', data: MachineResponse }


