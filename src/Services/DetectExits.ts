const API = import.meta.env.VITE_API_URL

export const DetectExit = async (
  documento: string
): Promise<'ok' | 'ya_registrado' | 'no_existe' | 'error'> => {

  if (!documento) return 'error'

  try {
    const response = await fetch(`${API}/api/registroSalidas/verificarSalida/${documento}`)

    // 🔴 IMPORTANTE: manejar 404 primero
    if (response.status === 404) {
      return 'no_existe'
    }

    if (!response.ok) {
      return 'error'
    }

    const data = await response.json()

    // ⚠️ validación defensiva (por si backend devuelve vacío o null)
    if (!data || typeof data.yaSalio === 'undefined') {
      return 'error'
    }

    if (!data.yaSalio) {
      return 'ok'
    }

    return 'ya_registrado'

  } catch (error) {
    console.error(error)
    return 'error'
  }
}
