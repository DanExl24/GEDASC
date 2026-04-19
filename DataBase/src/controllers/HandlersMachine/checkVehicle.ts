import type { PoolClient } from 'pg'
import { checkMachineResult } from '../../types/InconsistentMachine.types';

export const checkVehicle = async (
  client: PoolClient,
  placa: string,
  id_aprendiz: string | string[],
  forzarExcepcion: boolean,
  tipoVehiculo: string,
  modelo: string
): Promise<checkMachineResult> => {
  const aprendizId = Array.isArray(id_aprendiz)
    ? id_aprendiz[0]
    : id_aprendiz

  let idMaquina: number | null = null

  const vehiculo = await client.query(
    'SELECT * FROM vehiculos WHERE placa = $1',
    [placa]
  )

  if (vehiculo.rowCount && vehiculo.rowCount > 0) {
    const vehiculoId = vehiculo.rows[0].id_vehiculo

    const sameOwnerMachine = await client.query(
      `SELECT id_vehiculo, principal
       FROM aprendiz_vehiculo
       WHERE id_vehiculo = $1
       AND id_aprendiz = $2`,
      [vehiculoId, aprendizId]
    )

    if (sameOwnerMachine.rowCount && sameOwnerMachine.rowCount > 0) {
      idMaquina = vehiculoId
    } else {
      const otroAprendiz = await client.query(
        `SELECT id_vehiculo
         FROM aprendiz_vehiculo
         WHERE id_vehiculo = $1
         AND principal = TRUE`,
        [vehiculoId]
      )

      if (otroAprendiz.rowCount && otroAprendiz.rowCount > 0) {
        if (!forzarExcepcion) {
          return { status: 'diferenteAprendiz', tipoEquipo: 'vehiculo' }
        }

        const yaPrestadoHoy = await client.query(
          `SELECT 1
           FROM detalles_maquinas dm
           JOIN detalles_ingreso di ON di.id_detallemaquina = dm.id_detallemaquina
           WHERE dm.id_vehiculo = $1
           AND di.hora_ingreso >= CURRENT_DATE
           AND di.hora_ingreso < CURRENT_DATE + INTERVAL '1 day'
           LIMIT 1`,
          [vehiculoId]
        )

        if (yaPrestadoHoy.rowCount && yaPrestadoHoy.rowCount > 0) {
          return { status: 'maquinaYaPrestadaHoy' }
        }

        idMaquina = vehiculoId
      } else {
        return {
          status: 'maquinaSinDueño',
          data: { placa, modelo, tipo: tipoVehiculo }
        }
      }
    }
  } else {
    const principalRecord = await client.query(
      `SELECT v.placa
       FROM aprendiz_vehiculo av
       JOIN vehiculos v ON v.id_vehiculo = av.id_vehiculo
       WHERE av.id_aprendiz = $1
       AND av.principal = TRUE`,
      [aprendizId]
    )

    if (
      principalRecord.rowCount &&
      principalRecord.rowCount > 0 &&
      principalRecord.rows[0].placa !== placa
    ) {
      if (!forzarExcepcion) {
        return { status: 'maquinaPrincipalExistente', tipoEquipo: 'vehiculo' }
      }
    }

    const result = await client.query(
      `WITH nuevo AS (
        INSERT INTO vehiculos(tipo_vehiculo, placa, modelo)
        VALUES ($2, $3, $4)
        RETURNING id_vehiculo
      )
      INSERT INTO aprendiz_vehiculo(id_aprendiz, id_vehiculo, principal)
      SELECT $1, id_vehiculo, $5 FROM nuevo
      RETURNING id_vehiculo`,
      [
        aprendizId,
        tipoVehiculo,
        placa,
        modelo,
        principalRecord.rowCount === 0
      ]
    )

    idMaquina = result.rows[0].id_vehiculo
  }

  return { status: 'ok', idMaquina }
}
