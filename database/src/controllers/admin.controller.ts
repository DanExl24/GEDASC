import type { Request, Response } from 'express'
import { AdminService } from '../services/admin.service'
import { CTAResponse } from '../types/contract.type'
import { pool } from '../config/db'
import { filtersMap } from '../utils/filtersMap'
import { setSimulatedTime, getSimulatedTimeState } from '../utils/timeSimulation'
import bcrypt from 'bcryptjs'

const service = AdminService()
type DateFilter = keyof typeof filtersMap.date
const ok = <T>(data: T, meta?: CTAResponse<T>["meta"]): CTAResponse<T> => ({
  success: true,
  data,
  meta
})

/* =========================
   SIMULACIÓN DE TIEMPO (PRUEBAS ADMIN)
========================= */
export const setSimulationTimeController = async (req: Request, res: Response) => {
  const { time } = req.body // time puede ser "08:30", "14:00", "21:00" o null/empty para reset
  const result = setSimulatedTime(time || null)
  return res.json({ success: true, ...result, ...getSimulatedTimeState() })
}

export const getSimulationTimeController = async (_req: Request, res: Response) => {
  return res.json({ success: true, ...getSimulatedTimeState() })
}


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

    const { id, verification, date } = validation.data

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

    const { id, verification, date } = validation.data

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

export const createAprendizController = async (req: Request, res: Response) => {
  const client = await pool.connect()
  try {
    const { documento, nombre, apellido, es_monitor, id_formacion } = req.body

    const existing = await client.query('SELECT id_aprendiz FROM aprendiz WHERE documento = $1', [documento])
    if (existing.rowCount && existing.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: `El documento ${documento} ya se encuentra registrado en el sistema`
      })
    }

    await client.query('BEGIN')

    const { rows } = await client.query(
      `INSERT INTO aprendiz (documento, nombre, apellido, es_monitor, estado, fecha_registro)
       VALUES ($1, $2, $3, $4, true, NOW())
       RETURNING id_aprendiz, documento, nombre, apellido, es_monitor, estado, fecha_registro`,
      [documento, nombre, apellido, Boolean(es_monitor)]
    )

    const nuevoAprendiz = rows[0]

    if (id_formacion) {
      const formacionCheck = await client.query('SELECT id_formacion FROM formaciones WHERE id_formacion = $1', [id_formacion])
      if (formacionCheck.rowCount && formacionCheck.rowCount > 0) {
        await client.query(
          `INSERT INTO aprendiz_formacion (id_aprendiz, id_formacion, estado, fecha_inicio)
           VALUES ($1, $2, 'activo', CURRENT_DATE)`,
          [nuevoAprendiz.id_aprendiz, id_formacion]
        )
      }
    }

    await client.query('COMMIT')

    return res.status(201).json({
      success: true,
      message: 'Aprendiz registrado exitosamente',
      data: nuevoAprendiz
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error en createAprendizController:', error)
    return res.status(500).json({
      success: false,
      message: 'Error interno al registrar el aprendiz'
    })
  } finally {
    client.release()
  }
}

export const bulkCreateAprendicesController = async (req: Request, res: Response) => {
  const client = await pool.connect()
  try {
    const { aprendices } = req.body

    if (!Array.isArray(aprendices) || aprendices.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe enviar una lista de aprendices válida'
      })
    }

    const detalles: Array<{
      documento: string
      nombre?: string
      apellido?: string
      estado: 'creado' | 'ya_registrado' | 'error'
      motivo?: string
    }> = []

    let creados = 0
    let yaRegistrados = 0
    let errores = 0

    for (const item of aprendices) {
      const doc = String(item.documento || '').trim()
      const nom = String(item.nombre || '').trim()
      const ape = String(item.apellido || '').trim()
      const esMon = Boolean(item.es_monitor)

      if (!doc || !nom || !ape) {
        errores++
        detalles.push({
          documento: doc || 'DESCONOCIDO',
          nombre: nom,
          apellido: ape,
          estado: 'error',
          motivo: 'Faltan campos obligatorios (documento, nombre o apellido)'
        })
        continue
      }

      try {
        const check = await client.query('SELECT id_aprendiz FROM aprendiz WHERE documento = $1', [doc])
        if (check.rowCount && check.rowCount > 0) {
          yaRegistrados++
          detalles.push({
            documento: doc,
            nombre: nom,
            apellido: ape,
            estado: 'ya_registrado',
            motivo: 'El aprendiz ya existe en el sistema'
          })
          continue
        }

        await client.query(
          `INSERT INTO aprendiz (documento, nombre, apellido, es_monitor, estado, fecha_registro)
           VALUES ($1, $2, $3, $4, true, NOW())`,
          [doc, nom, ape, esMon]
        )

        creados++
        detalles.push({
          documento: doc,
          nombre: nom,
          apellido: ape,
          estado: 'creado',
          motivo: 'Registrado satisfactoriamente'
        })
      } catch (err: unknown) {
        errores++
        const errMsg = err instanceof Error ? err.message : 'Error al insertar en la base de datos'
        detalles.push({
          documento: doc,
          nombre: nom,
          apellido: ape,
          estado: 'error',
          motivo: errMsg
        })
      }
    }

    return res.status(200).json({
      success: true,
      message: `Proceso masivo finalizado: ${creados} creados, ${yaRegistrados} ya registrados, ${errores} con error`,
      data: {
        summary: {
          total: aprendices.length,
          creados,
          yaRegistrados,
          errores
        },
        detalles
      }
    })
  } catch (error) {
    console.error('Error en bulkCreateAprendicesController:', error)
    return res.status(500).json({
      success: false,
      message: 'Error interno al procesar importación masiva de aprendices'
    })
  } finally {
    client.release()
  }
}

