import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import {
  login as apiLogin,
  logout as apiLogout,
  getProfile,
} from '../services/api'

interface User {
  id: number
  username: string
  email: string
  [key: string]: unknown
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const authenticated = Boolean(localStorage.getItem('access'))

  const refreshUser = async () => {
    try {
      const profile = await getProfile()
      setUser(profile)
    } catch {
      apiLogout()
      setUser(null)
    }
  }

  useEffect(() => {
    if (!authenticated) {
      setLoading(false)
      return
    }

    refreshUser().finally(() => {
      setLoading(false)
    })
  }, [])

  const login = async (email: string, password: string) => {
    await apiLogin(email, password)
    await refreshUser()
  }

  const logout = () => {
    apiLogout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}