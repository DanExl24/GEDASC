import type { PoolClient } from 'pg'
import type { PcRow } from '../../types/BorrowComputer.types'
import type { VehicleRow } from '../../types/BorrowVehicle.types'
import type { TodayBorrowRow } from '../../types/BorrowToday'
import { MaquinaDetalleUI } from '../../types/machineDetails'
/* =========================
   MAPPERS
========================= */

const mapPc = (row: PcRow) => ({
  aprendiz: row.id_aprendiz,
  principal: {
    id: row.principalPC,
    serial: row.principalSerial,
    marca: row.principalMarca
  },
  prestado: {
    id: row.prestadoPC,
    serial: row.prestadoSerial,
    marca: row.prestadoMarca
  }
})

const mapVehicle = (row: VehicleRow) => ({
  aprendiz: row.id_aprendiz,
  principal: {
    id: row.principalVehiculo,
    placa: row.principalPlaca,
    tipo: row.principalTipo,
    modelo: row.principalModelo
  },
  prestado: {
    id: row.prestadoVehiculo,
    placa: row.prestadoPlaca,
    tipo: row.prestadoTipo,
    modelo: row.prestadoModelo
  }
})

const mapToDTO = (row: TodayBorrowRow): MaquinaDetalleUI => {
  const pc = row.id_computador
    ? {
        serial: row.prestadoSerial,
        marca: row.prestadoMarca
      }
    : row.pc_principal
      ? {
          serial: row.principalSerial,
          marca: row.principalMarca
        }
      : null

  const vh = row.id_vehiculo
    ? {
        tipo_vehiculo: row.prestadoTipo,
        marca: row.prestadoModelo,
        placa: row.prestadoPlaca
      }
    : row.vehiculo_principal
      ? {
          tipo_vehiculo: row.principalTipo,
          marca: row.principalModelo,
          placa: row.principalPlaca
        }
      : null

  return {
    pc,
    vh,
    firma: row.firma_ingreso,
    estado: row.id_computador || row.id_vehiculo ? 'PRESTADA' : 'NORMAL',
    aprendices: {
      actual: {
        id: row.id_aprendiz
      },
      owner: {
        id: row.ownerId,
        name: row.ownerName
      }
    }
  }
}

/* =========================
   QUERIES
========================= */

export const getGlobalBorrowedComputers = async (client: PoolClient) => {
  const { rows } = await client.query<PcRow>(`
    SELECT
      di.id_aprendiz,
      ac.id_computador AS principalPC,
      c1.serial AS principalSerial,
      c1.marca AS principalMarca,
      c2.serial AS prestadoSerial,
      c2.marca AS prestadoMarca,
      dm.id_computador AS prestadoPC,
      dm.firma_ingreso AS firma_ingreso
    FROM detalles_maquinas AS dm
    INNER JOIN computadores AS c2
      ON c2.id_computador = dm.id_computador
    INNER JOIN detalles_ingreso AS di
      ON di.id_ingreso = dm.id_ingreso
    INNER JOIN aprendiz_computador AS ac
      ON ac.id_aprendiz = di.id_aprendiz
      AND ac.principal = true
    INNER JOIN computadores AS c1
      ON c1.id_computador = ac.id_computador
    WHERE ac.id_computador != dm.id_computador
  `)

  return rows.map(mapPc)
}

export const getGlobalBorrowedVehicles = async (client: PoolClient) => {
  const { rows } = await client.query<VehicleRow>(`
    SELECT
      di.id_aprendiz,

      av.id_vehiculo AS principalVehiculo,
      v1.placa AS principalPlaca,
      v1.tipo_vehiculo AS principalTipo,
      v1.modelo AS principalModelo,

      dm.id_vehiculo AS prestadoVehiculo,
      v2.placa AS prestadoPlaca,
      v2.tipo_vehiculo AS prestadoTipo,
      v2.modelo AS prestadoModelo

    FROM detalles_maquinas AS dm
    INNER JOIN detalles_ingreso AS di
      ON di.id_ingreso = dm.id_ingreso

    INNER JOIN aprendiz_vehiculo AS av
      ON av.id_aprendiz = di.id_aprendiz
      AND av.principal = true

    INNER JOIN vehiculos AS v1
      ON v1.id_vehiculo = av.id_vehiculo

    INNER JOIN vehiculos AS v2
      ON v2.id_vehiculo = dm.id_vehiculo

    WHERE av.id_vehiculo != dm.id_vehiculo
  `)

  return rows.map(mapVehicle)
}

