const getDynamicApiUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:'
    const hostname = window.location.hostname
    const envUrl = import.meta.env.VITE_API_URL
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl.replace(/\/+$/, '')
    }
    return `${protocol}//${hostname}:3000`
  }
  return 'http://localhost:3000'
}

export const API_URL = getDynamicApiUrl()
export const SOCKET_URL = API_URL
