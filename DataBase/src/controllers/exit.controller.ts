// Controlador para consultar id del aprendiz
import { Request, Response } from 'express'
import { pool } from '../config/db'

// Funcion para el ingreso de aprendiz
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
export const DetectExit = async (request: Request, response: Response) => {
  try {

    const { documento } = request.params

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
export const ExitRecord = async (request: Request, response: Response) => {
  try {

    const result = await pool.query(`
      SELECT
        a.id_aprendiz,
        a.nombre,
        a.apellido,
        a.documento,
        f.nombre AS formacion,
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



// 🔍 DETALLE DE SALIDA (MULTI-MAQUINA)
export const ExitDetail = async (req: Request, res: Response) => {
  try {

    const { id_aprendiz } = req.params

    if (!id_aprendiz) {
      return res.status(400).json({
        message: "ID de aprendiz requerido"
      })
    }

    const result = await pool.query(`
      SELECT
        TO_CHAR(ds.hora_salida, 'YYYY-MM-DD') AS fecha,
        TO_CHAR(ds.hora_salida, 'HH12:MI AM') AS hora,

        dm.tipo_maquina,
        dm.tipo_vehiculo,
        dm.modelo,
        dm.placa_serial,
        dm.firma

      FROM detalles_salida ds

      JOIN detalles_ingreso di
        ON di.id_ingreso = ds.id_ingreso

      LEFT JOIN detalles_maquinas dm
        ON dm.id_detallemaquina = di.id_detallemaquina

      WHERE di.id_aprendiz = $1

      ORDER BY ds.hora_salida DESC
    `, [id_aprendiz])

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "No se encontró detalle de salida"
      })
    }

    // 🧠 Tomamos la última salida
    const ultimaFecha = result.rows[0].fecha
    const ultimaHora = result.rows[0].hora

    // 🔥 Filtrar solo registros de esa salida (por seguridad)
    const rows = result.rows.filter(r => r.fecha === ultimaFecha && r.hora === ultimaHora)

    const detalle = {
      fecha: ultimaFecha,
      hora: ultimaHora,
      pc: null as {
        modelo: string
        placa_serial: string
      } | null,
      vh: null as {
        tipo_vehiculo: string
        modelo: string
        placa_serial: string
      } | null,
      firma: null as string | null
    }

    // 🔁 recorrer TODAS las máquinas
    for (const row of rows) {

      if (row.tipo_maquina === 'pc') {
        detalle.pc = {
          modelo: row.modelo,
          placa_serial: row.placa_serial
        }
      }

      if (row.tipo_maquina === 'vh') {
        detalle.vh = {
          tipo_vehiculo: row.tipo_vehiculo,
          modelo: row.modelo,
          placa_serial: row.placa_serial
        }
      }

      // Guardar firma (puede venir en cualquiera)
      if (row.firma) {
        detalle.firma = row.firma
      }
    }

    return res.status(200).json({
      result: detalle
    })

  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: "Error al obtener detalle de salida",
      error
    })
  }
}
