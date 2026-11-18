import type { CorsOptions } from 'cors'
import type { CookieOptions } from 'express'

export const SESSION_COOKIE_NAME = 'gedasc_session'
export const CSRF_COOKIE_NAME = 'gedasc_csrf'
export const CSRF_HEADER_NAME = 'X-CSRF-Token'
export const SESSION_TTL_MS = 24 * 60 * 60 * 1000
export const JWT_ALGORITHM = 'HS256' as const

const DEFAULT_DEV_ORIGINS = [
  'http://localhost:5173',
  'https://localhost:5173',
  'http://127.0.0.1:5173',
  'https://127.0.0.1:5173',
]

const normalizeOrigin = (origin: string) => origin.trim().replace(/\/+$/, '')

export const getAllowedOrigins = (): string[] => {
  const configured = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean)

  if (process.env.NODE_ENV === 'production') {
    return configured
  }

  return Array.from(new Set([...DEFAULT_DEV_ORIGINS, ...configured]))
}

export const isOriginAllowed = (origin?: string): boolean => {
  if (!origin) {
    return true
  }

  const normalized = normalizeOrigin(origin)
  return getAllowedOrigins().includes(normalized)
}

export const createCorsOptions = (): CorsOptions => ({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true)
      return
    }
    callback(new Error(`Origen no permitido por CORS: ${origin}`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', CSRF_HEADER_NAME],
})

const getSameSitePolicy = (): 'lax' | 'strict' | 'none' => {
  const raw = (process.env.COOKIE_SAME_SITE ?? 'lax').trim().toLowerCase()
  if (raw === 'strict' || raw === 'none' || raw === 'lax') {
    return raw
  }
  return 'lax'
}

const isCookieSecure = (sameSite: 'lax' | 'strict' | 'none'): boolean => {
  if (sameSite === 'none') {
    return true
  }

  if (process.env.COOKIE_SECURE === 'true') {
    return true
  }

  if (process.env.COOKIE_SECURE === 'false') {
    return false
  }

  return process.env.NODE_ENV === 'production'
}

export const getSessionCookieOptions = (): CookieOptions => {
  const sameSite = getSameSitePolicy()
  return {
    httpOnly: true,
    secure: isCookieSecure(sameSite),
    sameSite,
    path: '/',
    maxAge: SESSION_TTL_MS,
  }
}

export const getCsrfCookieOptions = (): CookieOptions => {
  const sameSite = getSameSitePolicy()
  return {
    httpOnly: false,
    secure: isCookieSecure(sameSite),
    sameSite,
    path: '/',
    maxAge: SESSION_TTL_MS,
  }
}

export const getClearSessionCookieOptions = (): CookieOptions => {
  const { maxAge: _ignored, ...rest } = getSessionCookieOptions()
  return rest
}

export const getClearCsrfCookieOptions = (): CookieOptions => {
  const { maxAge: _ignored, ...rest } = getCsrfCookieOptions()
  return rest
}
