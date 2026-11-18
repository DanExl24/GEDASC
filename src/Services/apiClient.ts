import { API_URL } from '@/config/network'

const CSRF_COOKIE_NAME = 'gedasc_csrf'
const CSRF_HEADER_NAME = 'X-CSRF-Token'
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

let memoryCsrfToken: string | null = null

export const setMemoryCsrfToken = (token: string | null) => {
  memoryCsrfToken = token
}

const readCookie = (name: string): string | null => {
  if (typeof document === 'undefined' || !document.cookie) {
    return null
  }

  for (const part of document.cookie.split(';')) {
    const separatorIndex = part.indexOf('=')
    if (separatorIndex === -1) continue

    const cookieName = part.slice(0, separatorIndex).trim()
    if (cookieName !== name) continue

    const rawValue = part.slice(separatorIndex + 1).trim()
    try {
      return decodeURIComponent(rawValue)
    } catch {
      return rawValue
    }
  }

  return null
}

export const getCsrfToken = (): string | null =>
  readCookie(CSRF_COOKIE_NAME) ?? memoryCsrfToken

const resolveUrl = (input: string): string => {
  if (/^https?:\/\//i.test(input)) {
    return input
  }
  const normalizedPath = input.startsWith('/') ? input : `/${input}`
  return `${API_URL}${normalizedPath}`
}

export const apiFetch = (input: string, init: RequestInit = {}): Promise<Response> => {
  const method = (init.method ?? 'GET').toUpperCase()
  const headers = new Headers(init.headers)

  if (MUTATING_METHODS.has(method)) {
    const csrfToken = getCsrfToken()
    if (csrfToken && !headers.has(CSRF_HEADER_NAME)) {
      headers.set(CSRF_HEADER_NAME, csrfToken)
    }
  }

  return fetch(resolveUrl(input), {
    ...init,
    credentials: 'include',
    headers,
  })
}
