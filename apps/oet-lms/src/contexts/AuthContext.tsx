import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import * as api from '../api/client'

interface AuthContextType {
  user: api.User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<api.User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const me = await api.fetchMe()
    setUser(me)
  }, [])

  useEffect(() => {
    let cancelled = false
    api.fetchMe().then((me) => {
      if (!cancelled) setUser(me)
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: u } = await api.login(email, password)
    api.setToken(token)
    setUser(u)
  }, [])

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const { token, user: u } = await api.register(email, password, name)
    api.setToken(token)
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    api.clearToken()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
