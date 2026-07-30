const getDynamicApiUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname
    const envUrl = import.meta.env.VITE_API_URL
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl.replace(/\/+$/, '')
    }
    // El backend Express corre en HTTP en el puerto 3000
    return `http://${hostname}:3000`
  }
  return 'http://localhost:3000'
}

export const API_URL = getDynamicApiUrl()
export const SOCKET_URL = API_URL
