// Servicio para buscar aprendiz en una barra de busqueda
const API = import.meta.env.VITE_API_URL
import type { Aprendiz } from "@/views/GeneralEntryView.vue"

export const SearchAprendiz = async (query: string | number, type: string): Promise<Aprendiz[]> => {
  if (!query) return []

  try {
    const endpoint = type === 'ingreso'
      ? 'registroIngresos'
      : 'registroSalidas'

    const res = await fetch(`${API}/api/${endpoint}/buscar?q=${encodeURIComponent(query)}`)

    if (!res.ok) throw new Error('Error en la petición')

    const data = await res.json()
    console.log(data)

    return data  // 👈 ESTE ERA EL FALTANTE

  } catch (err) {
    console.error('Error buscando aprendices:', err)
    return []
  }
}
