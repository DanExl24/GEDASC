export type QueryParam = string | number | boolean | Date | null

export type QueryBuilder = {
  select: string[]
  from: string
  joins?: string[]
  where?: string[]
  params?: QueryParam[]
  orderBy?: string
}

export const buildQuery = (q: QueryBuilder) => {
  return {
    text: `
      SELECT ${q.select.join(', ')}
      FROM ${q.from}
      ${q.joins?.join(' ') || ''}
      ${q.where?.length ? `WHERE ${q.where.join(' AND ')}` : ''}
      ${q.orderBy ? `ORDER BY ${q.orderBy}` : ''}
    `,
    values: q.params || []
  }
}
