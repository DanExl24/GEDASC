/**
 * httpClient.ts
 * Cliente HTTP centralizado con detección automática de token expirado.
 * Cuando el servidor devuelve 401 (Unauthorized) o el token JWT ha expirado,
 * limpia la sesión y redirige al login sin intervención del usuario.
 */

import { useAuthStore } from '@/stores/auth'
import router from '@/router'

// ─────────────────────────────────────────────
// Utilidades JWT
// ─────────────────────────────────────────────

/**
 * Decodifica el payload de un JWT sin verificar firma (solo lectura client-side).
 * Retorna null si el token está malformado.
 */
export const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const base64 = token.split('.')[1]
    if (!base64) return null
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

/**
 * Retorna true si el token JWT ya expiró (comparando 'exp' con la hora actual).
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeJwtPayload(token)
  if (!payload || typeof payload.exp !== 'number') return false
  // exp está en segundos, Date.now() en milisegundos
  return Date.now() >= payload.exp * 1000
}

// ─────────────────────────────────────────────
// Logout + redirect centralizado
// ─────────────────────────────────────────────

/**
 * Cierra sesión y redirige al login.
 * Acepta un mensaje opcional para mostrar como query param (usado en el login para
 * presentar un aviso al usuario).
 */
export const forceLogout = (reason: 'expired' | 'unauthorized' = 'expired') => {
  const auth = useAuthStore()
  auth.logout()
  router.replace({ name: 'login', query: { reason } })
}

// ─────────────────────────────────────────────
// Cliente HTTP con interceptor de 401
// ─────────────────────────────────────────────

type ApiEnvelope<T> = {
  success: boolean
  data?: T
  message?: string
}

/**
 * Wrapper sobre fetch() que:
 * 1. Comprueba si el token expiró ANTES de hacer la petición.
 * 2. Si el servidor devuelve 401, fuerza el logout.
 * 3. En ambos casos redirige al login automáticamente.
 */
export const fetchWithAuth = async <T>(
  path: string,
  token: string,
  method = 'GET',
  body?: unknown
): Promise<T> => {
  // 1. Verificación previa de expiración
  if (token && isTokenExpired(token)) {
    forceLogout('expired')
    throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.')
  }

  const options: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }

  if (body !== undefined) {
    options.body = JSON.stringify(body)
  }

  const baseUrl = (await import('@/config/network')).API_URL
  const response = await fetch(`${baseUrl}${path}`, options)

  // 2. Interceptar 401 del servidor (token inválido o expirado según el backend)
  if (response.status === 401) {
    forceLogout('unauthorized')
    throw new Error('Sesión no válida. Por favor inicia sesión nuevamente.')
  }

  const payload = (await response.json()) as ApiEnvelope<T>

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || 'Error en la petición al servidor')
  }

  return payload.data as T
}
