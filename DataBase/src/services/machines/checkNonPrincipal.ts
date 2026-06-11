import type { PoolClient } from 'pg'
import { MaquinaDetalleUI } from '../../types/machineDetails'
import { filtersMap } from '../../utils/filtersMap'

type MachineType = 'pc' | 'vh' | 'all'

export const getNonPrincipalMachine = async (
  client: PoolClient,
  id_aprendiz?: string,
  dates?: (keyof typeof filtersMap.date)[],
  type?: MachineType // 👈 ahora es opcional
): Promise<MaquinaDetalleUI[]> => {

  const resolvedType: MachineType = type ?? 'all'

  const params: (string | number)[] = []
  const conditions: string[] = []

  // 📅 fechas
  const selectedDates: (keyof typeof filtersMap.date)[] =
    dates?.length ? dates : ['TODAY']

  const dateConditions = selectedDates
    .map(d => filtersMap.date[d])
    .filter(Boolean)

  if (dateConditions.length) {
    conditions.push(`(${dateConditions.join(' OR ')})`)
  }

  // 👤 aprendiz
  if (id_aprendiz) {
    params.push(id_aprendiz)
    conditions.push(`di.id_aprendiz = $${params.length}`)
  }

  // 🧠 filtro por tipo (solo si NO es all)
  if (resolvedType === 'pc') {
    conditions.push(`
      dm.id_computador IS NOT NULL
      AND ac.id_computador IS NOT NULL
    `)
  }

  if (resolvedType === 'vh') {
    conditions.push(`
      dm.id_vehiculo IS NOT NULL
      AND av.id_vehiculo IS NOT NULL
    `)
  }

  const where = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : ''

  const { rows } = await client.query(
    `
    SELECT
      di.id_aprendiz,
      dm.firma_ingreso,

      c.serial AS pc_serial,
      c.marca AS pc_marca,

      v.tipo_vehiculo,
      v.modelo AS vh_marca,
      v.placa AS vh_placa

    FROM detalles_ingreso di
    INNER JOIN detalles_maquinas dm
      ON dm.id_detallemaquina = di.id_detallemaquina

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

    ${where}

    ${
      resolvedType === 'all'
        ? `
        AND (
          (dm.id_computador IS NOT NULL AND ac.id_computador IS NOT NULL)
          OR
          (dm.id_vehiculo IS NOT NULL AND av.id_vehiculo IS NOT NULL)
        )
      `
        : ''
    }
    `,
    params
  )

  return rows.map(row => ({
    pc: row.pc_serial
      ? { serial: row.pc_serial, marca: row.pc_marca }
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
      actual: { id: row.id_aprendiz },
      owner: { id: null, name: null }
    }
  }))
}
