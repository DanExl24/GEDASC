import { defineStore } from 'pinia'
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

      if (t) this.token = t
      if (u) this.user = JSON.parse(u)
    }
  }
})
