import { fetchWithAuth } from '@/Services/httpClient'

export interface AdminQuarterStat {
  trimestre: number
  total: number
}

export interface AdminYearStat {
  year: number
  total: number
}

type ApiEnvelope<T> = {
  success: boolean
  data?: T
  message?: string
}

const normalizeQuarterStats = (data: unknown): AdminQuarterStat[] => {
  if (!Array.isArray(data)) return []

  return data
    .map((item) => {
      if (!item || typeof item !== 'object') return null

      const source = item as Record<string, unknown>

      return {
        trimestre: Number(source.trimestre ?? 0),
        total: Number(source.total ?? 0),
      }
    })
    .filter((item): item is AdminQuarterStat => item !== null)
}

const normalizeYearStats = (data: unknown): AdminYearStat[] => {
  if (!Array.isArray(data)) return []

  return data
    .map((item) => {
      if (!item || typeof item !== 'object') return null

      const source = item as Record<string, unknown>

      return {
        year: Number(source.year ?? 0),
        total: Number(source.total ?? 0),
      }
    })
    .filter((item): item is AdminYearStat => item !== null)
}


export const getAdminDashboardStats = async (token: string) => {
  const [quarterData, yearData] = await Promise.all([
    fetchWithAuth<unknown[]>('/api/admin/statsQuarter', token),
    fetchWithAuth<unknown[]>('/api/admin/statsYear', token),
  ])

  return {
    quarterStats: normalizeQuarterStats(quarterData),
    yearStats: normalizeYearStats(yearData),
  }
}
