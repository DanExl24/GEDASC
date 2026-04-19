export type checkMachineResult =
  | { status: 'ok', idMaquina: number | null}
  | { status: 'diferenteAprendiz', tipoEquipo: 'vehiculo' | 'computador' }
  | { status: 'maquinaYaPrestadaHoy' }
  | { status: 'maquinaSinDueño', data: { placa?: string, serial? : string, modelo: string, tipo?: string } }
  | { status: 'maquinaPrincipalExistente', tipoEquipo: 'vehiculo' | 'computador' }
