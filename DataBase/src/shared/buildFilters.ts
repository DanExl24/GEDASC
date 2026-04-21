import { filtersMap } from "./filtersMap"

type BuildFiltersParams = {
  dates?: (keyof typeof filtersMap.date)[]
  search?: string
  searchColumns?: string[]
}

export const buildFiltersWhere = ({
  dates,
  search,
  searchColumns = []
}: BuildFiltersParams) => {

  const conditions: string[] = []

  // 📅 FECHAS
  const selectedDates: (keyof typeof filtersMap.date)[] =
    dates?.length ? dates : ['TODAY']

  const dateConditions = selectedDates
    .map(d => filtersMap.date[d])
    .filter(Boolean)

  if (dateConditions.length) {
    conditions.push(`(${dateConditions.join(' OR ')})`)
  }

  // 🔎 SEARCH (dinámico)
  if (search && search.trim().length > 0 && searchColumns.length > 0) {

    const searchConditions = searchColumns.map((col, index) => {
      return `${col} ILIKE $${index + 1}`
    })

    conditions.push(`(${searchConditions.join(' OR ')})`)
  }

  return {
    where: conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : '',
    searchParams: search && searchColumns.length
      ? searchColumns.map(() => `%${search.trim()}%`)
      : []
  }
}
