import { defineStore } from 'pinia'
import { isTokenExpired } from '@/Services/httpClient'

type User = {
  id: string
  email: string
  rol: 'ADMIN' | 'CELADOR'
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '' as string,
    user: null as User | null
  }),

  getters: {
    isAdmin: (state) => state.user?.rol === 'ADMIN',
    isCelador: (state) => state.user?.rol === 'CELADOR',
    isAuthenticated: (state) => !!state.token
  },

  actions: {
    setAuth(token: string, user: User) {
      this.token = token
      this.user = user

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    },

    logout() {
      this.token = ''
      this.user = null

      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    init() {
      const t = localStorage.getItem('token')
      const u = localStorage.getItem('user')

      if (t) {
        // Si el token ya expiró al cargar la app, limpiar inmediatamente.
        // La redirección la gestiona el guard del router después de montar la app.
        if (isTokenExpired(t)) {
          this.logout()
          return
        }
        this.token = t
      }
      if (u) this.user = JSON.parse(u)
    }
  }
})
