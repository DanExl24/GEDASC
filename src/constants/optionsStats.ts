const API = import.meta.env.VITE_API_URL

export interface DashboardStatItem {
  id: 'entriesToday' | 'exitsToday' | 'monthEntries' | 'quarterEntries'
  label: string
  shortLabel: string
  value: number
  icon: string
  accent: 'green' | 'dark'
  description: string
}

interface StatsApiResponse {
  entradasHoy?: number
  salidasHoy?: number
  esteMes?: number
  trimestre?: number
}

export const normalizeStats = (data: StatsApiResponse = {}): DashboardStatItem[] => [
  {
    id: 'entriesToday',
    label: 'Entradas de hoy',
    shortLabel: 'Hoy',
    value: data.entradasHoy ?? 0,
    icon: 'IN',
    accent: 'green',
    description: 'Aprendices registrados en ingreso durante el dia.',
  },
  {
    id: 'exitsToday',
    label: 'Salidas de hoy',
    shortLabel: 'Hoy',
    value: data.salidasHoy ?? 0,
    icon: 'OUT',
    accent: 'dark',
    description: 'Aprendices que ya completaron el proceso de salida.',
  },
  {
    id: 'monthEntries',
    label: 'Entradas del mes',
    shortLabel: 'Mes',
    value: data.esteMes ?? 0,
    icon: 'MES',
    accent: 'green',
    description: 'Acumulado mensual de registros de entrada.',
  },
  {
    id: 'quarterEntries',
    label: 'Entradas del trimestre',
    shortLabel: 'Trim',
    value: data.trimestre ?? 0,
    icon: 'Q1',
    accent: 'green',
    description: 'Vista consolidada del trimestre actual.',
  },
]

export const getEstadisticas = async (): Promise<DashboardStatItem[]> => {
  try {
    const response = await fetch(`${API}/api/estadisticas/historial`)

    if (!response.ok) {
      throw new Error('Error al obtener estadisticas')
    }

    const data: StatsApiResponse = await response.json()
    return normalizeStats(data)
  } catch (error) {
    console.error(error)
    return normalizeStats()
  }
}