/* =========================
   TODAY BORROWED (REFINADO)
========================= */

export const getTodayBorrowed = async (
  client: PoolClient,
  id_aprendiz?: string
) => {
  const params: (string | number | Date)[] = []

  let where = `
    di.hora_ingreso >= CURRENT_DATE
    AND di.hora_ingreso < CURRENT_DATE + INTERVAL '1 day'
  `

  if (id_aprendiz) {
    params.push(id_aprendiz)
    where += ` AND di.id_aprendiz = $${params.length}`
  }

  const { rows } = await client.query<TodayBorrowRow>(
    `
    SELECT
      di.id_aprendiz,
      COALESCE(aopc.id_aprendiz, aov.id_aprendiz) AS "ownerId",
      COALESCE(aopc.nombre, aov.nombre) AS "ownerName",
      dm.firma_ingreso AS "firma_ingreso",

      dm.id_computador,
      c2.serial AS "prestadoSerial",
      c2.marca AS "prestadoMarca",

      ac.id_computador AS "pc_principal",
      c1.serial AS "principalSerial",
      c1.marca AS "principalMarca",

      dm.id_vehiculo,
      v2.placa AS "prestadoPlaca",
      v2.tipo_vehiculo AS "prestadoTipo",
      v2.modelo AS "prestadoModelo",

      av.id_vehiculo AS "vehiculo_principal",
      v1.placa AS "principalPlaca",
      v1.tipo_vehiculo AS "principalTipo",
      v1.modelo AS "principalModelo"

    FROM detalles_maquinas dm
    INNER JOIN detalles_ingreso AS di
      ON di.id_detallemaquina = dm.id_detallemaquina

    LEFT JOIN aprendiz_computador ac
      ON ac.id_aprendiz = di.id_aprendiz
      AND ac.principal = true

    LEFT JOIN computadores c1
      ON c1.id_computador = ac.id_computador

    LEFT JOIN computadores c2
      ON c2.id_computador = dm.id_computador

    LEFT JOIN aprendiz_vehiculo av
      ON av.id_aprendiz = di.id_aprendiz
      AND av.principal = true

    LEFT JOIN vehiculos v1
      ON v1.id_vehiculo = av.id_vehiculo

    LEFT JOIN vehiculos v2
      ON v2.id_vehiculo = dm.id_vehiculo

    LEFT JOIN aprendiz_computador ac2
      ON ac2.id_computador = c2.id_computador
      AND ac2.principal = true

    LEFT JOIN aprendiz aopc
      ON aopc.id_aprendiz = ac2.id_aprendiz

    LEFT JOIN aprendiz_vehiculo av2
      ON av2.id_vehiculo = v2.id_vehiculo
      AND av2.principal = true

    LEFT JOIN aprendiz aov
      ON aov.id_aprendiz = av2.id_aprendiz

    WHERE ${where}
    AND (
      (
        dm.id_computador IS NOT NULL
        AND ac2.id_aprendiz IS NOT NULL
        AND ac2.id_aprendiz != di.id_aprendiz
      )
      OR
      (
        dm.id_vehiculo IS NOT NULL
        AND av2.id_aprendiz IS NOT NULL
        AND av2.id_aprendiz != di.id_aprendiz
      )
    )
    `,
    params
  )
  return rows.map(mapToDTO)
}

/* =========================
   API UNIFICADA
========================= */

export const getAllBorrowed = async (client: PoolClient) => {
  const [computers, vehicles] = await Promise.all([
    getGlobalBorrowedComputers(client),
    getGlobalBorrowedVehicles(client)
  ])

  return {
    computers,
    vehicles
  }
}
