import { PoolClient } from 'pg'
import { getAlerts } from '../query/alerts.query'

export const useAlerts = async (client: PoolClient) => {
  const data = await getAlerts(client)

  return {
    success: true,
    data,
    meta: {
      count: data.length,
      source: 'alerts'
    }
  }
}
