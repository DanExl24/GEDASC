import type { PoolClient } from 'pg'

export type NonPrincipalMachineDTO = {
  pc: {
    serial: string
    marca: string
  } | null

  vh: {
    tipo_vehiculo: string
    marca: string
    placa: string
  } | null

  firma: string | null

  aprendices: {
    actual: {
      id: string
    }
    owner: {
      id: string | null
      name: string | null
    }
  }
}

export const getTodayNonPrincipal = async (
  client: PoolClient,
  id_aprendiz?: string
): Promise<NonPrincipalMachineDTO[]> => {

  const params: (string | number)[] = []

  let where = `
    di.hora_ingreso >= CURRENT_DATE
    AND di.hora_ingreso < CURRENT_DATE + INTERVAL '1 day'
  `

  if (id_aprendiz) {
    params.push(id_aprendiz)
    where += ` AND di.id_aprendiz = $${params.length}`
  }

  const { rows } = await client.query(
    `
    SELECT
      di.id_aprendiz,
      dm.firma_ingreso,

      -- PC NO PRINCIPAL
      c.serial AS pc_serial,
      c.marca AS pc_marca,

      -- VEHÍCULO NO PRINCIPAL
      v.tipo_vehiculo,
      v.modelo AS vh_marca,
      v.placa AS vh_placa

    FROM detalles_ingreso di
    INNER JOIN detalles_maquinas dm
      ON dm.id_detallemaquina = di.id_detallemaquina

    -- SOLO NO PRINCIPALES
    LEFT JOIN aprendiz_computador ac
      ON ac.id_aprendiz = di.id_aprendiz
      AND ac.principal = false
      AND ac.id_computador = dm.id_computador

    LEFT JOIN computadores c
      ON c.id_computador = ac.id_computador

    LEFT JOIN aprendiz_vehiculo av
      ON av.id_aprendiz = di.id_aprendiz
      AND av.principal = false
      AND av.id_vehiculo = dm.id_vehiculo

    LEFT JOIN vehiculos v
      ON v.id_vehiculo = av.id_vehiculo

    WHERE ${where}
      AND (
        (dm.id_computador IS NOT NULL AND ac.id_computador IS NOT NULL)
        OR
        (dm.id_vehiculo IS NOT NULL AND av.id_vehiculo IS NOT NULL)
      )
    `,
    params
  )
  return rows.map(row => ({
    pc: row.pc_serial
      ? {
          serial: row.pc_serial,
          marca: row.pc_marca
        }
      : null,

    vh: row.tipo_vehiculo
      ? {
          tipo_vehiculo: row.tipo_vehiculo,
          marca: row.vh_marca,
          placa: row.vh_placa
        }
      : null,

    firma: row.firma_ingreso ?? null,

    aprendices: {
      actual: {
        id: row.id_aprendiz
      },
      owner: {
        id: null,
        name: null
      }
    }
  }))
}
