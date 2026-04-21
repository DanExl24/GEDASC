import { PoolClient } from 'pg'

export const getMonthlyStats = async (client: PoolClient) => {
  const result = await client.query(`
    SELECT
      DATE_TRUNC('month', hora_ingreso) AS mes,
      COUNT(*) AS ingresos
    FROM detalles_ingreso
    GROUP BY mes
    ORDER BY mes DESC
  `)

  return result.rows
}

export const getActiveHours = async (client: PoolClient) => {
  const result = await client.query(`
    SELECT
      id_aprendiz,
      SUM(
        EXTRACT(EPOCH FROM (COALESCE(ds.hora_salida, NOW()) - di.hora_ingreso))
      ) / 3600 AS horas
    FROM detalles_ingreso di
    LEFT JOIN detalles_salida ds ON ds.id_ingreso = di.id_ingreso
    GROUP BY id_aprendiz
  `)

  return result.rows
}
