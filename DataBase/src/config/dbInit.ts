import { pool } from './db'

export const initDbSchema = async () => {
  try {
    console.log('[DBInit] Verificando y actualizando esquema de base de datos...')

    // 1. Agregar columna id_ingreso a detalles_maquinas si no existe
    await pool.query(`
      ALTER TABLE detalles_maquinas 
      ADD COLUMN IF NOT EXISTS id_ingreso INTEGER REFERENCES detalles_ingreso(id_ingreso) ON DELETE CASCADE;
    `)

    // 2. Migrar relaciones existentes desde detalles_ingreso.id_detallemaquina hacia detalles_maquinas.id_ingreso
    await pool.query(`
      UPDATE detalles_maquinas dm
      SET id_ingreso = di.id_ingreso
      FROM detalles_ingreso di
      WHERE di.id_detallemaquina = dm.id_detallemaquina
        AND dm.id_ingreso IS NULL;
    `)

    // 3. Separar filas combinadas (PC y Vehículo en la misma fila) a filas independientes
    await pool.query(`
      INSERT INTO detalles_maquinas (id_vehiculo, firma_ingreso, firma_salida, estado_equipo, hora_retiro_equipo, id_ingreso)
      SELECT dm.id_vehiculo, dm.firma_ingreso, dm.firma_salida, dm.estado_equipo, dm.hora_retiro_equipo, dm.id_ingreso
      FROM detalles_maquinas dm
      WHERE dm.id_computador IS NOT NULL AND dm.id_vehiculo IS NOT NULL;

      UPDATE detalles_maquinas
      SET id_vehiculo = NULL
      WHERE id_computador IS NOT NULL AND id_vehiculo IS NOT NULL;
    `)

    console.log('[DBInit] Esquema de base de datos verificado e incializado correctamente.')
  } catch (error) {
    console.error('[DBInit] Error durante la inicialización del esquema de BD:', error)
  }
}
