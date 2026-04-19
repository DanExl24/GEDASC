// Servicio para buscar aprendiz en una barra de busqueda
const API = import.meta.env.VITE_API_URL
import type { Aprendiz } from '@/types/aprendiz.types'
import type { SearchAprendizType } from '@/types/search.types'
import { useJornadaStore } from '@/stores/jornada'

export const SearchAprendiz = async (
  query: string | number,
  type: SearchAprendizType,
): Promise<Aprendiz[]> => {
  if (!query) return []

  const jornadaStore = useJornadaStore()

  try {
    const endpoint = type === 'ingreso'
      ? 'registroIngresos'
      : 'registroSalidas'

    const res = await fetch(
      `${API}/api/${endpoint}/buscar?q=${encodeURIComponent(query)}`,
    )

    if (!res.ok) throw new Error('Error en la peticion')

    const data = (await res.json()) as Aprendiz[]
    console.log(data)

    jornadaStore.registerAprendices(data)

    return data
  } catch (err) {
    console.error('Error buscando aprendices:', err)
    return []
  }
}
