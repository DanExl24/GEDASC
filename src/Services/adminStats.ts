import { API_URL } from '@/config/network'

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

const fetchWithAuth = async <T>(path: string, token: string): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const payload = await response.json() as ApiEnvelope<T>

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new Error(payload.message || 'No fue posible obtener estadisticas administrativas')
  }

  return payload.data
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
