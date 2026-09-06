'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import { useAuth } from '@/lib/context/AuthContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import api from '@/lib/axios'

interface Stats {
  totalCandidates: number
  totalVerified: number
  totalPending: number
  totalHr: number
  avgAtsScore: number
}

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats')
        setStats(res.data.data)
      } catch {
        // silent fail
      }
    }
    fetchStats()
  }, [])

  const quickAction = () => {
    if (user?.role === 'candidate') return { label: 'Submit your CV', href: '/submit' }
    if (user?.role === 'hr') return { label: 'Search candidates', href: '/candidates' }
    return { label: 'View pending queue', href: '/admin/pending' }
  }

  const secondaryAction = () => {
    if (user?.role === 'candidate') return { label: 'View my submissions', href: '/dashboard' }
    if (user?.role === 'hr') return { label: 'Saved candidates', href: '/hr/saved' }
    return { label: 'Manage users', href: '/admin/users' }
  }

  const action = quickAction()
  const secondary = secondaryAction()

  return (
    <ProtectedRoute allowedRoles={['candidate', 'hr', 'admin']}>
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>

        {/* Hero */}
        <section
          className="border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="max-w-6xl mx-auto py-16">
            <div className="flex gap-2 items-center justify-between">
              <div className='left-section'>
                <p className="section-label mb-4">
                  {user?.role === 'candidate' && 'For job seekers'}
                  {user?.role === 'hr' && 'For recruiters'}
                  {user?.role === 'admin' && 'Platform overview'}
                </p>
                <h1
                  className="text-4xl font-bold leading-tight mb-4"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {user?.role === 'candidate' && <>Your CV, analyzed.<br /><span style={{ color: 'var(--brand)'}}>Your talent, discovered.</span></>}
                  {user?.role === 'hr' && <>Find the right talent,<br /><span style={{ color: 'var(--brand)'}}>faster than ever.</span></>}
                  {user?.role === 'admin' && <>Platform at a glance.<br /><span style={{ color: 'var(--brand)'}}>Keeping things running!</span></>}
                </h1>
                <p
                  className="text-base mb-8 leading-relaxed max-w-125"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {user?.role === 'candidate' && 'Submit your CV and let our AI score and analyze it against your target role. Get verified and discovered by top HR recruiters.'}
                  {user?.role === 'hr' && 'Browse AI-verified candidates filtered by role, skills, and ATS score. Make data-driven hiring decisions with full analysis at your fingertips.'}
                  {user?.role === 'admin' && 'Review pending submissions, manage user accounts, and keep the talent pool accurate and up to date.'}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push(action.href)}
                    className="btn-primary px-5 py-2.5"
                  >
                    {action.label}
                  </button>
                  <button
                    onClick={() => router.push(secondary.href)}
                    className="btn-secondary px-5 py-2.5"
                  >
                    {secondary.label}
                  </button>
                </div>
              </div>
              <div className='right-section'>
                <Image src="/hero-img.jfif" alt="hero" width={840} height={500} className="rounded-2xl" />
              </div>
              
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="max-w-6xl mx-auto py-12">
          <p className="section-label mb-6">Platform stats</p>
          <div className="grid grid-cols-3 gap-4 mb-12">
            {[
              {
                label: 'Verified Candidates',
                value: stats?.totalVerified ?? '—',
                desc: 'Live in the talent pool'
              },
              {
                label: 'Avg ATS Score',
                value: stats ? `${stats.avgAtsScore}` : '—',
                desc: 'Across all submissions'
              },
              {
                label: user?.role === 'admin' ? 'Pending Review' : 'Total Candidates',
                value: user?.role === 'admin'
                  ? (stats?.totalPending ?? '—')
                  : (stats?.totalCandidates ?? '—'),
                desc: user?.role === 'admin'
                  ? 'Awaiting verification'
                  : 'Registered on platform'
              },
            ].map((stat, i) => (
              <div key={i} className="card">
                <p className="section-label mb-3">{stat.label}</p>
                <p
                  className="text-4xl font-bold tabular-nums mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {stat.value}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {stat.desc}
                </p>
              </div>
            ))}
          </div>

          <hr className="divider" />

          {/* Quick action card */}
          <div
            className="card flex items-center justify-between"
            style={{ background: 'var(--brand-light)', borderColor: '#BFDBFE' }}
          >
            <div>
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: 'var(--brand)' }}
              >
                {user?.role === 'candidate' && 'Ready to get discovered?'}
                {user?.role === 'hr' && 'Looking for your next hire?'}
                {user?.role === 'admin' && 'Submissions waiting for your review.'}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {user?.role === 'candidate' && 'Submit your CV and let AI do the heavy lifting.'}
                {user?.role === 'hr' && 'Browse verified candidates filtered by role and skills.'}
                {user?.role === 'admin' && 'Keep the talent pool accurate by reviewing pending CVs.'}
              </p>
            </div>
            <button
              onClick={() => router.push(action.href)}
              className="btn-primary shrink-0 ml-8"
            >
              {action.label} →
            </button>
          </div>
        </section>

      </div>
    </ProtectedRoute>
  )
}