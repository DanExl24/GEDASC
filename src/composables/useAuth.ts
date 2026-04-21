import { API_URL } from '@/config/network'
import { useAuthStore } from '@/stores/auth'

const API = API_URL

export const useAuth = () => {
  const auth = useAuthStore()

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!data.success) return false

      auth.setAuth(data.data.token, data.data.user)

      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  const logout = () => {
    auth.logout()
  }

  const hasRole = (roles: ('ADMIN' | 'CELADOR')[]) => {
    return auth.user ? roles.includes(auth.user.rol) : false
  }

  return {
    login,
    logout,
    hasRole,
    auth
  }
}
