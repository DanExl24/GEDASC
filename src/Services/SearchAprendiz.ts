// Servicio para buscar aprendiz en una barra de busqueda
const API = import.meta.env.VITE_API_URL
import type { Aprendiz } from "@/views/GeneralEntryView.vue"

export const SearchAprendiz = async (query: string | number): Promise<Aprendiz[]> => {
  if (!query) return []

  try {

    const res = await fetch(`${API}/api/registroIngresos/buscar?q=${encodeURIComponent(query)}`)
    const data = await res.json()
    return data.result.rows

  } catch (err) {

    console.error('Error buscando aprendices:', err)
    return []

  }
}
