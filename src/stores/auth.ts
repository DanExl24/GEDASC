import { defineStore } from 'pinia'
import { apiFetch, setMemoryCsrfToken } from '@/Services/apiClient'

export type AuthUser = {
  id: string
  email: string
  rol: 'ADMIN' | 'CELADOR'
}

type SessionResponse = {
  success: boolean
  data?: {
    user: AuthUser
    csrfToken?: string
  }
}

let inFlightInit: Promise<void> | null = null

const clearLegacyLocalStorage = () => {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUser | null,
    initialized: false,
  }),

  getters: {
    isAdmin: (state) => state.user?.rol === 'ADMIN',
    isCelador: (state) => state.user?.rol === 'CELADOR',
    isAuthenticated: (state) => !!state.user,
  },

  actions: {
    setSession(user: AuthUser, csrfToken?: string | null) {
      this.user = user
      this.initialized = true
      setMemoryCsrfToken(csrfToken ?? null)
      clearLegacyLocalStorage()
    },

    clearSession() {
      this.user = null
      setMemoryCsrfToken(null)
      clearLegacyLocalStorage()
    },

    async logout() {
      try {
        await apiFetch('/api/auth/logout', { method: 'POST' })
      } catch (err) {
        console.error('Error al cerrar sesión en el servidor:', err)
      } finally {
        this.clearSession()
        this.initialized = true
      }
    },

    async init(force = false) {
      if (this.initialized && !force) {
        return
      }

      if (inFlightInit && !force) {
        return inFlightInit
      }

      clearLegacyLocalStorage()

      inFlightInit = (async () => {
        try {
          const response = await apiFetch('/api/auth/me', { method: 'GET' })
          if (!response.ok) {
            this.clearSession()
            return
          }

          const payload = (await response.json()) as SessionResponse
          if (payload.success && payload.data?.user) {
            this.setSession(payload.data.user, payload.data.csrfToken)
          } else {
            this.clearSession()
          }
        } catch {
          this.clearSession()
        } finally {
          this.initialized = true
          inFlightInit = null
        }
      })()

      return inFlightInit
    },
  },
})
