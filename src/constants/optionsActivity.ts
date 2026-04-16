const API = import.meta.env.VITE_API_URL

export type DashboardActivityType = 'entrada' | 'salida'

export interface DashboardActivityItem {
  id: number
  nombre: string
  documento: string
  tipo: DashboardActivityType
  tiempo: number,
  formacion : string,
  hora : string,
}


export const normalizeActivity = (activity: DashboardActivityItem[] = []): DashboardActivityItem[] =>
  activity.map((item, index) => ({
    id: index + 1,
    nombre: item.nombre,
    documento: item.documento,
    tipo: item.tipo,
    tiempo: item.tiempo,
    formacion : item.formacion,
    hora : item.hora
  }))

export const getActivity = async (): Promise<DashboardActivityItem[]> => {
  try {
    const response = await fetch(`${API}/api/estadisticas/actividadHoy`)

    if (!response.ok) {
      throw new Error('Error al obtener la actividad de hoy')
    }

    const data = await response.json()

    return normalizeActivity(data.aprendices)
  } catch (error) {
    console.error(error)
    return []
  }
}
