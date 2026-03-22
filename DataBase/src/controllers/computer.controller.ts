import { Request, Response } from 'express'
import { pool } from '../config/db'
import { filtersComputadoresMap } from '../composables/filterComputer'
import { filtersMap } from '../composables/filtersMap'

// 🔥 Historial computadores con filtros dinámicos
export const getHistorialComputadores = async (req: Request, res: Response) => {
  try {
    const { date, type, value } = req.query as {
      date?: keyof typeof filtersMap.date
      type?: keyof typeof filtersComputadoresMap.type
      value?: string
    }
    console.log(type)
    console.log(value)
    console.log(typeof value)
    const conditions: string[] = []
    const values: string[] = []

    // 📅 Filtro por fecha
    if (date && filtersMap.date[date]) {
      conditions.push(filtersMap.date[date])
    }

    // 🔍 Filtro dinámico (ID o SERIAL)
    if (type && value && filtersComputadoresMap.type[type]) {

      if (type === 'APRENDIZ') {
        values.push(`%${value.trim()}%`)
        conditions.push(`a.documento ILIKE $${values.length}`)
      }

      if (type === 'SERIAL') {
        values.push(`%${value}%`)
        conditions.push(`c.serial ILIKE $${values.length}`)
      }
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : ''

      const query = `
        SELECT
          dm.id_detallemaquina,
          dm.id_computador,
          c.modelo AS marca,
          c.serial,
          a.documento,
          a.id_aprendiz,
          dm.firma_ingreso,
          TO_CHAR(di.hora_ingreso, 'DD Mon HH12:MI AM') AS hora_ingreso,
          TO_CHAR(ds.hora_salida, 'DD Mon HH12:MI AM') AS hora_salida

        FROM detalles_maquinas AS dm

        JOIN detalles_ingreso AS di
          ON di.id_detallemaquina = dm.id_detallemaquina

        LEFT JOIN detalles_salida AS ds
          ON ds.id_ingreso = di.id_ingreso

        JOIN computadores c
          ON c.id_computador = dm.id_computador

        JOIN aprendiz a
          ON a.id_aprendiz = di.id_aprendiz

        ${whereClause}

        ORDER BY di.hora_ingreso DESC
      `

    const result = await pool.query(query, values)

    res.json(result.rows)

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

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
        f.nombre AS formacion,
        dm.firma_ingreso AS firma

      FROM detalles_maquinas dm

      JOIN detalles_ingreso di
        ON di.id_detallemaquina = dm.id_detallemaquina

      JOIN aprendiz a
        ON a.id_aprendiz = di.id_aprendiz

      JOIN formaciones f
        ON f.id_formacion = a.id_formacion

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
