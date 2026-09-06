'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: ('candidate' | 'hr' | 'admin')[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
        return
      }
      if (!allowedRoles.includes(user.role)) {
        if (user.role === 'admin') router.push('/admin/dashboard')
        else if (user.role === 'hr') router.push('/candidates')
        else router.push('/dashboard')
      }
    }
  }, [user, loading, router, allowedRoles])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!user || !allowedRoles.includes(user.role)) return null

  return <>{children}</>
}