import { pool } from '../config/db'
import { filtersMap } from '../shared/filtersMap'
import type { PoolClient } from 'pg'
import { MaquinaDetalleUI } from '../types/machineDetails'
import { QueryParam } from '../shared/baseQuery'
import {
  getGlobalBorrowedComputers,
  getGlobalBorrowedVehicles
} from '../controllers/HandlersMachine/checksBorroweds'

type AdminFilters = {
  dates?: (keyof typeof filtersMap.date)[] | string
  search?: string
  searchColumns?: string[]
  dateColumn?: string
  defaultDates?: (keyof typeof filtersMap.date)[]
}

const normalizeDateFilters = (
  dates: AdminFilters['dates'],
  defaultDates: (keyof typeof filtersMap.date)[]
) => {
  if (Array.isArray(dates)) {
    return dates
  }

  if (typeof dates === 'string' && dates.trim()) {
    return dates
      .split(',')
      .map((date) => date.trim())
      .filter(Boolean) as (keyof typeof filtersMap.date)[]
  }

  return defaultDates
}

const buildDateConditions = (
  dateColumn: string,
  selectedDates: (keyof typeof filtersMap.date)[]
) => {
  const dateExpressions: Record<keyof typeof filtersMap.date, string> = {
    TODAY: `${dateColumn} >= CURRENT_DATE AND ${dateColumn} < CURRENT_DATE + INTERVAL '1 day'`,
    YESTERDAY: `${dateColumn} >= CURRENT_DATE - INTERVAL '1 day' AND ${dateColumn} < CURRENT_DATE`,
    THIS_WEEK: `${dateColumn} >= date_trunc('week', CURRENT_DATE) AND ${dateColumn} < date_trunc('week', CURRENT_DATE) + INTERVAL '1 week'`,
    LAST_WEEK: `${dateColumn} >= date_trunc('week', CURRENT_DATE) - INTERVAL '1 week' AND ${dateColumn} < date_trunc('week', CURRENT_DATE)`,
    THIS_MONTH: `${dateColumn} >= date_trunc('month', CURRENT_DATE) AND ${dateColumn} < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'`,
    LAST_MONTH: `${dateColumn} >= date_trunc('month', CURRENT_DATE) - INTERVAL '1 month' AND ${dateColumn} < date_trunc('month', CURRENT_DATE)`,
    THIS_QUARTER: `${dateColumn} >= date_trunc('quarter', CURRENT_DATE) AND ${dateColumn} < date_trunc('quarter', CURRENT_DATE) + INTERVAL '3 months'`
  }

  return selectedDates
    .map((date) => dateExpressions[date])
    .filter(Boolean)
}

const buildAdminWhere = ({
  dates,
  search,
  searchColumns = [],
  dateColumn = 'di.hora_ingreso',
  defaultDates = ['TODAY']
}: AdminFilters) => {
  const conditions: string[] = []
  const params: QueryParam[] = []

  const selectedDates: (keyof typeof filtersMap.date)[] =
    normalizeDateFilters(dates, defaultDates)

  const dateConditions = buildDateConditions(dateColumn, selectedDates)

  if (dateConditions.length) {
    conditions.push(`(${dateConditions.join(' OR ')})`)
  }

  if (search && search.trim() && searchColumns.length) {
    const q = `%${search.trim()}%`

    const searchCond = searchColumns.map((col) => {
      params.push(q)
      return `${col} ILIKE $${params.length}`
    })

    conditions.push(`(${searchCond.join(' OR ')})`)
  }

  return {
    where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    params
  }
}

const deleteIngreso = async (id_aprendiz: string, date?: string) => {
  const params = date ? [id_aprendiz, date] : [id_aprendiz]

  await pool.query(
    `
    DELETE FROM detalles_ingreso
    WHERE id_aprendiz = $1
    ${date ? `AND DATE(hora_ingreso) = $2` : ''}
    `,
    params
  )
}

