import axios from 'axios'
import Cookies from 'js-cookie'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
})

// attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// handle token expiry automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      try {
        const refreshToken = Cookies.get('refreshToken')
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          { refreshToken }
        )

        const newToken = res.data.data.accessToken
        Cookies.set('accessToken', newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return axios(original)
      } catch {
        Cookies.remove('accessToken')
        Cookies.remove('refreshToken')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api