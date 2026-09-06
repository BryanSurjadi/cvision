'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import api from '@/lib/axios'
import { useRouter } from 'next/navigation'
import { Submission } from '@/types'

interface Stats {
  totalCandidates: number
  totalVerified: number
  totalPending: number
  totalHr: number
  avgAtsScore: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [pending, setPending] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, pendingRes] = await Promise.all([
          api.get('/stats'),
          api.post('/submission/pending')
        ])
        setStats(statsRes.data.data)
        setPending(pendingRes.data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        <div className="max-w-6xl mx-auto py-12">

          <div className="mb-10">
            <p className="section-label">Admin</p>
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Dashboard
            </h1>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-4 gap-4 mb-12">
              {[
                { label: 'Total Candidates', value: stats.totalCandidates },
                { label: 'Verified', value: stats.totalVerified },
                { label: 'Pending', value: stats.totalPending },
                { label: 'Avg ATS Score', value: stats.avgAtsScore },
              ].map((stat, i) => (
                <div key={i} className="card">
                  <p className="section-label mb-2">{stat.label}</p>
                  <p
                    className="text-3xl font-bold tabular-nums"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          <hr className="divider" />

          {/* Pending queue */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Pending Verification
            </h2>
            <button
              onClick={() => router.push('/admin/pending')}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              View all →
            </button>
          </div>

          {loading ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</p>
          ) : pending.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                No pending submissions.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.slice(0, 5).map((sub) => (
                <div
                  key={sub.id}
                  className="card flex items-center justify-between py-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold text-white shrink-0"
                      style={{ background: 'var(--brand)' }}
                    >
                      {sub.candidate?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {sub.candidate?.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {sub.targetRole} · {new Date(sub.submittedAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/submission/${sub.id}`)}
                    className="btn-primary text-xs px-3 py-1.5"
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  )
}