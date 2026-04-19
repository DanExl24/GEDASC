import type { PoolClient } from 'pg'
import { checkMachineResult } from '../../types/InconsistentMachine.types';

export const checkComputer = async (
  client: PoolClient,
  serial: string,
  id_aprendiz: string | string[],
  forzarExcepcion: boolean,
  modelo: string
): Promise<checkMachineResult> => {

  // 🔹 Normalizar id_aprendiz
  const aprendizId = Array.isArray(id_aprendiz)
    ? id_aprendiz[0]
    : id_aprendiz

  let idMaquina: number | null = null;

  // 🔹 Buscar si ya existe el computador
  const pc = await client.query(
    "SELECT * FROM computadores WHERE serial = $1",
    [serial]
  );

  if (pc.rowCount && pc.rowCount > 0) {

    const computadorId = pc.rows[0].id_computador;

    // 🔹 Verificar si es principal del mismo aprendiz
    const principalMachine = await client.query(
      `SELECT id_computador
       FROM aprendiz_computador
       WHERE id_computador = $1
       AND id_aprendiz = $2
       AND principal = TRUE`,
      [computadorId, aprendizId]
    );

    if (principalMachine.rowCount && principalMachine.rowCount > 0) {
      idMaquina = computadorId;
    } else {

      // 🔹 Verificar si pertenece a otro aprendiz
      const otroAprendiz = await client.query(
        `SELECT id_computador
         FROM aprendiz_computador
         WHERE id_computador = $1
         AND principal = TRUE`,
        [computadorId]
      );

      if (otroAprendiz.rowCount && otroAprendiz.rowCount > 0) {

        // ⚠️ Si no quiere forzar → devolver inconsistencia
        if (!forzarExcepcion) {
          return { status: 'diferenteAprendiz', tipoEquipo: 'computador' }
        }

        // 🔹 Verificar si ya fue prestado hoy
        const yaPrestadoHoy = await client.query(
          `SELECT 1
           FROM detalles_maquinas dm
           JOIN detalles_ingreso di ON di.id_detallemaquina = dm.id_detallemaquina
           WHERE dm.id_computador = $1
           AND di.hora_ingreso >= CURRENT_DATE
           AND di.hora_ingreso < CURRENT_DATE + INTERVAL '1 day'
           LIMIT 1`,
          [computadorId]
        );

        if (yaPrestadoHoy.rowCount && yaPrestadoHoy.rowCount > 0) {
          return { status: 'maquinaYaPrestadaHoy' }
        }
        console.log('ANTES DEL INSERT FINAL')
        // 🔹 Se permite usar la máquina
        idMaquina = computadorId;

      } else {
        // 🔹 No tiene dueño
        return {
          status: 'maquinaSinDueño',
          data: { serial, modelo }
        }
      }
    }

  } else {

    // 🔹 Verificar si ya tiene máquina principal
    const principalRecord = await client.query(
      `SELECT c.serial
       FROM aprendiz_computador ac
       JOIN computadores c ON c.id_computador = ac.id_computador
       WHERE ac.id_aprendiz = $1
       AND ac.principal = TRUE`,
      [aprendizId]
    );

    if (
      principalRecord.rowCount &&
      principalRecord.rowCount > 0 &&
      principalRecord.rows[0].serial !== serial
    ) {
      if (!forzarExcepcion) {
        return {
          status: 'maquinaPrincipalExistente',
          tipoEquipo: 'computador'
        }
      }
    }

    await client.query(
      `UPDATE aprendiz_computador
      SET principal = FALSE
      WHERE id_aprendiz = $1`,
      [aprendizId]
    );

    const result = await client.query(
      `WITH nuevo AS (
        INSERT INTO computadores(serial, marca)
        VALUES ($2, $3)
        RETURNING id_computador
      )
      INSERT INTO aprendiz_computador(id_aprendiz, id_computador, principal)
      SELECT $1, id_computador, TRUE FROM nuevo
      RETURNING id_computador`,
      [aprendizId, serial, modelo]
    );

    idMaquina = result.rows[0].id_computador;
  }

  return { status: 'ok', idMaquina }
}
