export type TodayBorrowRow = {
  id_aprendiz: string

  id_computador: string | null
  prestadoSerial: string | null
  prestadoMarca: string | null

  pc_principal: string | null
  principalSerial: string | null
  principalMarca: string | null

  id_vehiculo: string | null
  prestadoPlaca: string | null
  prestadoTipo: string | null
  prestadoModelo: string | null

  vehiculo_principal: string | null
  principalPlaca: string | null
  principalTipo: string | null
  principalModelo: string | null
}
