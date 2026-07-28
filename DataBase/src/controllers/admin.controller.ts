import type { Request, Response } from 'express'
import { AdminService } from '../services/admin.service'
import { CTAResponse } from '../types/contract.type'
import { pool } from '../config/db'
import { filtersMap } from '../utils/filtersMap'
import { setSimulatedTime, getSimulatedTimeState } from '../utils/timeSimulation'

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

const detectJornada = (horaInicio: string, horaFin: string): string => {
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

export const getAllFormacionesController = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        f.id_formacion, 
        p.nombre_programa AS nombre, 
        p.nivel, 
        f.estado,
        TO_CHAR(f.fecha_inicio, 'YYYY-MM-DD') AS fecha_inicio,
        TO_CHAR(f.fecha_fin, 'YYYY-MM-DD') AS fecha_fin,
        f.id_programa,
        p.nombre_programa,
        f.id_horario,
        TO_CHAR(h.hora_inicio, 'HH24:MI') AS hora_inicio,
        TO_CHAR(h.hora_fin, 'HH24:MI') AS hora_fin,
        h.jornada,
        (SELECT string_agg(hd.dia_semana, ', ') FROM horario_dia hd WHERE hd.id_horario = h.id_horario) AS dias_semana
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
    res.json({ success: true, data: rows[0] })
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
    res.json({ success: true, message: 'Formación eliminada correctamente' })
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
