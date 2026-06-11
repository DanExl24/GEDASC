import type { PoolClient } from 'pg'
export const checkDuplicate = async (client : PoolClient, placa : string) : Promise<boolean> => {

  const result = await client.query(
    `SELECT 1
      FROM detalles_maquinas dm
      JOIN detalles_ingreso di ON di.id_detallemaquina = dm.id_detallemaquina
      LEFT JOIN computadores c ON dm.id_computador = c.id_computador
      LEFT JOIN vehiculos v ON dm.id_vehiculo = v.id_vehiculo
      WHERE
        ((c.serial = $1) OR (v.placa = $1))
      AND di.hora_ingreso >= CURRENT_DATE
      AND di.hora_ingreso < CURRENT_DATE + INTERVAL '1 day'
      LIMIT 1`,
    [placa]
  )
  return (result.rowCount ?? 0) > 0
}
