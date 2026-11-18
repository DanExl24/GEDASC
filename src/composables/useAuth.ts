import { apiFetch } from '@/Services/apiClient'
import { useAuthStore, type AuthUser } from '@/stores/auth'

type LoginResponse = {
  success: boolean
  data?: {
    user: AuthUser
    csrfToken?: string
  }
  message?: string
}

export const useAuth = () => {
  const auth = useAuthStore()

  const login = async (email: string, password: string) => {
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = (await res.json()) as LoginResponse

      if (!res.ok || !data.success || !data.data?.user) {
        return false
      }

      auth.setSession(data.data.user, data.data.csrfToken)
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  const logout = async () => {
    await auth.logout()
  }

  const hasRole = (roles: ('ADMIN' | 'CELADOR')[]) => {
    return auth.user ? roles.includes(auth.user.rol) : false
  }

  return {
    login,
    logout,
    hasRole,
    auth,
  }
}
