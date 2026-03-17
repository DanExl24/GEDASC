// Controlador para consultar id del aprendiz
import { Request, Response } from 'express'
import { pool } from '../config/db'

// Funcion para el ingreso de aprendiz
export const HistoryRecord = async (request: Request, response: Response) => {
  try {

    const result = await pool.query(`
    SELECT
      a.nombre,
      a.apellido,
      a.documento,
      f.nombre AS formacion,
      TO_CHAR(di.hora_ingreso, 'HH12:MI AM') AS hora_ingreso,
      TO_CHAR(ds.hora_salida, 'HH12:MI AM') AS hora_salida,
      di.id_detallemaquina,
      a.id_aprendiz
    FROM aprendiz a
    LEFT JOIN detalles_ingreso di ON di.id_aprendiz = a.id_aprendiz
    LEFT JOIN detalles_salida ds ON ds.id_ingreso = di.id_ingreso
    JOIN formaciones f ON f.id_formacion = a.id_formacion
    ORDER BY di.hora_ingreso DESC;
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

// Historial con filtro por fechas
export const DateRecord = async (request: Request, response: Response) => {
  try {

    const { inicio, fin } = request.query as {
      inicio?: string
      fin?: string
    }

    // 🧠 Validación básica
    if (inicio && fin && inicio > fin) {
      return response.status(400).json({
        message: "La fecha inicio no puede ser mayor a la fecha fin"
      })
    }

    let query = `
      SELECT
        a.nombre,
        a.apellido,
        a.documento,
        f.nombre AS formacion,
        di.hora_ingreso,
        ds.hora_salida,
        di.id_detallemaquina,
        a.id_aprendiz
      FROM aprendiz a
      LEFT JOIN detalles_ingreso di ON di.id_aprendiz = a.id_aprendiz
      LEFT JOIN detalles_salida ds ON ds.id_ingreso = di.id_ingreso
      JOIN formaciones f ON f.id_formacion = a.id_formacion
    `

    const values: string[] = []

    // 🔥 Filtro por rango de fechas (nivel pro)
    if (inicio && fin) {
      query += `
        WHERE di.hora_ingreso >= $1
        AND di.hora_ingreso < $2::date + INTERVAL '1 day'
      `
      values.push(inicio, fin)
    }

    query += ` ORDER BY di.hora_ingreso DESC`

    const result = await pool.query(query, values)

    if (result.rowCount === 0) {
      return response.status(404).json({
        message: "No se encontraron registros en ese rango"
      })
    }

    return response.status(200).json(result.rows)

  } catch (error) {
    console.error(error)

    return response.status(500).json({
      message: "Error en el servidor",
      error
    })
  }
}
