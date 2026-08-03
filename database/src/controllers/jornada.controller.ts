import { Request, Response } from 'express'
import { pool } from '../config/db'


/**
 * @swagger
 * /api/jornadaTime/timeNow:
 *   get:
 *     summary: Obtener la hora actual del servidor (Base de Datos)
 *     tags: [Utility]
 *     responses:
 *       200:
 *         description: Hora actual en formato ISO
 */
import { getSystemNow, getSimulatedTimeState } from '../utils/timeSimulation'

export const realTimeNow = async (request: Request, response: Response) => {
  try {
    const simState = getSimulatedTimeState()
    if (simState.isSimulated) {
      return response.status(200).json({ time: getSystemNow().toISOString(), isSimulated: true })
    }

    const newTime = await pool.query("SELECT NOW() AS current_time")
    return response.status(200).json({ time: newTime.rows[0].current_time, isSimulated: false })
  } catch (error) {
    console.log(error)
    return response.status(400).json({ message: 'Error al obtener la hora' })
  }
}

/**
 * @swagger
 * /api/jornadaTime/predominante/{id_aprendiz}:
 *   get:
 *     summary: Obtener la jornada predominante inferida para un aprendiz
 *     tags: [Utility]
 *     parameters:
 *       - in: path
 *         name: id_aprendiz
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Jornada predominante y detalle de cálculo
 */
export const getJornadaPredominante = async (request: Request, response: Response) => {
  try {
    const { id_aprendiz } = request.params;

    if (!id_aprendiz) {
      return response.status(400).json({ message: 'ID de aprendiz no provisto' });
    }

    const query = `
      WITH sesiones AS (
        SELECT 
          CASE 
            WHEN EXTRACT(HOUR FROM di.hora_ingreso) >= 6 AND EXTRACT(HOUR FROM di.hora_ingreso) < 12 THEN 'DIURNA'
            WHEN EXTRACT(HOUR FROM di.hora_ingreso) >= 12 AND EXTRACT(HOUR FROM di.hora_ingreso) < 18 THEN 'TARDE'
            ELSE 'NOCHE'
          END AS jornada_tipo,
          COALESCE(EXTRACT(EPOCH FROM (ds.hora_salida - di.hora_ingreso)) / 3600.0, 0) AS horas_permanencia
        FROM detalles_ingreso di
        LEFT JOIN detalles_salida ds ON ds.id_ingreso = di.id_ingreso
        WHERE di.id_aprendiz = $1
      ),
      puntajes AS (
        SELECT 
          jornada_tipo,
          COUNT(*) AS ingresos,
          SUM(horas_permanencia) AS horas,
          (COUNT(*) * 0.4) + (SUM(horas_permanencia) * 0.6) AS puntaje
        FROM sesiones
        GROUP BY jornada_tipo
      )
      SELECT jornada_tipo, ingresos, horas, puntaje
      FROM puntajes
      ORDER BY puntaje DESC
      LIMIT 1;
    `;

    const result = await pool.query(query, [id_aprendiz]);

    if (result.rowCount === 0) {
      return response.status(200).json({
        jornada: 'SIN_JORNADA',
        ingresos: 0,
        horas: 0,
        puntaje: 0
      });
    }

    const row = result.rows[0];
    return response.status(200).json({
      jornada: row.jornada_tipo,
      ingresos: parseInt(row.ingresos, 10),
      horas: parseFloat(row.horas),
      puntaje: parseFloat(row.puntaje)
    });

  } catch (error) {
    console.error('Error calculando jornada predominante:', error);
    return response.status(500).json({ message: 'Error interno del servidor', error });
  }
};
