export type OwnerInfo = {
  id: string | null
  name: string | null
}


export type BorrowPc = {
  id_aprendiz: string

  owner: OwnerInfo

  principal: {
    id: string
    serial: string
    marca: string
  } | null

  prestado: {
    id: string
    serial: string
    marca: string
  } | null

  firma_ingreso: string | null
}

export type BorrowPcViewRow = {
  id_aprendiz: string

  owner_id: string
  owner_nombre: string

  principal_id: string
  principal_serial: string
  principal_marca: string

  prestado_id: string
  prestado_serial: string
  prestado_marca: string

  firma_ingreso: string | null

  tipo: 'PC'
}

export type BorrowVehicle = {
  id_aprendiz: string

  owner: OwnerInfo

  principal: {
    id: string
    placa: string
    tipo: string
    modelo: string
  } | null

  prestado: {
    id: string
    placa: string
    tipo: string
    modelo: string
  } | null

  firma_ingreso: string | null
}

export type BorrowVehicleViewRow = {
  id_aprendiz: string

  owner_id: string
  owner_nombre: string

  principal_id: string
  principal_placa: string
  principal_tipo: string
  principal_marca: string

  prestado_id: string
  prestado_placa: string
  prestado_tipo: string
  prestado_marca: string

  firma_ingreso: string | null

  tipo: 'VEHICLE'
}

export type BorrowRow =
  | { type: 'pc'; data: BorrowPc }
  | { type: 'vehicle'; data: BorrowVehicle }












export type RawBorrowRow = {
  id_aprendiz: string

  ownerId: string
  ownerName: string

  firma_ingreso: string | null

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
