// Controlador para consultar id del aprendiz
import { Request, Response } from 'express'
import { pool } from '../config/db'
import { filtersMap } from '../composables/filtersMap';

// Funcion para el ingreso de aprendiz
export const HistoryRecord = async (request: Request, response: Response) => {
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
    FROM detalles_ingreso AS di
    JOIN aprendiz AS a ON a.id_aprendiz = di.id_aprendiz
    LEFT JOIN detalles_salida ds ON ds.id_ingreso = di.id_ingreso
    JOIN formaciones f ON f.id_formacion = a.id_formacion
    WHERE di.hora_ingreso >= CURRENT_DATE
    AND di.hora_ingreso < CURRENT_DATE + INTERVAL '1 day'
    ORDER BY di.hora_ingreso DESC
    `);

    if (result.rowCount === 0) {
      console.log(result.rows)
      return response.status(404).json({
        message: "No se encontraron registros hoy"
      });
    }
    console.log(result.rows)
    return response.status(200).json(result.rows);

  } catch (error) {

    console.error(error);

    return response.status(500).json({
      message: "Hay un error en el servidor",
      error
    });
  }
};

// Historial con filtro
export const DateRecord = async (request: Request, response: Response) => {
  try {
    const { date, program,search } = request.query as {
      date?: keyof typeof filtersMap.date
      program?: keyof typeof filtersMap.program
      search? : string
    }

    const conditions: string[] = []

    if (date && filtersMap.date[date]) {
      conditions.push(filtersMap.date[date])
    }

    if (program && filtersMap.program[program]) {
      conditions.push(filtersMap.program[program])
    }

    const values: string[] = []

    if (search) {
      values.push(`%${search}%`)
      conditions.push(`
        (
          a.nombre ILIKE $${values.length} OR
          a.apellido ILIKE $${values.length} OR
          a.documento ILIKE $${values.length}
        )
      `)
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : ''

    const result = await pool.query(`
      SELECT
        a.id_aprendiz,
        a.nombre,
        a.apellido,
        a.documento,
        f.nombre AS formacion,
        TO_CHAR(di.hora_ingreso, 'DD Mon HH12:MI AM') AS hora_ingreso,
        TO_CHAR(ds.hora_salida, 'DD Mon HH12:MI AM') AS hora_salida,
        di.id_detallemaquina,
        di.id_ingreso
      FROM detalles_ingreso AS di
      JOIN aprendiz AS a ON a.id_aprendiz = di.id_aprendiz
      LEFT JOIN detalles_salida ds ON ds.id_ingreso = di.id_ingreso
      JOIN formaciones f ON f.id_formacion = a.id_formacion
      ${whereClause}
      ORDER BY di.hora_ingreso DESC
    `,values)

    response.json(result.rows)

  } catch (error) {
    console.error(error)
    response.status(500).json({ message: 'Error en el servidor' })
  }
}


// Funcion para consultar los datos de las maquinas del aprendiz

export const SearchMachine = async (request: Request, response: Response) => {

  const { id_detallemaquina } = request.params
  console.log(id_detallemaquina)
  if (!id_detallemaquina) {
    return response.status(400).json({
      message: "Debe enviar el id del detalle de máquina"
    })
  }

  try {

    const query = `
      SELECT
        c.modelo AS pc_modelo,
        c.serial AS pc_serial,

        v.tipo_vehiculo,
        v.modelo AS vh_modelo,
        v.placa AS vh_placa,

        dm.firma_ingreso

      FROM detalles_maquinas dm

      JOIN detalles_ingreso AS di ON di.id_detallemaquina = dm.id_detallemaquina

      LEFT JOIN computadores c
        ON dm.id_computador = c.id_computador

      LEFT JOIN vehiculos v
        ON dm.id_vehiculo = v.id_vehiculo

      WHERE dm.id_detallemaquina = $1
    `

    const result = await pool.query(query, [id_detallemaquina])

    if (result.rows.length === 0) {
      return response.status(404).json({
        message: "No se encontró ese detalle de máquina"
      })
    }

    const data = result.rows[0]

    const maquinas = {
      pc: data.pc_modelo ? {
        modelo: data.pc_modelo,
        placa_serial: data.pc_serial,
      } : null,

      vh: data.vh_modelo ? {
        tipo_vehiculo: data.tipo_vehiculo,
        modelo: data.vh_modelo,
        placa_serial: data.vh_placa,
      } : null,

      firma: data.firma_ingreso
    }

    return response.status(200).json({
      result: maquinas
    })

  } catch (error) {

    console.error(error)

    return response.status(500).json({
      message: "Error al buscar las máquinas",
      error
    })

  }
}
