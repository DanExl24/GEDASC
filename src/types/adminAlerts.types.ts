export type AdminAlertType = 'BORROWED_MACHINE' | 'INACTIVITY'
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

export type AdminAlertItem = BorrowedMachineAlertItem | InactivityAlertItem
