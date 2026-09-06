'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '../axios'
import { setTokens, clearTokens, isAuthenticated, getRole } from '../auth'

interface User {
  id: string
  name: string
  email: string
  role: 'candidate' | 'hr' | 'admin'
  company?: string
  jobTitle?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticated()){
        try {
          const res = await api.get('/auth/me')
          setUser(res.data.data)
        } catch {
          clearTokens()
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    console.log(email, password)
    const res = await api.post('/auth/login', { email, password })
    const { accessToken, refreshToken, user } = res.data.data
    setTokens(accessToken, refreshToken)
    setUser(user)

    if (user.role === 'admin') router.push('/admin/dashboard')
    else if (user.role === 'hr') router.push('/candidates')
    else router.push('/dashboard')
  }

  const logout = () => {
    clearTokens()
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )

}

export const useAuth = () => useContext(AuthContext)