export const updateAprendizController = async (req: Request, res: Response) => {
  try {
    const { id_aprendiz } = req.params
    const { documento, nombre, apellido, es_monitor, estado } = req.body

    const check = await pool.query('SELECT id_aprendiz, documento FROM aprendiz WHERE id_aprendiz = $1', [id_aprendiz])
    if (check.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aprendiz no encontrado'
      })
    }

    if (documento && documento !== check.rows[0].documento) {
      const docCheck = await pool.query('SELECT id_aprendiz FROM aprendiz WHERE documento = $1 AND id_aprendiz != $2', [documento, id_aprendiz])
      if (docCheck.rowCount && docCheck.rowCount > 0) {
        return res.status(409).json({
          success: false,
          message: `El documento ${documento} ya pertenece a otro aprendiz`
        })
      }
    }

    const { rows } = await pool.query(
      `UPDATE aprendiz
       SET documento = COALESCE($1, documento),
           nombre = COALESCE($2, nombre),
           apellido = COALESCE($3, apellido),
           es_monitor = COALESCE($4, es_monitor),
           estado = COALESCE($5, estado)
       WHERE id_aprendiz = $6
       RETURNING id_aprendiz, documento, nombre, apellido, es_monitor, estado`,
      [documento, nombre, apellido, es_monitor, estado, id_aprendiz]
    )

    return res.json({
      success: true,
      message: 'Aprendiz actualizado con éxito',
      data: rows[0]
    })
  } catch (error) {
    console.error('Error en updateAprendizController:', error)
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar el aprendiz'
    })
  }
}

export const toggleAprendizStatusController = async (req: Request, res: Response) => {
  try {
    const { id_aprendiz } = req.params

    const { rows } = await pool.query(
      `UPDATE aprendiz
       SET estado = NOT COALESCE(estado, true)
       WHERE id_aprendiz = $1
       RETURNING id_aprendiz, estado, nombre, apellido`,
      [id_aprendiz]
    )

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aprendiz no encontrado'
      })
    }

    const nuevoEstado = rows[0].estado ? 'activo' : 'inactivo'
    return res.json({
      success: true,
      message: `El aprendiz ahora está ${nuevoEstado}`,
      data: rows[0]
    })
  } catch (error) {
    console.error('Error en toggleAprendizStatusController:', error)
    return res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del aprendiz'
    })
  }
}

export const deleteAprendizController = async (req: Request, res: Response) => {
  const client = await pool.connect()
  try {
    const { id_aprendiz } = req.params

    const check = await client.query('SELECT id_aprendiz, nombre, apellido FROM aprendiz WHERE id_aprendiz = $1', [id_aprendiz])
    if (check.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aprendiz no encontrado'
      })
    }

    // Verificar si tiene historial en detalles_ingreso
    const historyCheck = await client.query('SELECT COUNT(*) AS total FROM detalles_ingreso WHERE id_aprendiz = $1', [id_aprendiz])
    const totalIngresos = parseInt(historyCheck.rows[0].total, 10)

    if (totalIngresos > 0) {
      // Tiene historial: Realizar soft-delete desactivando estado para no violar integridad histórica
      await client.query('UPDATE aprendiz SET estado = false WHERE id_aprendiz = $1', [id_aprendiz])
      return res.json({
        success: true,
        message: `El aprendiz tiene ${totalIngresos} registro(s) de acceso histórico(s) en el CTA. Se ha desactivado del sistema para preservar la integridad histórica.`,
        data: { id_aprendiz, action: 'deactivated' }
      })
    }

    await client.query('BEGIN')

    // Limpiar relaciones no transaccionales
    await client.query('DELETE FROM aprendiz_formacion WHERE id_aprendiz = $1', [id_aprendiz])
    await client.query('DELETE FROM aprendiz_computador WHERE id_aprendiz = $1', [id_aprendiz])
    await client.query('DELETE FROM aprendiz_vehiculo WHERE id_aprendiz = $1', [id_aprendiz])
    await client.query('DELETE FROM aprendiz WHERE id_aprendiz = $1', [id_aprendiz])

    await client.query('COMMIT')

    return res.json({
      success: true,
      message: 'Aprendiz eliminado exitosamente del sistema',
      data: { id_aprendiz, action: 'deleted' }
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error en deleteAprendizController:', error)
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar el aprendiz'
    })
  } finally {
    client.release()
  }
}

export const toggleMonitorController = async (req: Request, res: Response) => {
  try {
    const { id_aprendiz } = req.params
    const { es_monitor } = req.body

    if (id_aprendiz === undefined || es_monitor === undefined) {
      return res.status(400).json({ success: false, message: "id_aprendiz y es_monitor son obligatorios" })
    }

    await pool.query(
      'UPDATE aprendiz SET es_monitor = $1 WHERE id_aprendiz = $2',
      [es_monitor, id_aprendiz]
    )

    res.json({ success: true, message: `Estado de monitor actualizado a ${es_monitor}` })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Error al actualizar estado de monitor" })
  }
}

