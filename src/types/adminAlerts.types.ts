export type AdminAlertType = 'BORROWED_MACHINE' | 'INACTIVITY' | 'EXIT'
export type AdminAlertLevel = 'info' | 'warning'
export type BorrowedAssetType = 'COMPUTER' | 'VEHICLE'

export interface AdminAlertDetail {
  label: string
  value: string
}

interface AdminAlertBase {
  id: string
  type: AdminAlertType
  title: string
  summary: string
  level: AdminAlertLevel
  timestampLabel: string
  subjectName: string
  subjectDocument: string
  details: AdminAlertDetail[]
}

export interface BorrowedMachineAlertItem extends AdminAlertBase {
  type: 'BORROWED_MACHINE'
  assetType: BorrowedAssetType
}

export interface InactivityAlertItem extends AdminAlertBase {
  type: 'INACTIVITY'
  inactiveDays: number | null
  lastVisitLabel: string
}

export interface InconsistentExit extends AdminAlertBase {
  type: 'EXIT',
    aprendiz : {
      id : number | null,
      documento : string,
      nombreCompleto : string,
      formacion : string,
      salida: 'EXITOSA' | 'NO_EXISTE'
    }
}

export type AdminAlertItem = BorrowedMachineAlertItem | InactivityAlertItem | InconsistentExit
