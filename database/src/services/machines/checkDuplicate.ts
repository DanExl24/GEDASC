import type { PoolClient } from 'pg'

export interface DuplicateCheckResult {
  isDuplicate: boolean
  hasActiveSession: boolean
  portador?: {
    nombre: string
    apellido: string
    documento: string
  }
}

export const checkDuplicate = async (
  client: PoolClient,
  placa: string
): Promise<DuplicateCheckResult> => {

  // Buscar si la máquina fue registrada hoy
  const result = await client.query(
    `SELECT 
        dm.id_detallemaquina,
        dm.estado_equipo,
        a.nombre,
        a.apellido,
        a.documento,
        ds.hora_salida
      FROM detalles_maquinas dm
      JOIN detalles_ingreso di ON di.id_detallemaquina = dm.id_detallemaquina
      JOIN aprendiz a ON a.id_aprendiz = di.id_aprendiz
      LEFT JOIN detalles_salida ds ON ds.id_ingreso = di.id_ingreso
      LEFT JOIN computadores c ON dm.id_computador = c.id_computador
      LEFT JOIN vehiculos v ON dm.id_vehiculo = v.id_vehiculo
      WHERE
        ((c.serial = $1) OR (v.placa = $1))
      AND di.hora_ingreso >= CURRENT_DATE
      AND di.hora_ingreso < CURRENT_DATE + INTERVAL '1 day'
      ORDER BY di.hora_ingreso DESC
      LIMIT 1`,
    [placa]
  )

  // No fue registrada hoy en absoluto → no es duplicada
  if ((result.rowCount ?? 0) === 0) {
    return { isDuplicate: false, hasActiveSession: false }
  }

  const row = result.rows[0]

  // La máquina fue registrada hoy, pero ¿tiene sesión activa?
  // Sesión activa = el aprendiz que la porta NO tiene salida registrada
  const hasActiveSession = row.hora_salida === null

  if (hasActiveSession) {
    // Máquina con sesión activa → bloqueada, informar quién la porta
    return {
      isDuplicate: true,
      hasActiveSession: true,
      portador: {
        nombre: row.nombre,
        apellido: row.apellido,
        documento: row.documento
      }
    }
  }

  // La máquina fue registrada hoy pero su sesión ya fue cerrada → permitir re-registro
  return { isDuplicate: false, hasActiveSession: false }
}
