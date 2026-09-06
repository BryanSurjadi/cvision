import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

interface TokenPayload {
  userId: string
  role: 'candidate' | 'hr' | 'admin'
  exp: number
}

export const getToken = () => Cookies.get('accessToken')

export const setTokens = (accessToken: string, refreshToken: string) => {
  Cookies.set('accessToken', accessToken, { expires: 1 })
  Cookies.set('refreshToken', refreshToken, { expires: 7 })
}

export const clearTokens = () => {
  Cookies.remove('accessToken')
  Cookies.remove('refreshToken')
}

export const getUser = (): TokenPayload | null => {
  const token = getToken()
  if (!token) return null
  try {
    return jwtDecode<TokenPayload>(token)
  } catch {
    return null
  }
}

export const isAuthenticated = (): boolean => {
  const user = getUser()
  if (!user) return false
  return user.exp * 1000 > Date.now()
}

export const getRole = (): string | null => {
  const user = getUser()
  return user?.role || null
}