export const getFormacionesAprendizController = async (req: Request, res: Response) => {
  try {
    const { id_aprendiz } = req.params

    const { rows: formacionesAsignadas } = await pool.query(
      `SELECT f.id_formacion, p.nombre_programa AS nombre, p.nivel, af.estado, af.fecha_inicio
       FROM aprendiz_formacion af
       JOIN formaciones f ON f.id_formacion = af.id_formacion
       JOIN programa p ON p.id_programa = f.id_programa
       WHERE af.id_aprendiz = $1`,
      [id_aprendiz]
    )

    const { rows: todasFormaciones } = await pool.query(
      `SELECT f.id_formacion, p.nombre_programa AS nombre, p.nivel 
       FROM formaciones f
       JOIN programa p ON p.id_programa = f.id_programa`
    )

    res.json({
      success: true,
      data: {
        asignadas: formacionesAsignadas,
        todas: todasFormaciones
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Error al obtener formaciones del aprendiz" })
  }
}

export const asignarFormacionController = async (req: Request, res: Response) => {
  try {
    const { id_aprendiz } = req.params
    const { id_formacion } = req.body

    if (!id_aprendiz || !id_formacion) {
      return res.status(400).json({ success: false, message: "id_aprendiz e id_formacion son obligatorios" })
    }

    // RN-038: Verificar superposición de horarios antes de asignar
    // 1. Obtener el horario de la formación que se quiere asignar
    const targetSchedule = await pool.query(`
      SELECT h.hora_inicio, h.hora_fin, hd.dia_semana
      FROM formaciones f
      JOIN horario h ON h.id_horario = f.id_horario
      JOIN horario_dia hd ON hd.id_horario = h.id_horario
      WHERE f.id_formacion = $1 AND f.estado = 'activa'
    `, [id_formacion])

    if (targetSchedule.rowCount === 0) {
      return res.status(400).json({ success: false, message: "La formación no tiene un horario activo asignado" })
    }

    // 2. Obtener los horarios de todas las formaciones activas del aprendiz
    const existingSchedules = await pool.query(`
      SELECT f.id_formacion, p.nombre_programa, h.hora_inicio, h.hora_fin, hd.dia_semana
      FROM aprendiz_formacion af
      JOIN formaciones f ON f.id_formacion = af.id_formacion
      JOIN programa p ON p.id_programa = f.id_programa
      JOIN horario h ON h.id_horario = f.id_horario
      JOIN horario_dia hd ON hd.id_horario = h.id_horario
      WHERE af.id_aprendiz = $1 AND af.estado = 'activo' AND f.estado = 'activa'
        AND af.id_formacion != $2
    `, [id_aprendiz, id_formacion])

    // 3. Comparar cada día/hora de la nueva formación contra las existentes
    const targetDays = targetSchedule.rows
    const existingDays = existingSchedules.rows

    for (const newSlot of targetDays) {
      for (const existingSlot of existingDays) {
        // Solo comparar si comparten el mismo día de la semana
        if (newSlot.dia_semana === existingSlot.dia_semana) {
          // Verificar superposición temporal: A.inicio < B.fin AND A.fin > B.inicio
          const newStart = newSlot.hora_inicio
          const newEnd = newSlot.hora_fin
          const existStart = existingSlot.hora_inicio
          const existEnd = existingSlot.hora_fin

          if (newStart < existEnd && newEnd > existStart) {
            return res.status(409).json({
              success: false,
              message: `No se puede asignar: el horario se cruza con la formación "${existingSlot.nombre_programa}" (Ficha: ${existingSlot.id_formacion}) el día ${existingSlot.dia_semana} de ${existingSlot.hora_inicio} a ${existingSlot.hora_fin}.`
            })
          }
        }
      }
    }

    // 4. Sin superposición: proceder con la asignación
    await pool.query(
      `INSERT INTO aprendiz_formacion (id_aprendiz, id_formacion, estado)
       VALUES ($1, $2, 'activo')
       ON CONFLICT (id_aprendiz, id_formacion)
       DO UPDATE SET estado = 'activo', fecha_inicio = NOW()`,
      [id_aprendiz, id_formacion]
    )

    res.json({ success: true, message: "Formación asignada correctamente" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Error al asignar formación" })
  }
}

export const desvincularFormacionController = async (req: Request, res: Response) => {
  try {
    const { id_aprendiz, id_formacion } = req.params

    await pool.query(
      `UPDATE aprendiz_formacion
       SET estado = 'inactivo', fecha_fin = NOW()
       WHERE id_aprendiz = $1 AND id_formacion = $2`,
      [id_aprendiz, id_formacion]
    )

    res.json({ success: true, message: "Formación desvinculada correctamente" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Error al desvincular formación" })
  }
}

export const getProgramasController = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT * FROM programa ORDER BY nombre_programa ASC')
    res.json({ success: true, data: rows })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Error al obtener programas' })
  }
}

export const createProgramaController = async (req: Request, res: Response) => {
  try {
    const { nombre_programa, version, nivel, estado } = req.body
    if (!nombre_programa || !version || !nivel) {
      return res.status(400).json({ success: false, message: 'Campos requeridos faltantes' })
    }
    const { rows } = await pool.query(
      `INSERT INTO programa (nombre_programa, version, nivel, estado)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [nombre_programa, version, nivel, estado || 'activo']
    )
    res.json({ success: true, data: rows[0] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Error al crear programa' })
  }
}

export const updateProgramaController = async (req: Request, res: Response) => {
  try {
    const { id_programa } = req.params
    const { nombre_programa, version, nivel, estado } = req.body
    if (!nombre_programa || !version || !nivel) {
      return res.status(400).json({ success: false, message: 'Campos requeridos faltantes' })
    }

    const { rows } = await pool.query(
      `UPDATE programa
       SET nombre_programa = $1,
           version = $2,
           nivel = $3,
           estado = $4
       WHERE id_programa = $5
       RETURNING *`,
      [nombre_programa, version, nivel, estado || 'activo', id_programa]
    )
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Programa no encontrado' })
    }
    res.json({ success: true, data: rows[0] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Error al actualizar programa' })
  }
}

export const deleteProgramaController = async (req: Request, res: Response) => {
  try {
    const { id_programa } = req.params

    const { rows: inUse } = await pool.query(
      'SELECT id_formacion FROM formaciones WHERE id_programa = $1 LIMIT 1',
      [id_programa]
    )
    if (inUse.length > 0) {
      return res.status(409).json({
        success: false,
        message: `No se puede eliminar el programa curricular porque está asignado a fichas de formación activas (Ficha #${inUse[0].id_formacion}).`
      })
    }

    const { rowCount } = await pool.query('DELETE FROM programa WHERE id_programa = $1', [id_programa])
    if (rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Programa no encontrado' })
    }

    res.json({
      success: true,
      message: 'Programa curricular eliminado correctamente',
      data: { message: 'Programa curricular eliminado correctamente' }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Error al eliminar programa' })
  }
}

export const getHorariosController = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        h.id_horario, 
        TO_CHAR(h.hora_inicio, 'HH24:MI') AS hora_inicio, 
        TO_CHAR(h.hora_fin, 'HH24:MI') AS hora_fin, 
        h.jornada,
        COALESCE(
          (SELECT string_agg(hd.dia_semana, ', ') 
           FROM horario_dia hd 
           WHERE hd.id_horario = h.id_horario), 
          ''
        ) AS dias_semana
      FROM horario h
      ORDER BY h.id_horario ASC
    `)
    res.json({ success: true, data: rows })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Error al obtener horarios' })
  }
}

const detectJornada = (horaInicio: string, _horaFin: string): string => {
  if (!horaInicio) return 'Mañana';
  
  const [hStart, mStart] = horaInicio.split(':').map(Number);
  const startMin = hStart * 60 + mStart;
  
  // Mañana: antes de las 12:00 PM (720 min)
  if (startMin < 720) {
    return 'Mañana';
  }
  // Tarde: entre las 12:00 PM y las 6:00 PM (720 min y 1080 min)
  if (startMin >= 720 && startMin < 1080) {
    return 'Tarde';
  }
  // Noche: después de las 6:00 PM (1080 min)
  return 'Noche';
}

export const createHorarioController = async (req: Request, res: Response) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { hora_inicio, hora_fin, dias_semana } = req.body
    if (!hora_inicio || !hora_fin || !Array.isArray(dias_semana) || dias_semana.length === 0) {
      await client.query('ROLLBACK')
      return res.status(400).json({ success: false, message: 'Campos requeridos faltantes o inválidos' })
    }
    
    const calculatedJornada = detectJornada(hora_inicio, hora_fin)
    
    const { rows } = await client.query(
      `INSERT INTO horario (hora_inicio, hora_fin, jornada)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [hora_inicio, hora_fin, calculatedJornada]
    )
    const id_horario = rows[0].id_horario

    for (const dia of dias_semana) {
      await client.query(
        `INSERT INTO horario_dia (id_horario, dia_semana)
         VALUES ($1, $2)`,
        [id_horario, dia]
      )
    }

    await client.query('COMMIT')
    res.json({ success: true, data: { ...rows[0], dias_semana: dias_semana.join(', ') } })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error(error)
    res.status(500).json({ success: false, message: 'Error al crear horario' })
  } finally {
    client.release()
  }
}

export const updateHorarioController = async (req: Request, res: Response) => {
  const client = await pool.connect()
  try {
    const { id_horario } = req.params
    const { hora_inicio, hora_fin, dias_semana } = req.body

    if (!hora_inicio || !hora_fin || !Array.isArray(dias_semana) || dias_semana.length === 0) {
      return res.status(400).json({ success: false, message: 'Campos requeridos faltantes o inválidos' })
    }

    await client.query('BEGIN')

    // Validar cruce estricto de horarios para aprendices con doble titulación
    const overlapQuery = `
      SELECT 
        a.nombre, 
        a.apellido, 
        a.documento,
        f1.id_formacion AS ficha_actual,
        f2.id_formacion AS ficha_conflicto,
        p2.nombre_programa AS programa_conflicto,
        TO_CHAR(h2.hora_inicio, 'HH24:MI') AS inicio_conflicto,
        TO_CHAR(h2.hora_fin, 'HH24:MI') AS fin_conflicto,
        hd2.dia_semana AS dia_conflicto
      FROM aprendiz_formacion af1
      JOIN formaciones f1 ON f1.id_formacion = af1.id_formacion
      JOIN aprendiz_formacion af2 ON af2.id_aprendiz = af1.id_aprendiz AND af2.id_formacion != af1.id_formacion AND af2.estado = 'activo'
      JOIN formaciones f2 ON f2.id_formacion = af2.id_formacion AND f2.estado = 'activa'
      JOIN horario h2 ON h2.id_horario = f2.id_horario
      JOIN horario_dia hd2 ON hd2.id_horario = h2.id_horario
      JOIN programa p2 ON p2.id_programa = f2.id_programa
      JOIN aprendiz a ON a.id_aprendiz = af1.id_aprendiz
      WHERE f1.id_horario = $1 
        AND af1.estado = 'activo'
        AND f1.estado = 'activa'
        AND hd2.dia_semana = ANY($2::text[])
        AND (
          ($3::time < h2.hora_fin) AND ($4::time > h2.hora_inicio)
        )
      LIMIT 5
    `

    const { rows: conflicts } = await client.query(overlapQuery, [
      id_horario,
      dias_semana,
      hora_inicio,
      hora_fin
    ])

    if (conflicts.length > 0) {
      await client.query('ROLLBACK')
      const first = conflicts[0]
      return res.status(409).json({
        success: false,
        message: `Conflicto de cruce de horario: El aprendiz ${first.nombre} ${first.apellido} (Doc: ${first.documento}) matriculado en Ficha #${first.ficha_actual} se cruzaría los ${first.dia_conflicto} con la Ficha #${first.ficha_conflicto} (${first.programa_conflicto} de ${first.inicio_conflicto} a ${first.fin_conflicto}). Modifique primero la matrícula o el horario.`,
        conflicts
      })
    }

    const calculatedJornada = detectJornada(hora_inicio, hora_fin)

    const { rows } = await client.query(
      `UPDATE horario
       SET hora_inicio = $1,
           hora_fin = $2,
           jornada = $3
       WHERE id_horario = $4
       RETURNING *`,
      [hora_inicio, hora_fin, calculatedJornada, id_horario]
    )

    if (rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ success: false, message: 'Horario no encontrado' })
    }

    // Actualizar días asociados
    await client.query('DELETE FROM horario_dia WHERE id_horario = $1', [id_horario])
    for (const dia of dias_semana) {
      await client.query(
        `INSERT INTO horario_dia (id_horario, dia_semana) VALUES ($1, $2)`,
        [id_horario, dia]
      )
    }

    await client.query('COMMIT')
    res.json({
      success: true,
      message: 'Horario académico actualizado correctamente',
      data: { ...rows[0], dias_semana: dias_semana.join(', ') }
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error(error)
    res.status(500).json({ success: false, message: 'Error al actualizar horario' })
  } finally {
    client.release()
  }
}

export const deleteHorarioController = async (req: Request, res: Response) => {
  const client = await pool.connect()
  try {
    const { id_horario } = req.params

    const { rows: inUse } = await client.query(
      'SELECT id_formacion FROM formaciones WHERE id_horario = $1 LIMIT 1',
      [id_horario]
    )
    if (inUse.length > 0) {
      return res.status(409).json({
        success: false,
        message: `No se puede eliminar el horario porque está asignado a fichas de formación activas (Ficha #${inUse[0].id_formacion}).`
      })
    }

    await client.query('BEGIN')
    await client.query('DELETE FROM horario_dia WHERE id_horario = $1', [id_horario])
    const { rowCount } = await client.query('DELETE FROM horario WHERE id_horario = $1', [id_horario])

    if (rowCount === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ success: false, message: 'Horario no encontrado' })
    }

    await client.query('COMMIT')
    res.json({
      success: true,
      message: 'Horario académico eliminado correctamente',
      data: { message: 'Horario académico eliminado correctamente' }
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error(error)
    res.status(500).json({ success: false, message: 'Error al eliminar horario' })
  } finally {
    client.release()
  }
}

export const getAllFormacionesController = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        f.id_formacion, 
        p.nombre_programa AS nombre, 
        p.nombre_programa,
        p.version,
        p.nivel, 
        f.estado,
        TO_CHAR(f.fecha_inicio, 'YYYY-MM-DD') AS fecha_inicio,
        TO_CHAR(f.fecha_fin, 'YYYY-MM-DD') AS fecha_fin,
        f.id_programa,
        f.id_horario,
        TO_CHAR(h.hora_inicio, 'HH12:MI AM') AS hora_inicio,
        TO_CHAR(h.hora_fin, 'HH12:MI AM') AS hora_fin,
        h.jornada,
        (SELECT string_agg(hd.dia_semana, ', ') FROM horario_dia hd WHERE hd.id_horario = h.id_horario) AS dias_semana,
        (SELECT COUNT(*) FROM aprendiz_formacion af WHERE af.id_formacion = f.id_formacion AND af.estado = 'activo') AS total_aprendices
      FROM formaciones f
      JOIN programa p ON p.id_programa = f.id_programa
      JOIN horario h ON h.id_horario = f.id_horario
      ORDER BY f.id_formacion ASC
    `)
    res.json({ success: true, data: rows })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Error al obtener formaciones' })
  }
}

export const createFormacionController = async (req: Request, res: Response) => {
  try {
    const { id_formacion, id_programa, id_horario, fecha_inicio, fecha_fin, estado } = req.body
    if (!id_formacion || !id_programa || !id_horario) {
      return res.status(400).json({ success: false, message: 'Campos requeridos id_formacion, id_programa, e id_horario faltantes' })
    }
    const { rows } = await pool.query(
      `INSERT INTO formaciones (id_formacion, id_programa, id_horario, fecha_inicio, fecha_fin, estado)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        id_formacion, 
        id_programa, 
        id_horario, 
        fecha_inicio || new Date(), 
        fecha_fin || new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000), 
        estado || 'activa'
      ]
    )
    res.json({ success: true, data: rows[0] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Error al crear formación' })
  }
}

