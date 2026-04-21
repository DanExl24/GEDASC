import { PoolClient } from 'pg'
import { MachinesDTO } from '../types/machinesDTO'

export const getAllMachines = async (client: PoolClient): Promise<MachinesDTO> => {

  const pcs = await client.query(`
    SELECT
      c.serial,
      c.marca,
      ac.principal
    FROM computadores c
    LEFT JOIN aprendiz_computador ac
      ON ac.id_computador = c.id_computador
  `)

  const vehicles = await client.query(`
    SELECT
      v.placa,
      v.modelo,
      v.tipo_vehiculo,
      av.principal
    FROM vehiculos v
    LEFT JOIN aprendiz_vehiculo av
      ON av.id_vehiculo = v.id_vehiculo
  `)

  return {
    computers: pcs.rows,
    vehicles: vehicles.rows
  }
}

export const getMachinesByAprendiz = async (
  client: PoolClient,
  id_aprendiz: string
) => {
  const pcs = await client.query(
    `
    SELECT c.serial, c.marca, ac.principal
    FROM aprendiz_computador ac
    JOIN computadores c ON c.id_computador = ac.id_computador
    WHERE ac.id_aprendiz = $1
    ORDER BY ac.principal DESC
    `,
    [id_aprendiz]
  )

  const vh = await client.query(
    `
    SELECT v.placa, v.modelo, v.tipo_vehiculo, av.principal
    FROM aprendiz_vehiculo av
    JOIN vehiculos v ON v.id_vehiculo = av.id_vehiculo
    WHERE av.id_aprendiz = $1
    ORDER BY av.principal DESC
    `,
    [id_aprendiz]
  )

  return {
    computers: pcs.rows,
    vehicles: vh.rows
  }
}

