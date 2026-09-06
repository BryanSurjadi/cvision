'use client'

import { useState } from 'react'
import Link from 'next/link'
import api from '@/lib/axios'
import { useAuth } from '@/lib/context/AuthContext'

type Role = 'candidate' | 'hr'

export default function RegisterPage() {
  const { login } = useAuth()
  const [role, setRole] = useState<Role>('candidate')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (role === 'hr' && (!company || !jobTitle)) {
      setError('Company and job title are required for HR accounts')
      return
    }

    setLoading(true)

    try {
      await api.post('/auth/register', {
        name,
        email,
        password,
        role,
        ...(role === 'hr' && { company, jobTitle })
      })
      await login(email, password)
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(err.response?.data?.message || 'Registration failed')
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'var(--background)' }}
    >
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1
            className="text-2xl font-semibold mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            Create your account
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Join CVision as a candidate or recruiter
          </p>
        </div>

        {/* Role toggle */}
        <div
          className="flex rounded-lg p-1 mb-6"
          style={{ background: 'var(--border)', }}
        >
          {(['candidate', 'hr'] as Role[]).map((r) => (
            <button
              key={r}
              onClick={() => { setRole(r); setError('') }}
              className="flex-1 py-2 text-sm font-medium rounded-md transition-all"
              style={{
                background: role === r ? 'var(--surface)' : 'transparent',
                color: role === r ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: role === r ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              {r === 'candidate' ? 'Job Seeker' : 'Recruiter / HR'}
            </button>
          ))}
        </div>

        {error && (
          <div
            className="rounded-lg px-4 py-3 mb-6 text-sm"
            style={{
              background: 'var(--danger-light)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger)'
            }}
          >
            {error}
          </div>
        )}

        <div className="card space-y-4">

          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input"
              required
            />
          </div>

          {role === 'hr' && (
            <>
              <div>
                <label className="label">Company</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. HR Manager"
                  className="input"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your password"
              className="input"
              required
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full py-2.5 mt-2"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

        </div>

        <p
          className="text-center text-sm mt-6"
          style={{ color: 'var(--text-secondary)' }}
        >
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium"
            style={{ color: 'var(--brand)' }}
          >
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}