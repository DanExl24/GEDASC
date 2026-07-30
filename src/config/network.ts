const getDynamicApiUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname
    return `http://${hostname}:3000`
  }
  return 'http://localhost:3000'
}

export const API_URL = getDynamicApiUrl()
export const SOCKET_URL = API_URL
