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

    // 1️⃣ Buscar la sesión activa del aprendiz (ingreso sin salida)
    const activeSession = await pool.query(`
      SELECT di.id_ingreso
      FROM detalles_ingreso di
      LEFT JOIN detalles_salida ds ON ds.id_ingreso = di.id_ingreso
      WHERE di.id_aprendiz = $1 AND ds.hora_salida IS NULL
      ORDER BY di.hora_ingreso DESC
      LIMIT 1
    `, [id_aprendiz]);

    if (activeSession.rowCount === 0) {
      return res.status(400).json({ message: "No tiene un ingreso activo para registrar salida" });
    }

    const id_ingreso = activeSession.rows[0].id_ingreso;

    // 2️⃣ Registrar salida
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
        a.es_monitor,
        COALESCE(f.nombre, di.motivo_visita, 'Sin formación') AS formacion,
        TO_CHAR(di.hora_ingreso, 'HH12:MI AM') AS hora_ingreso,
        TO_CHAR(ds.hora_salida, 'HH12:MI AM') AS hora_salida,
        di.id_detallemaquina,
        di.tipo_sesion,
        di.motivo_reingreso,
        (SELECT COUNT(*) FROM aprendiz_formacion apf WHERE apf.id_aprendiz = a.id_aprendiz AND apf.estado = 'activo') AS total_formaciones,
        ROW_NUMBER() OVER (PARTITION BY di.id_aprendiz, di.hora_ingreso::date ORDER BY di.id_ingreso ASC) AS numero_sesion

      FROM detalles_salida AS ds

      JOIN detalles_ingreso AS di
        ON di.id_ingreso = ds.id_ingreso

      JOIN aprendiz AS a
        ON a.id_aprendiz = di.id_aprendiz

      LEFT JOIN formaciones AS f
        ON f.id_formacion = di.id_formacion

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
        a.es_monitor,
        COALESCE(p.nombre_programa, di.motivo_visita, 'Sin formación') AS formacion,
        p.nombre_programa,
        f.id_formacion AS id_formacion,
        di.motivo_visita,
        TO_CHAR(di.hora_ingreso, 'HH12:MI AM') AS hora_ingreso,
        TO_CHAR(ds.hora_salida, 'HH12:MI AM') AS hora_salida,
        di.id_detallemaquina,
        di.tipo_sesion,
        di.motivo_reingreso,
        (SELECT COUNT(*) FROM aprendiz_formacion apf WHERE apf.id_aprendiz = a.id_aprendiz AND apf.estado = 'activo') AS total_formaciones,
        ROW_NUMBER() OVER (PARTITION BY di.id_aprendiz, di.hora_ingreso::date ORDER BY di.id_ingreso ASC) AS numero_sesion

      FROM detalles_salida AS ds

      JOIN detalles_ingreso AS di
      ON di.id_ingreso = ds.id_ingreso

      JOIN aprendiz AS a
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

      LEFT JOIN formaciones AS f
      ON f.id_formacion = COALESCE(di.id_formacion, af_fallback.id_formacion)

      LEFT JOIN programa AS p
      ON p.id_programa = f.id_programa

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

// Nueva función: Registrar retiro de equipo con firma de salida
export const retirarEquipo = async (req: Request, res: Response) => {
  const client = await pool.connect()
  try {
    const { id_detallemaquina } = req.params
    const { firma_salida } = req.body

    if (!id_detallemaquina || !firma_salida) {
      return res.status(400).json({ message: "ID de detalle y firma son obligatorios" })
    }

    // Verificar que el equipo existe y está "dentro"
    const equipo = await client.query(
      `SELECT id_detallemaquina, estado_equipo
       FROM detalles_maquinas
       WHERE id_detallemaquina = $1`,
      [id_detallemaquina]
    )

    if (equipo.rowCount === 0) {
      return res.status(404).json({ message: "Equipo no encontrado" })
    }

    if (equipo.rows[0].estado_equipo === 'retirado') {
      return res.status(409).json({ message: "El equipo ya fue retirado" })
    }

    // Registrar firma de salida y cambiar estado
    await client.query(
      `UPDATE detalles_maquinas
       SET firma_salida = $1,
           estado_equipo = 'retirado',
           hora_retiro_equipo = NOW()
       WHERE id_detallemaquina = $2`,
      [firma_salida, id_detallemaquina]
    )

    return res.status(200).json({
      message: "Equipo retirado correctamente",
      id_detallemaquina
    })

  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Error al retirar equipo" })
  } finally {
    client.release()
  }
}


