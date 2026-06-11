// Controlador para consultar id del aprendiz
import { Request, Response } from 'express'
import { pool } from '../config/db'

// Funcion para el ingreso de aprendiz
/**
 * @swagger
 * /api/registroSalidas/addExit/{documento}:
 *   post:
 *     summary: Registrar la salida de un aprendiz
 *     tags: [RegistroSalidas]
 *     parameters:
 *       - in: path
 *         name: documento
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Salida registrada exitosamente
 */
export const addExit = async (req: Request, res: Response) => {
  try {
    const documento = req.params.documento;

    if (!documento) {
      return res.status(400).json({ message: "Datos inválidos" });
    }

    // Buscar aprendiz
    const aprendizRecord = await pool.query(
      'SELECT id_aprendiz FROM aprendiz WHERE documento = $1',
      [documento]
    );

    if (aprendizRecord.rowCount === 0) {
      return res.status(404).json({ message: "Aprendiz no encontrado" });
    }

    const id_aprendiz = aprendizRecord.rows[0].id_aprendiz;

    // Validar si ya tiene salida hoy
    const salidaRecord = await pool.query(`
      SELECT ds.id_salida
      FROM detalles_salida ds
      JOIN detalles_ingreso di ON di.id_ingreso = ds.id_ingreso
      WHERE di.id_aprendiz = $1
      AND ds.hora_salida >= CURRENT_DATE
      AND ds.hora_salida < CURRENT_DATE + INTERVAL '1 day'
    `, [id_aprendiz]);

    if (salidaRecord.rowCount && salidaRecord.rowCount > 0) {
      return res.status(409).json({ message: "Ya registró salida hoy" });
    }

    // Buscar ingreso del día
    const ingresoHoy = await pool.query(`
      SELECT id_ingreso
      FROM detalles_ingreso
      WHERE id_aprendiz = $1
      AND hora_ingreso >= CURRENT_DATE
      AND hora_ingreso < CURRENT_DATE + INTERVAL '1 day'
    `, [id_aprendiz]);

    if (ingresoHoy.rowCount === 0) {
      return res.status(400).json({ message: "No tiene ingreso registrado hoy" });
    }

    const id_ingreso = ingresoHoy.rows[0].id_ingreso;

    // Insertar salida
    const result = await pool.query(
      'INSERT INTO detalles_salida (id_ingreso) VALUES ($1) RETURNING *',
      [id_ingreso]
    );

    // mandar resultados
    return res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno" });
  }
};


// Funcion para la busqueda de un aprendiz
/**
 * @swagger
 * /api/registroSalidas/buscar:
 *   get:
 *     summary: Buscar aprendiz en historial de salidas por nombre o documento
 *     tags: [RegistroSalidas]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resultados de la búsqueda
 */
export const SearchAprendiz = async (request: Request, response: Response) => {
  try {

    const text = (request.query.q as string)?.trim()

    if (!text) {
      return response.status(400).json({
        message: "Debe escribir algo"
      })
    }

    const pattern = `%${text}%`

    const result = await pool.query(`
      SELECT
        a.id_aprendiz,
        a.nombre,
        a.apellido,
        a.documento,
        f.nombre AS formacion,
        TO_CHAR(di.hora_ingreso, 'HH12:MI AM') AS hora_ingreso,
        TO_CHAR(ds.hora_salida, 'HH12:MI AM') AS hora_salida,
        di.id_detallemaquina

      FROM detalles_salida AS ds

      JOIN detalles_ingreso AS di
        ON di.id_ingreso = ds.id_ingreso

      JOIN aprendiz AS a
        ON a.id_aprendiz = di.id_aprendiz

      JOIN formaciones AS f
        ON f.id_formacion = a.id_formacion

      LEFT JOIN detalles_maquinas AS dm
        ON dm.id_detallemaquina = di.id_detallemaquina

      WHERE
        (
          a.documento ILIKE $1
          OR a.nombre ILIKE $1
          OR a.apellido ILIKE $1
        )
        AND ds.hora_salida >= CURRENT_DATE
        AND ds.hora_salida < CURRENT_DATE + INTERVAL '1 day'

      ORDER BY ds.id_salida DESC
    `, [pattern])

    console.log("Busqueda en salidas:", text)

    return response.status(200).json(result.rows)

  } catch (error) {

    console.error(error)

    return response.status(500).json({
      message: "Error en la busqueda"
    })
  }
}