export const updateFormacionController = async (req: Request, res: Response) => {
  try {
    const { id_formacion: old_id_formacion } = req.params
    const { id_formacion: new_id_formacion, id_programa, id_horario, fecha_inicio, fecha_fin, estado } = req.body
    if (!id_programa || !id_horario) {
      return res.status(400).json({ success: false, message: 'Campos requeridos id_programa e id_horario faltantes' })
    }

    // Validar si el nuevo horario genera conflicto con otra formación para algún aprendiz de esta ficha
    const conflictQuery = `
      SELECT 
        a.nombre, 
        a.apellido, 
        a.documento,
        f2.id_formacion AS ficha_conflicto,
        p2.nombre_programa AS programa_conflicto,
        TO_CHAR(h2.hora_inicio, 'HH24:MI') AS inicio_conflicto,
        TO_CHAR(h2.hora_fin, 'HH24:MI') AS fin_conflicto,
        hd2.dia_semana AS dia_conflicto
      FROM aprendiz_formacion af1
      JOIN aprendiz_formacion af2 ON af2.id_aprendiz = af1.id_aprendiz AND af2.id_formacion != $1 AND af2.estado = 'activo'
      JOIN formaciones f2 ON f2.id_formacion = af2.id_formacion AND f2.estado = 'activa'
      JOIN horario h2 ON h2.id_horario = f2.id_horario
      JOIN horario_dia hd2 ON hd2.id_horario = h2.id_horario
      JOIN programa p2 ON p2.id_programa = f2.id_programa
      JOIN horario hNew ON hNew.id_horario = $2
      JOIN horario_dia hdNew ON hdNew.id_horario = hNew.id_horario
      JOIN aprendiz a ON a.id_aprendiz = af1.id_aprendiz
      WHERE af1.id_formacion = $1 
        AND af1.estado = 'activo'
        AND hd2.dia_semana = hdNew.dia_semana
        AND (
          (hNew.hora_inicio < h2.hora_fin) AND (hNew.hora_fin > h2.hora_inicio)
        )
      LIMIT 5
    `

    const { rows: conflicts } = await pool.query(conflictQuery, [old_id_formacion, id_horario])

    if (conflicts.length > 0) {
      const first = conflicts[0]
      return res.status(409).json({
        success: false,
        message: `Conflicto de cruce de horario: El aprendiz ${first.nombre} ${first.apellido} (Doc: ${first.documento}) matriculado en esta ficha se cruzaría los ${first.dia_conflicto} con la Ficha #${first.ficha_conflicto} (${first.programa_conflicto} de ${first.inicio_conflicto} a ${first.fin_conflicto}). Modifique primero la matrícula o el horario.`,
        conflicts
      })
    }

    const { rows } = await pool.query(
      `UPDATE formaciones
       SET id_formacion = COALESCE($1, id_formacion),
           id_programa = $2,
           id_horario = $3,
           fecha_inicio = COALESCE($4, fecha_inicio),
           fecha_fin = COALESCE($5, fecha_fin),
           estado = COALESCE($6, estado)
       WHERE id_formacion = $7
       RETURNING *`,
      [
        new_id_formacion || null,
        id_programa,
        id_horario,
        fecha_inicio || null,
        fecha_fin || null,
        estado || null,
        old_id_formacion
      ]
    )
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Formación no encontrada' })
    }
    res.json({ success: true, message: 'Ficha de formación actualizada correctamente', data: rows[0] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Error al actualizar formación' })
  }
}

export const deleteFormacionController = async (req: Request, res: Response) => {
  try {
    const { id_formacion } = req.params
    const { rowCount } = await pool.query('DELETE FROM formaciones WHERE id_formacion = $1', [id_formacion])
    if (rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Formación no encontrada' })
    }
    res.json({
      success: true,
      message: 'Formación eliminada correctamente',
      data: { message: 'Formación eliminada correctamente' }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Error al eliminar formación' })
  }
}

export const getFormacionAprendicesController = async (req: Request, res: Response) => {
  try {
    const { id_formacion } = req.params

    const { rows: vinculados } = await pool.query(
      `SELECT a.id_aprendiz, a.documento, a.nombre, a.apellido, af.estado, af.fecha_inicio
       FROM aprendiz_formacion af
       JOIN aprendiz a ON a.id_aprendiz = af.id_aprendiz
       WHERE af.id_formacion = $1 AND af.estado = 'activo'
       ORDER BY a.nombre ASC`,
      [id_formacion]
    )

    const { rows: noVinculados } = await pool.query(
      `SELECT a.id_aprendiz, a.documento, a.nombre, a.apellido
       FROM aprendiz a
       WHERE a.id_aprendiz NOT IN (
         SELECT af.id_aprendiz 
         FROM aprendiz_formacion af 
         WHERE af.id_formacion = $1 AND af.estado = 'activo'
       )
       ORDER BY a.nombre ASC`,
      [id_formacion]
    )

    res.json({
      success: true,
      data: {
        vinculados,
        noVinculados
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Error al obtener aprendices de la formación' })
  }
}

export const desvincularTodosFormacionController = async (req: Request, res: Response) => {
  try {
    const { id_formacion } = req.params
    const { rowCount } = await pool.query(
      `DELETE FROM aprendiz_formacion WHERE id_formacion = $1 AND estado = 'activo'`,
      [id_formacion]
    )

    const message = `Se desvincularon ${rowCount ?? 0} aprendices de la formación exitosamente.`
    res.json({
      success: true,
      message,
      data: {
        desvinculados: rowCount ?? 0,
        message
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Error al desvincular todos los aprendices de la formación' })
  }
}

/* ==========================================================================
   GESTIÓN EXCLUSIVA DE CELADORES (SOLO ROL CELADOR / ID_ROL = 2)
   ========================================================================== */

export const getCeladoresController = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        u.id_usuario,
        u.nombre,
        u.email,
        u.id_rol,
        r.nombre AS rol,
        u.activo,
        u.creado_en,
        u.ultimo_login
      FROM usuarios u
      JOIN roles r ON r.id_rol = u.id_rol
      WHERE u.id_rol = 2 -- Exclusivamente CELADOR
      ORDER BY u.id_usuario DESC
    `)
    res.json({ success: true, data: rows })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Error al obtener celadores' })
  }
}

export const createCeladorController = async (req: Request, res: Response) => {
  try {
    const { nombre, email, password } = req.body

    if (!nombre || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nombre, email y contraseña son obligatorios' 
      })
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'La contraseña debe tener al menos 6 caracteres' 
      })
    }

    // Verificar si el email ya existe
    const { rowCount } = await pool.query('SELECT 1 FROM usuarios WHERE email = $1', [email.trim().toLowerCase()])
    if (rowCount && rowCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'El correo electrónico ya se encuentra registrado' 
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Forzar siempre id_rol = 2 (CELADOR) para impedir creación de administradores
    const { rows } = await pool.query(`
      INSERT INTO usuarios (nombre, email, password, id_rol, activo)
      VALUES ($1, $2, $3, 2, true)
      RETURNING id_usuario, nombre, email, id_rol, activo, creado_en
    `, [nombre.trim(), email.trim().toLowerCase(), hashedPassword])

    res.status(201).json({
      success: true,
      message: 'Celador creado exitosamente',
      data: rows[0]
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Error al crear celador' })
  }
}

export const updateCeladorController = async (req: Request, res: Response) => {
  try {
    const { id_usuario } = req.params
    const { nombre, email, password } = req.body

    if (!nombre || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nombre y email son obligatorios' 
      })
    }

    // Verificar que el usuario a editar sea un Celador (id_rol = 2)
    const userCheck = await pool.query('SELECT id_rol FROM usuarios WHERE id_usuario = $1', [id_usuario])
    if (userCheck.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' })
    }
    if (userCheck.rows[0].id_rol !== 2) {
      return res.status(403).json({ success: false, message: 'Solo se permite editar cuentas de celadores' })
    }

    // Verificar si el email está en uso por otro usuario
    const emailCheck = await pool.query(
      'SELECT 1 FROM usuarios WHERE email = $1 AND id_usuario != $2',
      [email.trim().toLowerCase(), id_usuario]
    )
    if (emailCheck.rowCount && emailCheck.rowCount > 0) {
      return res.status(400).json({ success: false, message: 'El correo electrónico ya está en uso por otro usuario' })
    }

    if (password && password.trim().length > 0) {
      if (password.trim().length < 6) {
        return res.status(400).json({ success: false, message: 'La nueva contraseña debe tener al menos 6 caracteres' })
      }
      const hashedPassword = await bcrypt.hash(password.trim(), 10)
      const { rows } = await pool.query(`
        UPDATE usuarios 
        SET nombre = $1, email = $2, password = $3 
        WHERE id_usuario = $4 AND id_rol = 2
        RETURNING id_usuario, nombre, email, id_rol, activo
      `, [nombre.trim(), email.trim().toLowerCase(), hashedPassword, id_usuario])
      return res.json({ success: true, message: 'Celador actualizado con nueva contraseña', data: rows[0] })
    } else {
      const { rows } = await pool.query(`
        UPDATE usuarios 
        SET nombre = $1, email = $2 
        WHERE id_usuario = $3 AND id_rol = 2
        RETURNING id_usuario, nombre, email, id_rol, activo
      `, [nombre.trim(), email.trim().toLowerCase(), id_usuario])
      return res.json({ success: true, message: 'Datos de celador actualizados exitosamente', data: rows[0] })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Error al actualizar celador' })
  }
}

export const toggleCeladorStatusController = async (req: Request, res: Response) => {
  try {
    const { id_usuario } = req.params

    const userCheck = await pool.query('SELECT id_rol, activo FROM usuarios WHERE id_usuario = $1', [id_usuario])
    if (userCheck.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' })
    }
    if (userCheck.rows[0].id_rol !== 2) {
      return res.status(403).json({ success: false, message: 'Solo se permite cambiar el estado de cuentas de celadores' })
    }

    const currentStatus = userCheck.rows[0].activo
    const newStatus = !currentStatus

    const { rows } = await pool.query(`
      UPDATE usuarios
      SET activo = $1
      WHERE id_usuario = $2 AND id_rol = 2
      RETURNING id_usuario, nombre, email, activo
    `, [newStatus, id_usuario])

    res.json({
      success: true,
      message: `Cuenta de celador ${newStatus ? 'activada' : 'desactivada'} correctamente`,
      data: rows[0]
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Error al modificar estado del celador' })
  }
}

export const importarAprendicesMasivoController = async (req: Request, res: Response) => {
  try {
    const { id_formacion } = req.params
    const { aprendices, autoCreateNonExisting } = req.body

    if (!id_formacion || !Array.isArray(aprendices) || aprendices.length === 0) {
      return res.status(400).json({
        success: false,
        message: "id_formacion y un listado no vacío de aprendices son obligatorios"
      })
    }

    // 1. Obtener horario activo de la formación destino
    const targetSchedule = await pool.query(`
      SELECT f.id_formacion, p.nombre_programa, h.hora_inicio, h.hora_fin, hd.dia_semana
      FROM formaciones f
      JOIN programa p ON p.id_programa = f.id_programa
      JOIN horario h ON h.id_horario = f.id_horario
      JOIN horario_dia hd ON hd.id_horario = h.id_horario
      WHERE f.id_formacion = $1 AND f.estado = 'activa'
    `, [id_formacion])

    if (targetSchedule.rowCount === 0) {
      return res.status(400).json({
        success: false,
        message: "La formación especificada no existe o no tiene un horario activo asignado"
      })
    }

    const targetDays = targetSchedule.rows

    const results = {
      total: aprendices.length,
      vinculados: 0,
      creadosYVinculados: 0,
      omitidos: 0,
      detalles: [] as Array<{
        documento: string
        nombre?: string
        apellido?: string
        estado: 'vinculado' | 'creado_y_vinculado' | 'conflicto_horario' | 'no_encontrado' | 'error' | 'ya_vinculado'
        motivo?: string
      }>
    }

    // Procesar cada fila
    for (const item of aprendices) {
      const docRaw = item.documento ? String(item.documento).trim() : ''
      const nombreRaw = item.nombre ? String(item.nombre).trim() : ''
      const apellidoRaw = item.apellido ? String(item.apellido).trim() : ''

      if (!docRaw || docRaw.length < 5 || docRaw.length > 20) {
        results.omitidos++
        results.detalles.push({
          documento: docRaw || 'N/A',
          nombre: nombreRaw,
          apellido: apellidoRaw,
          estado: 'error',
          motivo: 'Documento inválido (debe tener entre 5 y 20 caracteres)'
        })
        continue
      }

      // Buscar aprendiz por documento
      const aprendizCheck = await pool.query(
        `SELECT id_aprendiz, nombre, apellido FROM aprendiz WHERE documento = $1`,
        [docRaw]
      )

      let idAprendiz: number | null = null
      let wasCreated = false
      let currentNombre = nombreRaw
      let currentApellido = apellidoRaw

      if (aprendizCheck.rowCount! > 0) {
        idAprendiz = aprendizCheck.rows[0].id_aprendiz
        currentNombre = aprendizCheck.rows[0].nombre
        currentApellido = aprendizCheck.rows[0].apellido
      } else {
        // No existe
        if (!autoCreateNonExisting) {
          results.omitidos++
          results.detalles.push({
            documento: docRaw,
            nombre: nombreRaw,
            apellido: apellidoRaw,
            estado: 'no_encontrado',
            motivo: 'El aprendiz no está registrado en el sistema'
          })
          continue
        }

        // Crear aprendiz
        if (!nombreRaw || !apellidoRaw) {
          results.omitidos++
          results.detalles.push({
            documento: docRaw,
            nombre: nombreRaw,
            apellido: apellidoRaw,
            estado: 'error',
            motivo: 'No se puede crear el aprendiz: nombre y apellido son obligatorios'
          })
          continue
        }

        try {
          const newAprendiz = await pool.query(
            `INSERT INTO aprendiz (documento, nombre, apellido, estado)
             VALUES ($1, $2, $3, true)
             RETURNING id_aprendiz`,
            [docRaw, nombreRaw, apellidoRaw]
          )
          idAprendiz = newAprendiz.rows[0].id_aprendiz
          wasCreated = true
        } catch (insertErr: unknown) {
          results.omitidos++
          const insertMsg = insertErr instanceof Error ? insertErr.message : 'Error en base de datos'
          results.detalles.push({
            documento: docRaw,
            nombre: nombreRaw,
            apellido: apellidoRaw,
            estado: 'error',
            motivo: `Error al registrar aprendiz: ${insertMsg}`
          })
          continue
        }
      }

      // Verificar si ya está vinculado a esta formación
      const alreadyLinkedCheck = await pool.query(
        `SELECT estado FROM aprendiz_formacion WHERE id_aprendiz = $1 AND id_formacion = $2`,
        [idAprendiz, id_formacion]
      )

      if (alreadyLinkedCheck.rowCount! > 0 && alreadyLinkedCheck.rows[0].estado === 'activo') {
        results.omitidos++
        results.detalles.push({
          documento: docRaw,
          nombre: currentNombre,
          apellido: currentApellido,
          estado: 'ya_vinculado',
          motivo: 'El aprendiz ya se encuentra vinculado activamente a esta ficha'
        })
        continue
      }

      // Verificar cruce de horario con otras formaciones activas del aprendiz (RN-ACAD-008)
      const existingSchedules = await pool.query(`
        SELECT f.id_formacion, p.nombre_programa, h.hora_inicio, h.hora_fin, hd.dia_semana
        FROM aprendiz_formacion af
        JOIN formaciones f ON f.id_formacion = af.id_formacion
        JOIN programa p ON p.id_programa = f.id_programa
        JOIN horario h ON h.id_horario = f.id_horario
        JOIN horario_dia hd ON hd.id_horario = h.id_horario
        WHERE af.id_aprendiz = $1 AND af.estado = 'activo' AND f.estado = 'activa'
          AND af.id_formacion != $2
      `, [idAprendiz, id_formacion])

      let hasConflict = false
      let conflictMessage = ''

      for (const newSlot of targetDays) {
        for (const existingSlot of existingSchedules.rows) {
          if (newSlot.dia_semana === existingSlot.dia_semana) {
            const newStart = newSlot.hora_inicio
            const newEnd = newSlot.hora_fin
            const existStart = existingSlot.hora_inicio
            const existEnd = existingSlot.hora_fin

            if (newStart < existEnd && newEnd > existStart) {
              hasConflict = true
              conflictMessage = `Cruce de horario con "${existingSlot.nombre_programa}" (Ficha ${existingSlot.id_formacion}) el ${existingSlot.dia_semana} (${existingSlot.hora_inicio} a ${existingSlot.hora_fin})`
              break
            }
          }
        }
        if (hasConflict) break
      }

      if (hasConflict) {
        results.omitidos++
        results.detalles.push({
          documento: docRaw,
          nombre: currentNombre,
          apellido: currentApellido,
          estado: 'conflicto_horario',
          motivo: conflictMessage
        })
        continue
      }

      // Proceder con la vinculación
      await pool.query(
        `INSERT INTO aprendiz_formacion (id_aprendiz, id_formacion, estado)
         VALUES ($1, $2, 'activo')
         ON CONFLICT (id_aprendiz, id_formacion)
         DO UPDATE SET estado = 'activo', fecha_inicio = NOW()`,
        [idAprendiz, id_formacion]
      )

      if (wasCreated) {
        results.creadosYVinculados++
        results.vinculados++
        results.detalles.push({
          documento: docRaw,
          nombre: currentNombre,
          apellido: currentApellido,
          estado: 'creado_y_vinculado'
        })
      } else {
        results.vinculados++
        results.detalles.push({
          documento: docRaw,
          nombre: currentNombre,
          apellido: currentApellido,
          estado: 'vinculado'
        })
      }
    }

    return res.json({
      success: true,
      message: `Proceso completado: ${results.vinculados} vinculados (${results.creadosYVinculados} creados), ${results.omitidos} omitidos.`,
      summary: {
        total: results.total,
        vinculados: results.vinculados,
        creadosYVinculados: results.creadosYVinculados,
        omitidos: results.omitidos
      },
      detalles: results.detalles
    })
  } catch (error) {
    console.error('Error en importación masiva:', error)
    res.status(500).json({ success: false, message: 'Error interno al procesar la importación masiva' })
  }
}

