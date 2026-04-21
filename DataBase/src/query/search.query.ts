import { Pool } from 'pg'
import { QueryBuilder } from '../shared/baseQuery'
import { buildQuery } from '../shared/baseQuery'



export const searchGlobal = async (client: Pool,queryConfig: QueryBuilder,search?: string,fields: string[] = []) => {
  const q = { ...queryConfig }
  q.where = [...(q.where || [])]
  q.params = [...(q.params || [])]

  // 🔍 búsqueda dinámica
  if (search && fields.length) {
    q.params.push(`%${search}%`)
    const param = `$${q.params.length}`

    const searchConditions = fields.map(f => `${f} ILIKE ${param}`)
    q.where.push(`(${searchConditions.join(' OR ')})`)
  }

  const { text, values } = buildQuery(q)

  const result = await client.query(text, values)
  return result.rows
}
