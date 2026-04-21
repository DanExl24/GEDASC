import type { Pool } from 'pg'
import { searchGlobal } from '../query/search.query'
import type { QueryBuilder } from '../shared/baseQuery'

export const useSearch = async (
  client: Pool,
  queryConfig: QueryBuilder,
  search?: string,
  fields: string[] = []
) => {
  if (!search) {
    return {
      success: true,
      data: [],
      meta: { source: 'search-empty' }
    }
  }

  const data = await searchGlobal(client, queryConfig, search, fields)

  return {
    success: true,
    data,
    meta: {
      count: data.length,
      source: 'search-global'
    }
  }
}