const deleteSalida = async (id_aprendiz: string, date?: string) => {
  const { rows } = await pool.query(
    `
    SELECT di.id_ingreso
    FROM detalles_ingreso di
    WHERE di.id_aprendiz = $1
    ${date ? `AND DATE(di.hora_ingreso) = $2` : ''}
    `,
    date ? [id_aprendiz, date] : [id_aprendiz]
  )

  if (!rows.length) return null

  await pool.query(
    `
    DELETE FROM detalles_salida
    WHERE id_ingreso = ANY($1)
    `,
    [rows.map(r => r.id_ingreso)]
  )
}

const getAllAprendices = async (filters: AdminFilters = {}) => {
  const { where, params } = buildAdminWhere({
    ...filters,
    searchColumns: ['nombre', 'apellido', 'documento'],
    defaultDates: []
  })

  const { rows } = await pool.query(
    `SELECT * FROM aprendiz ${where}`,
    params
  )

  return rows
}

const getIngressEgress = async (filters: AdminFilters = {}) => {
  const { where, params } = buildAdminWhere({
    ...filters,
    searchColumns: [
      'a.nombre',
      'a.apellido',
      'a.documento'
    ]
  })

  const { rows } = await pool.query(
    `
    SELECT
      di.*,
      a.nombre,
      a.apellido,
      a.documento,
      a.id_aprendiz,
      dm.id_computador,
      dm.id_vehiculo,
      dm.firma_ingreso,
      di.hora_ingreso,
      ds.hora_salida
    FROM detalles_ingreso di
    INNER JOIN aprendiz a
      ON a.id_aprendiz = di.id_aprendiz
    LEFT JOIN detalles_maquinas dm
      ON dm.id_detallemaquina = di.id_detallemaquina
    LEFT JOIN detalles_salida ds
      ON ds.id_ingreso = di.id_ingreso
    ${where}
    ORDER BY di.hora_ingreso DESC
    `,
    params
  )

  return rows
}

const getIngressEgressRecordForDelete = async (id_aprendiz: string, date: string) => {
  const { rows } = await pool.query(
    `
    SELECT
      di.id_ingreso,
      di.id_aprendiz,
      a.nombre,
      a.apellido,
      a.documento,
      di.hora_ingreso,
      ds.hora_salida
    FROM detalles_ingreso di
    INNER JOIN aprendiz a
      ON a.id_aprendiz = di.id_aprendiz
    LEFT JOIN detalles_salida ds
      ON ds.id_ingreso = di.id_ingreso
    WHERE di.id_aprendiz = $1
      AND DATE(di.hora_ingreso) = $2
    ORDER BY di.hora_ingreso DESC
    LIMIT 1
    `,
    [id_aprendiz, date]
  )

  return rows[0] ?? null
}

const getAprendicesTrimestrales = async (filters: AdminFilters = {}) => {
  const { where, params } = buildAdminWhere({
    ...filters,
    searchColumns: ['nombre'],
    dateColumn: 'fecha_registro',
    defaultDates: []
  })

  const { rows } = await pool.query(
    `
    SELECT
      EXTRACT(QUARTER FROM fecha_registro) AS trimestre,
      COUNT(*)::int AS total
    FROM aprendiz
    ${where}
    GROUP BY trimestre
    ORDER BY trimestre
    `,
    params
  )

  return rows
}

const getAprendicesAnuales = async (filters: AdminFilters = {}) => {
  const { where, params } = buildAdminWhere({
    ...filters,
    searchColumns: ['nombre'],
    dateColumn: 'fecha_registro',
    defaultDates: []
  })

  const { rows } = await pool.query(
    `
    SELECT
      EXTRACT(YEAR FROM fecha_registro) AS year,
      COUNT(*)::int AS total
    FROM aprendiz
    ${where}
    GROUP BY year
    ORDER BY year
    `,
    params
  )

  return rows
}

