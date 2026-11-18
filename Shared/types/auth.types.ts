export type AuthRole = 'ADMIN' | 'CELADOR'

export interface AuthUser {
  id: string
  email: string
  rol: AuthRole
}

export interface AuthSessionPayload {
  user: AuthUser
  csrfToken: string
}

export interface ApiEnvelope<T = unknown> {
  success: boolean
  data?: T
  message?: string
}

export const AUTH_CONTRACT = {
  SESSION_COOKIE_NAME: 'gedasc_session',
  CSRF_COOKIE_NAME: 'gedasc_csrf',
  CSRF_HEADER_NAME: 'X-CSRF-Token',
  ENDPOINTS: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
} as const
