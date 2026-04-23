import type { Request, Response } from 'express'
import { AdminService } from '../composables/useAdminService'
import { CTAResponse } from '../shared/contract.type'
import { pool } from '../config/db'
import { filtersMap } from '../shared/filtersMap'
const service = AdminService()
type DateFilter = keyof typeof filtersMap.date
const ok = <T>(data: T, meta?: CTAResponse<T>["meta"]): CTAResponse<T> => ({
  success: true,
  data,
  meta
})



/* =========================
   APRRENDICES
========================= */

export const getAllAprendicesController = async (req: Request, res: Response) => {
  const data = await service.getAllAprendices()
  res.json(ok(data))
}

/* =========================
   INGRESOS / SALIDAS
========================= */

export const getIngressEgressController = async (req: Request, res: Response) => {
  const data = await service.getIngressEgress(req.query)
  res.json(ok(data, { count: data.length }))
}

export const deleteIngresoController = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id

    const verification = typeof req.body?.verification === 'string'
      ? req.body.verification.trim()
      : ''

    const date = typeof req.body?.date === 'string'
      ? req.body.date
      : ''

    const observation = typeof req.body?.observation === 'string'
      ? req.body.observation.trim()
      : ''

    if (!verification || !date || !observation) {
      return res.status(400).json({ success: false, message: 'Debes confirmar el aprendiz, la fecha y el motivo de eliminacion.' })
    }

    const record = await service.getIngressEgressRecordForDelete(id, date)

    if (!record) {
      return res.status(404).json({ success: false, message: 'No existe un ingreso para ese aprendiz en la fecha indicada.' })
    }

    const normalizedVerification = verification.toLowerCase()
    const fullName = `${record.nombre} ${record.apellido}`.trim().toLowerCase()
    const document = String(record.documento).trim().toLowerCase()

    if (normalizedVerification !== fullName && normalizedVerification !== document) {
      return res.status(400).json({ success: false, message: 'La verificacion no coincide con el aprendiz seleccionado.' })
    }

    await service.deleteSalida(id, date)
    await service.deleteIngreso(id, date)

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'No fue posible eliminar el ingreso.' })
  }
}

export const deleteSalidaController = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id

    const verification = typeof req.body?.verification === 'string'
      ? req.body.verification.trim()
      : ''

    const date = typeof req.body?.date === 'string'
      ? req.body.date
      : ''

    const observation = typeof req.body?.observation === 'string'
      ? req.body.observation.trim()
      : ''

    if (!verification || !date || !observation) {
      return res.status(400).json({ success: false, message: 'Debes confirmar el aprendiz, la fecha y el motivo de eliminacion.' })
    }

    const record = await service.getIngressEgressRecordForDelete(id, date)

    if (!record) {
      return res.status(404).json({ success: false, message: 'No existe un ingreso para ese aprendiz en la fecha indicada.' })
    }

    if (!record.hora_salida) {
      return res.status(400).json({ success: false, message: 'Ese registro aun no tiene salida para eliminar.' })
    }

    const normalizedVerification = verification.toLowerCase()
    const fullName = `${record.nombre} ${record.apellido}`.trim().toLowerCase()
    const document = String(record.documento).trim().toLowerCase()

    if (normalizedVerification !== fullName && normalizedVerification !== document) {
      return res.status(400).json({ success: false, message: 'La verificacion no coincide con el aprendiz seleccionado.' })
    }

    await service.deleteSalida(id, date)

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'No fue posible eliminar la salida.' })
  }
}

/* =========================
   COMPUTADORES
========================= */


export const getAllComputersController = async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id

  const data = await service.getAllComputers({
    search: id
  })

  res.json(ok(data, { count: data.length }))
}

/* =========================
   VEHICULOS
========================= */

export const getAllVehiclesController = async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id
  const data = await service.getAllVehicles({
    search: id
  })
  res.json(ok(data))
}


/* =========================
   PRÉSTAMOS
========================= */

export const getBorrowedComputersController = async (req: Request, res: Response) => {
  const dates = typeof req.query.dates === 'string'
    ? (req.query.dates.split(',') as DateFilter[])
    : undefined

  const data = await service.getBorrowedComputers({
    dates
  })
  res.json(ok(data))
}

export const getBorrowedVehiclesController = async (req: Request, res: Response) => {
  const dates = typeof req.query.dates === 'string'
    ? (req.query.dates.split(',') as DateFilter[])
    : undefined

  const data = await service.getBorrowedVehicles({
    dates
  })
  res.json(ok(data))
}



/* =========================
   STATS
========================= */

export const getStatsTrimestral= async (req: Request, res: Response) => {
const data = await service.getAprendicesTrimestrales()
res.json(ok(data))
}

export const getStatsAnual= async (req: Request, res: Response) => {
const data = await service.getAprendicesAnuales()
res.json(ok(data))
}

/* =========================
   TRACK / TIEMPO REAL
========================= */

export const getTrackController = async (req: Request, res: Response) => {
  const search = typeof req.query.search === 'string'
    ? req.query.search
    : undefined

  const dates =
    typeof req.query.dates === 'string'
      ? (req.query.dates.split(',') as DateFilter[])
      : undefined

  const data = await service.getAprendicesTrack({
    search,
    dates
  })

  res.json(ok(data))
}

export const getAdminStatsController = async (req: Request, res: Response) => {
  const resultInconsistentExits = await service.InconsistentExit()
  console.log(resultInconsistentExits)
  return res.status(200).json({
    success: true,
    data: resultInconsistentExits
  })
}

/* =========================
   TODO: MÁQUINAS EN TIEMPO REAL
========================= */

export const getAllMachinesByAprendizController = async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id
  const client = await pool.connect()
  try {
    const data = await service.getAllMachinesByAprendiz(client, id)
    res.json(ok(data, { count: data.length, source: 'machines-tracking' }))
  } finally {
    client.release()
  }
}