const getAprendicesTrack = async (filters: AdminFilters = {}) => {
  const { where, params } = buildAdminWhere({
    ...filters,
    searchColumns: ['a.nombre', 'a.documento'],
    defaultDates: []
  })

  const { rows } = await pool.query(
    `
    SELECT
      a.*,
      COUNT(di.id_ingreso) AS total_sesiones,
      COUNT(DISTINCT DATE(di.hora_ingreso)) AS dias_activos,
      COALESCE(
        MAX(
          CASE
            WHEN DATE(di.hora_ingreso) = CURRENT_DATE AND ds.hora_salida IS NULL THEN
              GREATEST(
                EXTRACT(
                  EPOCH FROM (
                    LEAST(
                      NOW(),
                      CURRENT_DATE + INTERVAL '22 hours'
                    ) - di.hora_ingreso
                  )
                ) / 3600,
                0
              )
            ELSE 0
          END
        ),
        0
      ) AS horas_reales,
      MAX(di.hora_ingreso) AS ultima_visita
    FROM aprendiz a
    LEFT JOIN detalles_ingreso di ON di.id_aprendiz = a.id_aprendiz
    LEFT JOIN detalles_salida ds ON ds.id_ingreso = di.id_ingreso
    ${where}
    GROUP BY a.id_aprendiz
    ORDER BY horas_reales DESC
    `,
    params
  )

  return rows
}

const getAllComputers = async (filters: AdminFilters = {}) => {
  const { where, params } = buildAdminWhere({
    ...filters,
    searchColumns: ['serial', 'marca']
  })

  const { rows } = await pool.query(
    `SELECT * FROM computadores ${where}`,
    params
  )

  return rows
}

const getAllVehicles = async (filters: AdminFilters = {}) => {
  const { where, params } = buildAdminWhere({
    ...filters,
    searchColumns: ['placa', 'modelo']
  })

  const { rows } = await pool.query(
    `SELECT * FROM vehiculos ${where}`,
    params
  )

  return rows
}

const getBorrowedComputers = async (filters: AdminFilters = {}) => {
  const client = await pool.connect()
  try {
    const selectedDates = normalizeDateFilters(filters.dates, ['TODAY'])
    return await getGlobalBorrowedComputers(client, selectedDates)
  } finally {
    client.release()
  }
}

const getBorrowedVehicles = async (filters: AdminFilters = {}) => {
  const client = await pool.connect()
  try {
    const selectedDates = normalizeDateFilters(filters.dates, ['TODAY'])
    return await getGlobalBorrowedVehicles(client, selectedDates)
  } finally {
    client.release()
  }
}

