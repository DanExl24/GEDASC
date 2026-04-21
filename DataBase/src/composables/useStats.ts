import { PoolClient } from 'pg'
import { getMonthlyStats, getActiveHours } from '../query/stats.query'

export const useStats = {
  monthly: async (client: PoolClient) => {
    const data = await getMonthlyStats(client)

    return {
      success: true,
      data,
      meta: { source: 'monthly-stats' }
    }
  },

  activeHours: async (client: PoolClient) => {
    const data = await getActiveHours(client)

    return {
      success: true,
      data,
      meta: { source: 'active-hours' }
    }
  }
}
