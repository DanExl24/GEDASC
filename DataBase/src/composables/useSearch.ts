import { PoolClient } from 'pg'
import { searchGlobal } from '../query/search.query'

export const useSearch = async (
  client: PoolClient,
  search: string
) => {
  if (!search) {
    return {
      success: true,
      data: [],
      meta: { source: 'search-empty' }
    }
  }

  const data = await searchGlobal(client, search)

  return {
    success: true,
    data,
    meta: {
      count: data.length,
      source: 'search-global'
    }
  }
}
