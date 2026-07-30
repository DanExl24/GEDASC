import { API_URL } from '@/config/network'
import { normalizeVehicleType } from '@/utils/vehicleType'

type ApiEnvelope<T> = {
  success: boolean
  data?: T
  message?: string
}

type BorrowOwner = {
  id: string | null
  name: string | null
  document: string | null
}

type BorrowComputerPayload = {
  borrower: BorrowOwner
  owner: BorrowOwner
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
  firma_salida: string | null
  hora_ingreso: string | null
}

type BorrowVehiclePayload = {
  borrower: BorrowOwner
  owner: BorrowOwner
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
  firma_salida: string | null
  hora_ingreso: string | null
}

type BorrowComputerApiRow = {
  type: 'pc'
  data: BorrowComputerPayload
}

type BorrowVehicleApiRow = {
  type: 'vehicle'
  data: BorrowVehiclePayload
}

export interface BorrowedComputerRow {
  borrowerId: string
  borrowerName: string
  borrowerDocument: string
  ownerId: string | null
  ownerName: string
  ownerDocument: string
  serial: string
  marca: string
  firmaIngreso: string | null
  firmaSalida: string | null
  horaIngreso: string | null
}

export interface BorrowedVehicleRow {
  borrowerId: string
  borrowerName: string
  borrowerDocument: string
  ownerId: string | null
  ownerName: string
  ownerDocument: string
  placa: string
  tipo: string
  modelo: string
  firmaIngreso: string | null
  firmaSalida: string | null
  horaIngreso: string | null
}

const buildHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`
})

const buildBorrowedUrl = (path: string, dates?: string) => {
  const url = new URL(`${API_URL}${path}`)

  if (dates) {
    url.searchParams.set('dates', dates)
  }

  return url.toString()
}

const ensureSuccess = async <T>(response: Response): Promise<T> => {
  const payload = await response.json() as ApiEnvelope<T>

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new Error(payload.message || 'No fue posible cargar la informacion de prestamos.')
  }

  return payload.data
}

export const getAdminBorrowedAssets = async (token: string, dates?: string) => {
  const [computersData, vehiclesData] = await Promise.all([
    fetch(buildBorrowedUrl('/api/admin/borrowed/computers', dates), {
      headers: buildHeaders(token)
    }).then((response) => ensureSuccess<BorrowComputerApiRow[]>(response)),
    fetch(buildBorrowedUrl('/api/admin/borrowed/vehicles', dates), {
      headers: buildHeaders(token)
    }).then((response) => ensureSuccess<BorrowVehicleApiRow[]>(response))
  ])

  console.log('Admin borrowed assets raw response', {
    computersData,
    vehiclesData
  })

  const computers: BorrowedComputerRow[] = computersData.map(({ data }) => {
    return {
      borrowerId: data.borrower.id || '-',
      borrowerName: data.borrower.name || `Aprendiz ${data.borrower.id ?? '-'}`,
      borrowerDocument: data.borrower.document || '-',
      ownerId: data.owner.id,
      ownerName: data.owner.name || 'Sin propietario',
      ownerDocument: data.owner.document || '-',
      serial: data.prestado?.serial || data.principal?.serial || '-',
      marca: data.prestado?.marca || data.principal?.marca || '-',
      firmaIngreso: data.firma_ingreso,
      firmaSalida: data.firma_salida,
      horaIngreso: data.hora_ingreso
    }
  })

  const vehicles: BorrowedVehicleRow[] = vehiclesData.map(({ data }) => {
    return {
      borrowerId: data.borrower.id || '-',
      borrowerName: data.borrower.name || `Aprendiz ${data.borrower.id ?? '-'}`,
      borrowerDocument: data.borrower.document || '-',
      ownerId: data.owner.id,
      ownerName: data.owner.name || 'Sin propietario',
      ownerDocument: data.owner.document || '-',
      placa: data.prestado?.placa || data.principal?.placa || '-',
      tipo: normalizeVehicleType(data.prestado?.tipo || data.principal?.tipo || '-'),
      modelo: data.prestado?.modelo || data.principal?.modelo || '-',
      firmaIngreso: data.firma_ingreso,
      firmaSalida: data.firma_salida,
      horaIngreso: data.hora_ingreso
    }
  })

  return {
    computers,
    vehicles
  }
}
