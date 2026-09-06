'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import { useAuth } from '@/lib/context/AuthContext'
import api from '@/lib/axios'
import { useRouter } from 'next/navigation'

interface CandidateStats {
  total: number
  verified: number
  avgAtsScore: number
}

interface HrStats {
  bookmarkCount: number
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<CandidateStats | HrStats | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/auth/profile-stats')
        setStats(res.data.data)
      } catch {
        // silent fail
      }
    }
    fetchStats()
  }, [])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirm) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      await api.put('/auth/change-password', { currentPassword, newPassword })
      setSuccess('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirm('')
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(err.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const roleLabel = {
    candidate: 'Job Seeker',
    hr: 'Recruiter / HR',
    admin: 'Platform Admin'
  }

  const candidateStats = user?.role === 'candidate' ? stats as CandidateStats : null
  const hrStats = user?.role === 'hr' ? stats as HrStats : null

  return (
    <ProtectedRoute allowedRoles={['candidate', 'hr', 'admin']}>
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        <div className="max-w-2xl mx-auto px-6 py-12">

          <p className="section-label mb-1">Account</p>
          <h1 className="text-2xl font-semibold mb-10" style={{ color: 'var(--text-primary)' }}>
            Profile
          </h1>

          {/* Profile info */}
          <div className="card mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold text-white shrink-0"
                style={{ background: 'var(--brand)' }}
              >
                {user?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {user?.name}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {user?.email}
                </p>
              </div>
            </div>

            <hr className="divider" style={{ margin: '0 0 20px 0' }} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="section-label mb-1">Role</p>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  {user?.role ? roleLabel[user.role] : '—'}
                </p>
              </div>
              <div>
                <p className="section-label mb-1">Account status</p>
                <span className="badge-verified">Active</span>
              </div>
            </div>
          </div>

          {/* Candidate stats */}
          {user?.role === 'candidate' && candidateStats && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Total Submissions', value: candidateStats.total },
                { label: 'Verified', value: candidateStats.verified },
                { label: 'Avg ATS Score', value: candidateStats.avgAtsScore },
              ].map((stat, i) => (
                <div key={i} className="card text-center">
                  <p className="text-2xl font-bold tabular-nums mb-1" style={{ color: 'var(--text-primary)' }}>
                    {stat.value}
                  </p>
                  <p className="section-label">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* HR stats */}
          {user?.role === 'hr' && (
            <div className="card mb-6">
              <p className="section-label mb-4">Recruiter Info</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="section-label mb-1">Saved Candidates</p>
                  <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                    {hrStats?.bookmarkCount ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="section-label mb-1">Member since</p>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {new Date().getFullYear()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Change password */}
          <div className="card mb-6">
            <h2 className="text-sm font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
              Change Password
            </h2>

            {error && (
              <div
                className="rounded-lg px-4 py-3 mb-4 text-sm"
                style={{
                  background: 'var(--danger-light)',
                  border: '1px solid var(--danger-border)',
                  color: 'var(--danger)'
                }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className="rounded-lg px-4 py-3 mb-4 text-sm"
                style={{
                  background: 'var(--success-light)',
                  border: '1px solid var(--success-border)',
                  color: 'var(--success)'
                }}
              >
                {success}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="label">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="label">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input"
                  placeholder="Min. 8 characters"
                />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="input"
                  placeholder="Repeat new password"
                />
              </div>
              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Updating...' : 'Update password'}
              </button>
            </div>
          </div>

          {/* Sign out */}
          <div className="card" style={{ borderColor: 'var(--danger-border)' }}>
            <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--danger)' }}>
              Sign out
            </h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
              You will be redirected to the login page.
            </p>
            <button
              onClick={logout}
              className="btn-secondary"
              style={{ color: 'var(--danger)', borderColor: 'var(--danger-border)' }}
            >
              Sign out
            </button>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  )
}