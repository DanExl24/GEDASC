import { PoolClient } from 'pg'
import {
  getAllMachines,
  getMachinesByAprendiz
} from '../query/machine.query'
import { CTAResponse } from '../shared/contract.type'
import { MachinesDTO } from '../types/machinesDTO'

export const useMachines = () => {
  const all =  async (client: PoolClient): Promise<CTAResponse<MachinesDTO>> => {
    const data = await getAllMachines(client)

    return {
      success: true,
      data,
      meta: {
        count: data.computers.length + data.vehicles.length,
        source: 'machines-all'
      }
    }
  }

  const byAprendiz = async (client: PoolClient,id_aprendiz: string): Promise<CTAResponse<MachinesDTO>> =>{
    const data = await getMachinesByAprendiz(client, id_aprendiz)

    return {
      success: true,
      data,
      meta: { source: 'machines-by-aprendiz' }
    }
  }



  return {
    all,
    byAprendiz
  }
}
