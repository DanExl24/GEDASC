import type { Request, Response } from 'express'
import { AdminService } from '../services/admin.service'
import { CTAResponse } from '../types/contract.type'
import { pool } from '../config/db'
import { filtersMap } from '../utils/filtersMap'
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

/**
 * @swagger
 * /api/admin/aprendices:
 *   get:
 *     summary: Obtener todos los aprendices (Vista Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de aprendices
 */
export const getAllAprendicesController = async (req: Request, res: Response) => {
  const data = await service.getAllAprendices()
  res.json(ok(data))
}

/* =========================
   INGRESOS / SALIDAS
========================= */

/**
 * @swagger
 * /api/admin/ingresos:
 *   get:
 *     summary: Obtener historial de ingresos y salidas con filtros
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Nombre o documento del aprendiz
 *     responses:
 *       200:
 *         description: Lista de registros filtrados
 */
export const getIngressEgressController = async (req: Request, res: Response) => {
  const data = await service.getIngressEgress(req.query)
  res.json(ok(data, { count: data.length }))
}

import { deleteRecordSchema } from '../schemas/admin.schema'

/**
 * @swagger
 * /api/admin/ingresos/{id}:
 *   delete:
 *     summary: Eliminar un registro de ingreso y salida
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               verification:
 *                 type: string
 *               date:
 *                 type: string
 *               observation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Eliminación exitosa
 */
export const deleteIngresoController = async (req: Request, res: Response) => {
  try {
    const dataToValidate = {
      id: req.params.id,
      verification: req.body?.verification,
      date: req.body?.date,
      observation: req.body?.observation
    }

    const validation = deleteRecordSchema.safeParse(dataToValidate)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Datos de validación incompletos o incorrectos',
        errors: validation.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      })
    }

    const { id, verification, date, observation } = validation.data

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

/**
 * @swagger
 * /api/admin/salidas/{id}:
 *   delete:
 *     summary: Eliminar solo el registro de salida
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               verification:
 *                 type: string
 *               date:
 *                 type: string
 *               observation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Eliminación de salida exitosa
 */
export const deleteSalidaController = async (req: Request, res: Response) => {
  try {
    const dataToValidate = {
      id: req.params.id,
      verification: req.body?.verification,
      date: req.body?.date,
      observation: req.body?.observation
    }

    const validation = deleteRecordSchema.safeParse(dataToValidate)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Datos de validación incompletos o incorrectos',
        errors: validation.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      })
    }

    const { id, verification, date, observation } = validation.data

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


/**
 * @swagger
 * /api/admin/computers:
 *   get:
 *     summary: Obtener todas las máquinas registradas (Computadores)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de computadores
 */
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

/**
 * @swagger
 * /api/admin/vehicles:
 *   get:
 *     summary: Obtener todas las máquinas registradas (Vehículos)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de vehículos
 */
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

/**
 * @swagger
 * /api/admin/borrowed/computers:
 *   get:
 *     summary: Obtener computadores prestados
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de préstamos de computadores
 */
export const getBorrowedComputersController = async (req: Request, res: Response) => {
  const dates = typeof req.query.dates === 'string'
    ? (req.query.dates.split(',') as DateFilter[])
    : undefined

  const data = await service.getBorrowedComputers({
    dates
  })
  res.json(ok(data))
}

/**
 * @swagger
 * /api/admin/borrowed/vehicles:
 *   get:
 *     summary: Obtener vehículos prestados
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de préstamos de vehículos
 */
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

/**
 * @swagger
 * /api/admin/statsQuarter:
 *   get:
 *     summary: Obtener estadísticas trimestrales de asistencia
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos estadísticos por trimestre
 */
export const getStatsTrimestral= async (req: Request, res: Response) => {
const data = await service.getAprendicesTrimestrales()
res.json(ok(data))
}

/**
 * @swagger
 * /api/admin/statsYear:
 *   get:
 *     summary: Obtener estadísticas anuales de asistencia
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos estadísticos por año
 */
export const getStatsAnual= async (req: Request, res: Response) => {
const data = await service.getAprendicesAnuales()
res.json(ok(data))
}

/* =========================
   TRACK / TIEMPO REAL
========================= */

/**
 * @swagger
 * /api/admin/track:
 *   get:
 *     summary: Seguimiento de aprendices en tiempo real
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de estados de asistencia
 */
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

/**
 * @swagger
 * /api/admin/statsExits:
 *   get:
 *     summary: Obtener estadísticas de salidas inconsistentes
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de alertas de salida
 */
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

/**
 * @swagger
 * /api/admin/allMachines/{id}:
 *   get:
 *     summary: Consultar todas las máquinas de un aprendiz en tiempo real
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos de las máquinas vinculadas y su estado
 */
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
