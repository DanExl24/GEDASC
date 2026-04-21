import { PoolClient } from 'pg'
import { buildQuery } from '../shared/baseQuery'
import { filtersMap } from '../shared/filtersMap'
import { QueryParam } from '../shared/baseQuery'

export type HistoryFilters = {
  date?: keyof typeof filtersMap.date
  program?: keyof typeof filtersMap.program
  search?: string
}

export const getHistory = async (client: PoolClient, filters: HistoryFilters) => {
  const conditions: string[] = []
  const values: QueryParam[] = []

  if (filters.date && filtersMap.date[filters.date]) {
    conditions.push(filtersMap.date[filters.date])
  }

  if (filters.program && filtersMap.program[filters.program]) {
    conditions.push(filtersMap.program[filters.program])
  }

  if (filters.search) {
    values.push(`%${filters.search}%`)
    const p = `$${values.length}`

    conditions.push(`
      (
        a.nombre ILIKE ${p} OR
        a.apellido ILIKE ${p} OR
        a.documento ILIKE ${p}
      )
    `)
  }

  const { text, values: queryParams  } = buildQuery({
    select: [
      'a.id_aprendiz',
      'a.nombre',
      'a.apellido',
      'a.documento',
      'f.nombre AS formacion',
      "TO_CHAR(di.hora_ingreso, 'DD Mon HH12:MI AM') AS hora_ingreso",
      "TO_CHAR(ds.hora_salida, 'DD Mon HH12:MI AM') AS hora_salida",
      'di.id_ingreso',
      'di.id_detallemaquina'
    ],
    from: 'detalles_ingreso di',
    joins: [
      'JOIN aprendiz a ON a.id_aprendiz = di.id_aprendiz',
      'LEFT JOIN detalles_salida ds ON ds.id_ingreso = di.id_ingreso',
      'JOIN formaciones f ON f.id_formacion = a.id_formacion'
    ],
    where: conditions,
    orderBy: 'di.hora_ingreso DESC',
    params : values
  })

  const result = await client.query(text, queryParams)
  return result.rows
}
