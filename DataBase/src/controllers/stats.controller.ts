// Controlador para consultar id del aprendiz
import { Request, Response } from 'express'
import { pool } from '../config/db'
import { filtersMap } from '../shared/filtersMap';

// Funcion para el historial de ingresos
export const StatsRecord = async (request: Request, response: Response) => {
  try{

    const entradasHoy = await pool.query(`SELECT COUNT(*) AS total FROM detalles_ingreso AS di WHERE ${filtersMap.date['TODAY']}`)
    const salidasHoy = await pool.query(`SELECT COUNT(*) AS total FROM detalles_salida AS ds WHERE ds.hora_salida >= CURRENT_DATE AND ds.hora_salida < CURRENT_DATE + INTERVAL '1 day'`)
    const esteMes = await pool.query(`SELECT COUNT(*) AS total FROM detalles_ingreso AS di WHERE ${filtersMap.date['THIS_MONTH']}`)
    const trimestre = await pool.query(`SELECT COUNT(*) AS total FROM detalles_ingreso AS di WHERE ${filtersMap.date['THIS_QUARTER']}`)

    response.status(200).json({
      entradasHoy : Number(entradasHoy.rows[0].total),
      salidasHoy : Number(salidasHoy.rows[0].total),
      esteMes : Number(esteMes.rows[0].total),
      trimestre : Number(trimestre.rows[0].total),
    });
  } catch(error) {
    console.log(error)
  }
};

export const TodayActivity = async (request: Request, response: Response) => {
  try{
    const result = await pool.query(`SELECT
      a.nombre,
      FLOOR(EXTRACT(EPOCH FROM (NOW() - di.hora_ingreso)) / 60) AS tiempo,
      'entrada' AS tipo,
      TO_CHAR(di.hora_ingreso, 'HH12:MI AM') AS hora,
      di.hora_ingreso AS fecha,
      a.documento AS documento,
      f.nombre AS formacion
    FROM detalles_ingreso di
    JOIN aprendiz a ON a.id_aprendiz = di.id_aprendiz
    JOIN formaciones f ON f.id_formacion = a.id_formacion
    WHERE ${filtersMap.date.TODAY}

    UNION ALL

    SELECT
      a.nombre,
      FLOOR(EXTRACT(EPOCH FROM (NOW() - ds.hora_salida)) / 60) AS tiempo,
      'salida' AS tipo,
      TO_CHAR(ds.hora_salida, 'HH12:MI AM') AS hora,
      ds.hora_salida AS fecha,
      a.documento AS documento,
      f.nombre AS formacion
    FROM detalles_salida ds
    JOIN detalles_ingreso AS di ON di.id_ingreso = ds.id_ingreso
    JOIN aprendiz a ON a.id_aprendiz = di.id_aprendiz
    JOIN formaciones f ON f.id_formacion = a.id_formacion
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

    response.status(200).json({ aprendices })
  } catch(error) {
    console.log(error)
  }
};
