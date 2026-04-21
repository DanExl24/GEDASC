import type { PoolClient } from 'pg'
import { BorrowRow } from '../../types/BorrowRows'
import type { RawBorrowRow } from '../../types/BorrowRows'
import { MaquinaDetalleUI } from '../../types/machineDetails'

import { filtersMap } from '../../shared/filtersMap'

const buildDateWhere = (
  dates?: (keyof typeof filtersMap.date)[],
  dateColumn = 'hora_ingreso'
) => {
  const selected: (keyof typeof filtersMap.date)[] =
    dates?.length ? dates : []

  const dateExpressions: Record<keyof typeof filtersMap.date, string> = {
    TODAY: `${dateColumn} >= CURRENT_DATE AND ${dateColumn} < CURRENT_DATE + INTERVAL '1 day'`,
    YESTERDAY: `${dateColumn} >= CURRENT_DATE - INTERVAL '1 day' AND ${dateColumn} < CURRENT_DATE`,
    THIS_WEEK: `${dateColumn} >= date_trunc('week', CURRENT_DATE) AND ${dateColumn} < date_trunc('week', CURRENT_DATE) + INTERVAL '1 week'`,
    LAST_WEEK: `${dateColumn} >= date_trunc('week', CURRENT_DATE) - INTERVAL '1 week' AND ${dateColumn} < date_trunc('week', CURRENT_DATE)`,
    THIS_MONTH: `${dateColumn} >= date_trunc('month', CURRENT_DATE) AND ${dateColumn} < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'`,
    LAST_MONTH: `${dateColumn} >= date_trunc('month', CURRENT_DATE) - INTERVAL '1 month' AND ${dateColumn} < date_trunc('month', CURRENT_DATE)`,
    THIS_QUARTER: `${dateColumn} >= date_trunc('quarter', CURRENT_DATE) AND ${dateColumn} < date_trunc('quarter', CURRENT_DATE) + INTERVAL '3 months'`
  }

  const conditions = selected
    .map(d => dateExpressions[d])
    .filter(Boolean)

  return conditions.length
    ? `(${conditions.join(' OR ')})`
    : ''
}

type AdminBorrowedParty = {
  id: string | null
  name: string | null
  document: string | null
}

type AdminBorrowedComputerRow = {
  type: 'pc'
  data: {
    borrower: AdminBorrowedParty
    owner: AdminBorrowedParty
    principal: {
      id: string | null
      serial: string | null
      marca: string | null
    } | null
    prestado: {
      id: string | null
      serial: string | null
      marca: string | null
    } | null
    firma_ingreso: string | null
  }
}

type AdminBorrowedVehicleRow = {
  type: 'vehicle'
  data: {
    borrower: AdminBorrowedParty
    owner: AdminBorrowedParty
    principal: {
      id: string | null
      placa: string | null
      tipo: string | null
      modelo: string | null
    } | null
    prestado: {
      id: string | null
      placa: string | null
      tipo: string | null
      modelo: string | null
    } | null
    firma_ingreso: string | null
  }
}


const mapToDTO = (row: BorrowRow): MaquinaDetalleUI => {
  if (row.type === 'pc') {
    const data = row.data

    return {
      pc: {
        serial: data.prestado?.serial ?? data.principal?.serial ?? null,
        marca: data.prestado?.marca ?? data.principal?.marca ?? null
      },
      vh: null,
      firma: data.firma_ingreso,
      estado: 'PRESTADA',
      aprendices: {
        actual: { id: data.id_aprendiz },
        owner: data.owner
      }
    }
  }

  // vehicle
  const data = row.data

  return {
    pc: null,
    vh: {
      tipo_vehiculo: data.prestado?.tipo ?? data.principal?.tipo ?? null,
      marca: data.prestado?.modelo ?? data.principal?.modelo ?? null,
      placa: data.prestado?.placa ?? data.principal?.placa ?? null
    },
    firma: data.firma_ingreso,
    estado: 'PRESTADA',
    aprendices: {
      actual: { id: data.id_aprendiz },
      owner: data.owner
    }
  }
}