// Funcion para verificar el ingreso de un aprendiz
/**
 * @swagger
 * /api/registroSalidas/verificarSalida/{documento}:
 *   get:
 *     summary: Verificar si un aprendiz ya registró salida hoy
 *     tags: [RegistroSalidas]
 *     parameters:
 *       - in: path
 *         name: documento
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estado de la salida
 */
export const DetectExit = async (request: Request, response: Response) => {
  try {

    const { documento } = request.params

    // 1. VERIFICAR SI EXISTE EL APRENDIZ
    const aprendizExiste = await pool.query(
      `SELECT id_aprendiz FROM aprendiz WHERE documento = $1`,
      [documento]
    )

    if (aprendizExiste.rowCount === 0) {
      return response.status(404).json({
        message: "El aprendiz no existe"
      })
    }

    // 2. VERIFICAR SI YA REGISTRÓ SALIDA HOY
    const salidaVerificada = await pool.query(`
      SELECT ds.id_salida
      FROM detalles_salida ds
      JOIN detalles_ingreso di ON di.id_ingreso = ds.id_ingreso
      JOIN aprendiz a ON a.id_aprendiz = di.id_aprendiz
      WHERE a.documento = $1
      AND ds.hora_salida >= CURRENT_DATE
      AND ds.hora_salida < CURRENT_DATE + INTERVAL '1 day'
    `, [documento])

    if (salidaVerificada.rowCount && salidaVerificada.rowCount > 0) {
      return response.status(200).json({
        message: "El aprendiz ya registró salida hoy",
        yaSalio: true
      })
    }

    return response.status(200).json({
      message: "El aprendiz no ha registrado salida hoy",
      yaSalio: false
    })

  } catch (error) {

    console.error(error)

    return response.status(500).json({
      message: "Hay un error",
      error: error
    })
  }
}



// Funcion para el historial de salidas
/**
 * @swagger
 * /api/registroSalidas/historial:
 *   get:
 *     summary: Obtener historial de salidas de hoy
 *     tags: [RegistroSalidas]
 *     responses:
 *       200:
 *         description: Lista de salidas hoy
 */
export const ExitRecord = async (request: Request, response: Response) => {
  try {

    const result = await pool.query(`
      SELECT
        a.id_aprendiz,
        a.nombre,
        a.apellido,
        a.documento,
        f.nombre AS formacion,
        TO_CHAR(di.hora_ingreso, 'HH12:MI AM') AS hora_ingreso,
        TO_CHAR(ds.hora_salida, 'HH12:MI AM') AS hora_salida,
        di.id_detallemaquina

      FROM detalles_salida AS ds



      JOIN detalles_ingreso AS di
      ON di.id_ingreso = ds.id_ingreso

      JOIN aprendiz AS a
      ON a.id_aprendiz = di.id_aprendiz

      JOIN formaciones AS f
      ON f.id_formacion = a.id_formacion

      LEFT JOIN detalles_maquinas AS dm
      ON dm.id_detallemaquina = di.id_detallemaquina

      WHERE ds.hora_salida >= CURRENT_DATE
      AND ds.hora_salida < CURRENT_DATE + INTERVAL '1 day'

      ORDER BY ds.id_salida DESC
    `);

    if (result.rowCount === 0) {
      return response.status(404).json({
        message: "No se encontraron registros hoy"
      });
    }

    return response.status(200).json(result.rows);

  } catch (error) {

    console.error(error);

    return response.status(500).json({
      message: "Hay un error en el servidor",
      error
    });
  }
};

