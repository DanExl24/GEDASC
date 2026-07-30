const getDynamicApiUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    const envUrl = import.meta.env.VITE_API_URL
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl.replace(/\/+$/, '')
    }
    // Retornar origin actual (e.g. https://192.168.1.15:5173) para usar el proxy de Vite
    return window.location.origin
  }
  return 'http://localhost:3000'
}

export const API_URL = getDynamicApiUrl()
export const SOCKET_URL = API_URL
