// Controlador para consultar id del aprendiz
import { Request, Response } from 'express'
import { pool } from '../config/db'
import { filtersMap } from '../utils/filtersMap';

// Funcion para el historial de ingresos
/**
 * @swagger
 * /api/estadisticas/historial:
 *   get:
 *     summary: Obtener conteos estadísticos de hoy, mes y trimestre
 *     tags: [Estadisticas]
 *     responses:
 *       200:
 *         description: Resumen estadístico
 */
export const StatsRecord = async (request: Request, response: Response) => {
  try {
    const entradasHoy = await pool.query(`SELECT COUNT(*) AS total FROM detalles_ingreso AS di WHERE ${filtersMap.date['TODAY']}`)
    const salidasHoy = await pool.query(`SELECT COUNT(*) AS total FROM detalles_salida AS ds WHERE ds.hora_salida >= CURRENT_DATE AND ds.hora_salida < CURRENT_DATE + INTERVAL '1 day'`)
    const esteMes = await pool.query(`SELECT COUNT(*) AS total FROM detalles_ingreso AS di WHERE ${filtersMap.date['THIS_MONTH']}`)
    const trimestre = await pool.query(`SELECT COUNT(*) AS total FROM detalles_ingreso AS di WHERE ${filtersMap.date['THIS_QUARTER']}`)

    return response.status(200).json({
      entradasHoy : Number(entradasHoy.rows[0]?.total || 0),
      salidasHoy : Number(salidasHoy.rows[0]?.total || 0),
      esteMes : Number(esteMes.rows[0]?.total || 0),
      trimestre : Number(trimestre.rows[0]?.total || 0),
    });
  } catch(error) {
    console.error('[StatsRecord Error]:', error)
    return response.status(500).json({ success: false, message: 'Error interno al obtener estadísticas' })
  }
};

/**
 * @swagger
 * /api/estadisticas/actividadHoy:
 *   get:
 *     summary: Obtener las últimas 4 actividades del día
 *     tags: [Estadisticas]
 *     responses:
 *       200:
 *         description: Lista de actividades recientes
 */
export const TodayActivity = async (request: Request, response: Response) => {
  try {
    const result = await pool.query(`SELECT
      a.nombre,
      FLOOR(EXTRACT(EPOCH FROM (NOW() - di.hora_ingreso)) / 60) AS tiempo,
      'entrada' AS tipo,
      TO_CHAR(di.hora_ingreso, 'HH12:MI AM') AS hora,
      di.hora_ingreso AS fecha,
      a.documento AS documento,
      COALESCE(p.nombre_programa, di.motivo_visita, 'Sin formación') AS formacion,
      p.nombre_programa,
      f.id_formacion AS id_formacion,
      di.motivo_visita
    FROM detalles_ingreso di
    JOIN aprendiz a ON a.id_aprendiz = di.id_aprendiz
    LEFT JOIN (
      SELECT id_aprendiz, id_formacion
      FROM (
        SELECT id_aprendiz, id_formacion,
               ROW_NUMBER() OVER (PARTITION BY id_aprendiz ORDER BY id_formacion DESC) as rn
        FROM aprendiz_formacion
        WHERE estado = 'activo'
      ) sub
      WHERE rn = 1
    ) af_fallback ON af_fallback.id_aprendiz = di.id_aprendiz AND di.id_formacion IS NULL
    LEFT JOIN formaciones f ON f.id_formacion = COALESCE(di.id_formacion, af_fallback.id_formacion)
    LEFT JOIN programa p ON p.id_programa = f.id_programa
    WHERE ${filtersMap.date.TODAY}

    UNION ALL

    SELECT
      a.nombre,
      FLOOR(EXTRACT(EPOCH FROM (NOW() - ds.hora_salida)) / 60) AS tiempo,
      'salida' AS tipo,
      TO_CHAR(ds.hora_salida, 'HH12:MI AM') AS hora,
      ds.hora_salida AS fecha,
      a.documento AS documento,
      COALESCE(p.nombre_programa, di.motivo_visita, 'Sin formación') AS formacion,
      p.nombre_programa,
      f.id_formacion AS id_formacion,
      di.motivo_visita
    FROM detalles_salida ds
    JOIN detalles_ingreso AS di ON di.id_ingreso = ds.id_ingreso
    JOIN aprendiz a ON a.id_aprendiz = di.id_aprendiz
    LEFT JOIN (
      SELECT id_aprendiz, id_formacion
      FROM (
        SELECT id_aprendiz, id_formacion,
               ROW_NUMBER() OVER (PARTITION BY id_aprendiz ORDER BY id_formacion DESC) as rn
        FROM aprendiz_formacion
        WHERE estado = 'activo'
      ) sub
      WHERE rn = 1
    ) af_fallback ON af_fallback.id_aprendiz = di.id_aprendiz AND di.id_formacion IS NULL
    LEFT JOIN formaciones f ON f.id_formacion = COALESCE(di.id_formacion, af_fallback.id_formacion)
    LEFT JOIN programa p ON p.id_programa = f.id_programa
    WHERE ds.hora_salida >= CURRENT_DATE
      AND ds.hora_salida < CURRENT_DATE + INTERVAL '1 day'

    ORDER BY fecha DESC
    LIMIT 4;`)

    const aprendices = result.rows.map(row => ({
      nombre: row.nombre,
      tiempo: row.tiempo,
      tipo: row.tipo,
      documento : row.documento,
      formacion : row.formacion,
      hora : row.hora
    }))

    return response.status(200).json({ aprendices })
  } catch(error) {
    console.error('[TodayActivity Error]:', error)
    return response.status(500).json({ success: false, message: 'Error interno al obtener actividades recientes' })
  }
};

