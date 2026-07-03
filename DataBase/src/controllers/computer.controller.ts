import { Request, Response } from 'express'
import { pool } from '../config/db'
import { filtersMap } from '../utils/filtersMap'
import { QueryBuilder } from '../utils/queryBuilder.util'
import { searchGlobal } from '../utils/search.util'
// 🔥 Historial computadores con filtros dinámicos
/**
 * @swagger
 * /api/HistorialComputadores/historial:
 *   get:
 *     summary: Obtener historial de ingresos de computadores con filtros
 *     tags: [HistorialComputadores]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         description: Filtro de fecha (TODAY, WEEK, etc.)
 *     responses:
 *       200:
 *         description: Lista de historial de computadores
 */
export const getHistorialComputadores = async (req: Request, res: Response) => {
  try {
    const { date } = req.query as {
      date?: keyof typeof filtersMap.date
    }

    const queryConfig: QueryBuilder = {
      select: [
        'dm.id_detallemaquina',
        'dm.id_computador',
        'c.marca AS marca',
        'c.serial',
        'a.documento',
        'a.id_aprendiz',
        'dm.firma_ingreso',
        `TO_CHAR(di.hora_ingreso, 'DD Mon HH12:MI AM') AS hora_ingreso`,
        `TO_CHAR(ds.hora_salida, 'DD Mon HH12:MI AM') AS hora_salida`
      ],
      from: 'detalles_maquinas dm',
      joins: [
        'JOIN detalles_ingreso di ON di.id_detallemaquina = dm.id_detallemaquina',
        'LEFT JOIN detalles_salida ds ON ds.id_ingreso = di.id_ingreso',
        'JOIN computadores c ON c.id_computador = dm.id_computador',
        'JOIN aprendiz a ON a.id_aprendiz = di.id_aprendiz'
      ],
      where: [],
      orderBy: 'di.hora_ingreso DESC'
    }

    // 📅 filtro por fecha
    if (date && filtersMap.date[date]) {
      queryConfig.where?.push(filtersMap.date[date])
    }

    const rows = await searchGlobal(
      pool,
      queryConfig
    )

    res.json(rows)

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

/**
 * @swagger
 * /api/HistorialComputadores/propietario/{id_detallemaquina}:
 *   get:
 *     summary: Obtener el propietario (aprendiz) de un computador por su ID de detalle
 *     tags: [HistorialComputadores]
 *     parameters:
 *       - in: path
 *         name: id_detallemaquina
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del propietario y firma
 */
export const getPropietario = async (req: Request, res: Response) => {
  try {
    const { id_detallemaquina } = req.params
    console.log(id_detallemaquina)
    if (!id_detallemaquina) {
      return res.status(400).json({
        message: 'Debe enviar el ID del aprendiz'
      })
    }

    const query = `
      SELECT
        a.id_aprendiz AS id_propietario,
        a.nombre,
        a.apellido,
        COALESCE(p.nombre_programa, di.motivo_visita, 'Sin formación') AS formacion,
        TO_CHAR(di.hora_ingreso, 'HH12:MI AM') AS hora_ingreso,
        dm.firma_ingreso AS firma

      FROM detalles_maquinas dm

      JOIN detalles_ingreso di
        ON di.id_detallemaquina = dm.id_detallemaquina

      JOIN aprendiz a
        ON a.id_aprendiz = di.id_aprendiz

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

      LEFT JOIN formaciones f
        ON f.id_formacion = COALESCE(di.id_formacion, af_fallback.id_formacion)

      LEFT JOIN programa p
        ON p.id_programa = f.id_programa

      WHERE dm.id_detallemaquina = $1

      LIMIT 1
    `

    const result = await pool.query(query, [id_detallemaquina])
    console.log(result.rows)
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Propietario no encontrado'
      })
    }

    return res.json({
      result: result.rows[0]
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'Error al obtener propietario'
    })
  }
}