// @ts-expect-error  pqsiomg

const mapRawToBorrowRow = (row): BorrowRow => {
  if (row.id_computador) {
    return {
      type: 'pc',
      data: {
        id_aprendiz: row.id_aprendiz,
        owner: {
          id: row.ownerId,
          name: row.ownerName
        },
        principal: {
          id: row.pc_principal,
          serial: row.principalSerial,
          marca: row.principalMarca
        },
        prestado: {
          id: row.id_computador,
          serial: row.prestadoSerial,
          marca: row.prestadoMarca
        },
        firma_ingreso: row.firma_ingreso
      }
    }
  }

  return {
    type: 'vehicle',
    data: {
      id_aprendiz: row.id_aprendiz,
      owner: {
        id: row.ownerId,
        name: row.ownerName
      },
      principal: {
        id: row.vehiculo_principal,
        placa: row.principalPlaca,
        tipo: row.principalTipo,
        modelo: row.principalModelo
      },
      prestado: {
        id: row.id_vehiculo,
        placa: row.prestadoPlaca,
        tipo: row.prestadoTipo,
        modelo: row.prestadoModelo
      },
      firma_ingreso: row.firma_ingreso
    }
  }
}

/* =========================
   QUERIES
========================= */

export const getGlobalBorrowedComputers = async (
  client: PoolClient,
  dates?: (keyof typeof filtersMap.date)[]
) => {
  const dateWhere = buildDateWhere(dates, 'di.hora_ingreso')

  const { rows } = await client.query(
    `
    SELECT
      di.id_aprendiz AS borrower_id,
      CONCAT_WS(' ', borrower.nombre, borrower.apellido) AS borrower_name,
      borrower.documento AS borrower_document,

      ac2.id_aprendiz AS owner_id,
      CONCAT_WS(' ', owner_ap.nombre, owner_ap.apellido) AS owner_name,
      owner_ap.documento AS owner_document,

      ac.id_computador AS principal_id,
      c1.serial AS principal_serial,
      c1.marca AS principal_marca,

      dm.id_computador AS prestado_id,
      c2.serial AS prestado_serial,
      c2.marca AS prestado_marca,

      dm.firma_ingreso
    FROM detalles_maquinas dm
    INNER JOIN detalles_ingreso di
      ON di.id_detallemaquina = dm.id_detallemaquina
    INNER JOIN aprendiz borrower
      ON borrower.id_aprendiz = di.id_aprendiz
    LEFT JOIN aprendiz_computador ac
      ON ac.id_aprendiz = di.id_aprendiz
      AND ac.principal = true
    LEFT JOIN computadores c1
      ON c1.id_computador = ac.id_computador
    LEFT JOIN computadores c2
      ON c2.id_computador = dm.id_computador
    LEFT JOIN aprendiz_computador ac2
      ON ac2.id_computador = dm.id_computador
      AND ac2.principal = true
    LEFT JOIN aprendiz owner_ap
      ON owner_ap.id_aprendiz = ac2.id_aprendiz
    WHERE dm.id_computador IS NOT NULL
      AND ac2.id_aprendiz IS NOT NULL
      AND ac2.id_aprendiz != di.id_aprendiz
      ${dateWhere ? `AND ${dateWhere}` : ''}
    ORDER BY di.hora_ingreso DESC
    `
  )

  return rows.map((row): AdminBorrowedComputerRow => ({
    type: 'pc',
    data: {
      borrower: {
        id: row.borrower_id ?? null,
        name: row.borrower_name ?? null,
        document: row.borrower_document ?? null
      },
      owner: {
        id: row.owner_id ?? null,
        name: row.owner_name ?? null,
        document: row.owner_document ?? null
      },
      principal: row.principal_id
        ? {
            id: row.principal_id,
            serial: row.principal_serial ?? null,
            marca: row.principal_marca ?? null
          }
        : null,
      prestado: row.prestado_id
        ? {
            id: row.prestado_id,
            serial: row.prestado_serial ?? null,
            marca: row.prestado_marca ?? null
          }
        : null,
      firma_ingreso: row.firma_ingreso ?? null
    }
  }))
}