const getAllMachinesByAprendiz = async (
  client: PoolClient,
  id_aprendiz?: string,
  filters: AdminFilters = {}
): Promise<MaquinaDetalleUI[]> => {
  if (!id_aprendiz) {
    return []
  }

  const { rows } = await client.query(
    `
    SELECT
      base.id_aprendiz,
      base.firma_ingreso,
      base.pc_serial,
      base.pc_marca,
      base.pc_principal,
      base.tipo_vehiculo,
      base.vh_marca,
      base.vh_placa,
      base.vh_principal
    FROM (
      SELECT
        ac.id_aprendiz,
        c.serial AS pc_serial,
        c.marca AS pc_marca,
        ac.principal AS pc_principal,
        NULL::text AS tipo_vehiculo,
        NULL::text AS vh_marca,
        NULL::text AS vh_placa,
        NULL::boolean AS vh_principal,
        (
          SELECT dm.firma_ingreso
          FROM detalles_ingreso di
          INNER JOIN detalles_maquinas dm
            ON dm.id_detallemaquina = di.id_detallemaquina
          WHERE di.id_aprendiz = ac.id_aprendiz
            AND dm.id_computador = ac.id_computador
          ORDER BY di.hora_ingreso DESC
          LIMIT 1
        ) AS firma_ingreso,
        0 AS sort_group,
        CASE WHEN ac.principal THEN 0 ELSE 1 END AS sort_priority,
        c.serial AS sort_label
      FROM aprendiz_computador ac
      INNER JOIN computadores c
        ON c.id_computador = ac.id_computador
      WHERE ac.id_aprendiz = $1

      UNION ALL

      SELECT
        av.id_aprendiz,
        NULL::text AS pc_serial,
        NULL::text AS pc_marca,
        NULL::boolean AS pc_principal,
        v.tipo_vehiculo,
        v.modelo AS vh_marca,
        v.placa AS vh_placa,
        av.principal AS vh_principal,
        (
          SELECT dm.firma_ingreso
          FROM detalles_ingreso di
          INNER JOIN detalles_maquinas dm
            ON dm.id_detallemaquina = di.id_detallemaquina
          WHERE di.id_aprendiz = av.id_aprendiz
            AND dm.id_vehiculo = av.id_vehiculo
          ORDER BY di.hora_ingreso DESC
          LIMIT 1
        ) AS firma_ingreso,
        1 AS sort_group,
        CASE WHEN av.principal THEN 0 ELSE 1 END AS sort_priority,
        v.placa AS sort_label
      FROM aprendiz_vehiculo av
      INNER JOIN vehiculos v
        ON v.id_vehiculo = av.id_vehiculo
      WHERE av.id_aprendiz = $1
    ) AS base
    ORDER BY base.sort_group ASC, base.sort_priority ASC, base.sort_label ASC NULLS LAST
    `,
    [id_aprendiz]
  )

  return rows.map(row => ({
    pc: row.pc_serial
      ? {
          serial: row.pc_serial,
          marca: row.pc_marca,
          estado: row.pc_principal ? 'PRINCIPAL' : 'SECUNDARIO'
        }
      : null,
    vh: row.tipo_vehiculo
      ? {
          tipo_vehiculo: row.tipo_vehiculo,
          marca: row.vh_marca,
          placa: row.vh_placa,
          estado: row.vh_principal ? 'PRINCIPAL' : 'SECUNDARIO'
        }
      : null,
    firma: row.firma_ingreso ?? null,
    aprendices: {
      actual: { id: row.id_aprendiz },
      owner: { id: null, name: null }
    }
  }))
}


const InconsistentExit = async () => {
  const { rows } = await pool.query(`
    SELECT
      ds.hora_salida,
      a.id_aprendiz AS id_aprendiz,
      a.nombre AS nombreAprendiz,
      a.apellido AS apellidoAprendiz,
      a.documento AS documento,
      f.nombre AS nombreFormacion
    FROM detalles_ingreso AS di
    LEFT JOIN detalles_salida ds
      ON ds.id_ingreso = di.id_ingreso
    INNER JOIN aprendiz AS a
      ON a.id_aprendiz = di.id_aprendiz
    INNER JOIN formaciones AS f
      ON f.id_formacion = a.id_formacion
    WHERE NOT (
      di.hora_ingreso >= CURRENT_DATE
      AND ds.hora_salida IS NULL
    )
  `)

  return rows.map((row) => ({
    aprendiz : {
      id : row.id_aprendiz,
      documento : row.documento,
      nombreCompleto : `${row.nombreaprendiz} ${row.apellidoaprendiz}`,
      formacion : row.nombreformacion,
      salida: row.hora_salida ? 'EXITOSA' : 'NO_EXISTE'
    }
  }))
}

export const AdminService = () => ({
  getAllAprendices,
  getAprendicesTrimestrales,
  getAprendicesAnuales,
  getAprendicesTrack,
  getIngressEgress,
  getIngressEgressRecordForDelete,
  getAllComputers,
  getAllVehicles,
  getBorrowedComputers,
  getBorrowedVehicles,
  getAllMachinesByAprendiz,
  deleteIngreso,
  deleteSalida,
  InconsistentExit
})
