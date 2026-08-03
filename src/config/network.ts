const getDynamicApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname } = window.location
    if (protocol === 'https:') {
      return `https://api-${hostname}`
    }
    return `${protocol}//${hostname}:3000`
  }
  return 'http://localhost:3000'
}

export const API_URL = getDynamicApiUrl()
export const SOCKET_URL = API_URL
