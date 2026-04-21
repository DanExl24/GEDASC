import { PoolClient } from 'pg'

export const getAlerts = async (client: PoolClient) => {
  const result = await client.query(`
    SELECT
      di.id_aprendiz,
      di.hora_ingreso,
      dm.id_computador,
      dm.id_vehiculo,
      dm.firma_ingreso
    FROM detalles_ingreso di
    JOIN detalles_maquinas dm
      ON dm.id_detallemaquina = di.id_detallemaquina
    WHERE dm.id_computador IS NULL
       OR dm.id_vehiculo IS NULL
    ORDER BY di.hora_ingreso DESC
  `)

  return result.rows
}
