'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import api from '@/lib/axios'

interface User {
  id: string
  name: string
  email: string
  company: string
  jobTitle: string
  role: 'candidate' | 'hr' | 'admin'
  isActive: boolean
  createdAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [generatedPassword, setGeneratedPassword] = useState('')

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users')
      setUsers(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreateHr = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCreating(true)

    if (!name || !email) {
      setError('Name and email are required')
      setCreating(false)
      return
    }

    try {
      const res = await api.post('/users/hr', { name, email, company, jobTitle })
      setGeneratedPassword(res.data.password || '')
      setSuccess(`HR account created for ${name}`)
      setName('')
      setEmail('')
      setCompany('')
      setJobTitle('')
      fetchUsers()
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(err.response?.data?.message || 'Failed to create HR account')
    } finally {
      setCreating(false)
    }
  }

  const handleDeactivate = async (id: string) => {
    try {
      await api.put(`/users/${id}/deactivate`)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: false } : u))
    } catch (err) {
      console.error(err)
    }
  }

  const handleReactivate = async (id: string) => {
    try {
      await api.put(`/users/${id}/reactivate`)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: true } : u))
    } catch (err) {
      console.error(err)
    }
  }

  const roleLabel: Record<string, string> = {
    candidate: 'Candidate',
    hr: 'HR',
    admin: 'Admin'
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        <div className="max-w-6xl mx-auto py-12">

          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="section-label">Admin</p>
              <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                User Management
              </h1>
            </div>
            <button
              onClick={() => { setShowModal(true); setSuccess(''); setGeneratedPassword('') }}
              className="btn-primary"
            >
              + Create HR Account
            </button>
          </div>

          {/* Users table */}
          {loading ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</p>
          ) : (
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--background)' }}>
                      {['User', 'Role', 'Company', 'Job Title', 'Status', 'Joined', 'Action'].map((h, i) => (
                        <th
                          key={i}
                          className="text-left px-4 py-3 whitespace-nowrap"
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            color: 'var(--text-muted)'
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, i) => (
                      <tr
                        key={user.id}
                        style={{
                          borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none',
                          opacity: user.isActive ? 1 : 0.6
                        }}
                      >
                        {/* User */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold text-white shrink-0"
                              style={{ background: user.isActive ? 'var(--brand)' : 'var(--text-muted)' }}
                            >
                              {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                {user.name}
                              </p>
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-4 py-3">
                          <span
                            className="text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap"
                            style={{
                              background: 'var(--brand-light)',
                              color: 'var(--brand)'
                            }}
                          >
                            {roleLabel[user.role]}
                          </span>
                        </td>

                        {/* Company */}
                        <td className="px-4 py-3">
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {user.company || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                          </p>
                        </td>

                        {/* Job Title */}
                        <td className="px-4 py-3">
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {user.jobTitle || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span className={user.isActive ? 'badge-verified' : 'badge-rejected'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        {/* Joined */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })}
                          </p>
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3">
                          {user.role !== 'admin' && (
                            user.isActive ? (
                              <button
                                onClick={() => handleDeactivate(user.id)}
                                className="text-xs font-medium transition-colors"
                                style={{ color: 'var(--danger)' , cursor: 'pointer'}}
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReactivate(user.id)}
                                className="text-xs font-medium transition-colors"
                                style={{ color: 'var(--success)', cursor: 'pointer' }}
                              >
                                Reactivate
                              </button>
                            )
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Create HR Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="card w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <h2
              className="text-base font-semibold mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              Create HR Account
            </h2>
            <p className="text-xs mb-6" style={{ color: 'var(--text-secondary)' }}>
              A password will be auto-generated and shown once.
            </p>

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

            {success && generatedPassword && (
              <div
                className="rounded-lg px-4 py-3 mb-4 text-sm"
                style={{
                  background: 'var(--success-light)',
                  border: '1px solid var(--success-border)',
                  color: 'var(--success)'
                }}
              >
                <p className="font-medium mb-1">{success}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Generated password:{' '}
                  <span
                    className="font-mono font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {generatedPassword}
                  </span>
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Share this with the HR user. It won&apos;t be shown again.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Smith"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@company.com"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Company</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Company XYZ"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="HR Staff"
                  className="input"
                />
              </div>


              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Close
                </button>
                <button
                  onClick={handleCreateHr}
                  disabled={creating}
                  className="btn-primary flex-1"
                >
                  {creating ? 'Creating...' : 'Create account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </ProtectedRoute>
  )
}