export const getGlobalBorrowedVehicles = async (
  client: PoolClient,
  dates?: (keyof typeof filtersMap.date)[]
) => {
  const dateWhere = buildDateWhere(dates, 'di.hora_ingreso')

  const { rows } = await client.query(
    `
    SELECT
      di.id_aprendiz AS borrower_id,
      CONCAT_WS(' ', borrower.nombre, borrower.apellido) AS borrower_name,
      borrower.documento AS borrower_document,

      av2.id_aprendiz AS owner_id,
      CONCAT_WS(' ', owner_ap.nombre, owner_ap.apellido) AS owner_name,
      owner_ap.documento AS owner_document,

      av.id_vehiculo AS principal_id,
      v1.placa AS principal_placa,
      v1.tipo_vehiculo AS principal_tipo,
      v1.modelo AS principal_modelo,

      dm.id_vehiculo AS prestado_id,
      v2.placa AS prestado_placa,
      v2.tipo_vehiculo AS prestado_tipo,
      v2.modelo AS prestado_modelo,

      dm.firma_ingreso
    FROM detalles_maquinas dm
    INNER JOIN detalles_ingreso di
      ON di.id_detallemaquina = dm.id_detallemaquina
    INNER JOIN aprendiz borrower
      ON borrower.id_aprendiz = di.id_aprendiz
    LEFT JOIN aprendiz_vehiculo av
      ON av.id_aprendiz = di.id_aprendiz
      AND av.principal = true
    LEFT JOIN vehiculos v1
      ON v1.id_vehiculo = av.id_vehiculo
    LEFT JOIN vehiculos v2
      ON v2.id_vehiculo = dm.id_vehiculo
    LEFT JOIN aprendiz_vehiculo av2
      ON av2.id_vehiculo = dm.id_vehiculo
      AND av2.principal = true
    LEFT JOIN aprendiz owner_ap
      ON owner_ap.id_aprendiz = av2.id_aprendiz
    WHERE dm.id_vehiculo IS NOT NULL
      AND av2.id_aprendiz IS NOT NULL
      AND av2.id_aprendiz != di.id_aprendiz
      ${dateWhere ? `AND ${dateWhere}` : ''}
    ORDER BY di.hora_ingreso DESC
    `
  )

  return rows.map((row): AdminBorrowedVehicleRow => ({
    type: 'vehicle',
    data: {
      borrower: {
        id: row.borrower_id ?? null,
        name: row.borrower_name ?? null,
        document: row.borrower_document ?? null
      },
      owner: {
        id: row.owner_id ?? null,
        name: row.owner_name ?? null,
        document: row.owner_document ?? null
      },
      principal: row.principal_id
        ? {
            id: row.principal_id,
            placa: row.principal_placa ?? null,
            tipo: row.principal_tipo ?? null,
            modelo: row.principal_modelo ?? null
          }
        : null,
      prestado: row.prestado_id
        ? {
            id: row.prestado_id,
            placa: row.prestado_placa ?? null,
            tipo: row.prestado_tipo ?? null,
            modelo: row.prestado_modelo ?? null
          }
        : null,
      firma_ingreso: row.firma_ingreso ?? null
    }
  }))
}


/* =========================
   TODAY BORROWED (REFINADO)
========================= */

export const getTheBorrowedMachine = async (
  client: PoolClient,
  id_aprendiz?: string,
  dates?: (keyof typeof filtersMap.date)[]
) => {
  const params: (string | number | Date)[] = []

  const dateWhere = buildDateWhere(dates)

  let where = dateWhere || '1=1'

  if (id_aprendiz) {
    params.push(id_aprendiz)
    where += ` AND di.id_aprendiz = $${params.length}`
  }

  const { rows } = await client.query<RawBorrowRow>(
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

  return rows
    .map(mapRawToBorrowRow)
    .map(mapToDTO)
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
