'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import api from '@/lib/axios'
import { Submission } from '@/types'
import { useRouter } from 'next/navigation'

const scoreBand = (score: number) => {
  if (score >= 80) return { color: '#16a34a', stroke: '#22c55e' }
  if (score >= 60) return { color: '#2563eb', stroke: '#3b82f6' }
  if (score >= 40) return { color: '#d97706', stroke: '#f59e0b' }
  return { color: '#dc2626', stroke: '#ef4444' }
}

interface Bookmark {
  id: string
  submissionId: string
  submission: Submission
}

export default function SavedPage() {
  const router = useRouter()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBookmarks = async () => {
    try {
      const res = await api.get('/bookmarks')
      setBookmarks(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookmarks()
  }, [])

  const removeBookmark = async (submissionId: string) => {
    try {
      await api.delete(`/bookmarks/${submissionId}`)
      setBookmarks(prev => prev.filter(b => b.submissionId !== submissionId))
    } catch (err) {
      console.error(err)
    }
  }

  const handleDownload = async (submissionId: string, filename: string) => {
    try {
      const res = await api.get(`/candidates/${submissionId}/cv`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['hr']}>
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        <div className="max-w-5xl mx-auto px-6 py-12">

          <div className="mb-8">
            <p className="section-label">HR</p>
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Saved Candidates
            </h1>
          </div>

          {loading ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</p>
          ) : bookmarks.length === 0 ? (
            <div className="card text-center py-16">
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                No saved candidates yet.
              </p>
              <button
                onClick={() => router.push('/hr/candidates')}
                className="btn-primary"
              >
                Browse candidates
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {bookmarks.map((bookmark) => {
                const sub = bookmark.submission
                const score = sub.analysisResult?.atsScore
                const band = score !== undefined ? scoreBand(score) : null
                const r = 22
                const circ = 2 * Math.PI * r
                const offset = score !== undefined ? circ - (score / 100) * circ : circ

                return (
                  <div
                    key={bookmark.id}
                    className="rounded-xl p-5"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold text-white shrink-0"
                          style={{ background: 'var(--brand)' }}
                        >
                          {sub.candidate?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {sub.candidate?.name}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {sub.targetRole}
                          </p>
                        </div>
                      </div>

                      {/* Score ring */}
                      {band && score !== undefined && (
                        <div className="relative shrink-0">
                          <svg width="52" height="52" className="-rotate-90">
                            <circle cx="26" cy="26" r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
                            <circle
                              cx="26" cy="26" r={r}
                              fill="none"
                              stroke={band.stroke}
                              strokeWidth="4"
                              strokeDasharray={circ}
                              strokeDashoffset={offset}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xs font-bold tabular-nums" style={{ color: band.color }}>
                              {score}
                            </span>
                            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>ATS</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Summary */}
                    {sub.analysisResult?.overallSummary && (
                      <p
                        className="text-xs leading-relaxed mb-4 line-clamp-2"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {sub.analysisResult.overallSummary}
                      </p>
                    )}

                    {/* Skills */}
                    {sub.analysisResult?.extractedSkills && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {sub.analysisResult.extractedSkills.slice(0, 3).map((skill, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 rounded-md"
                            style={{
                              background: 'var(--background)',
                              border: '1px solid var(--border)',
                              color: 'var(--text-secondary)'
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div
                      className="pt-3 flex items-center justify-between"
                      style={{ borderTop: '1px solid var(--border)' }}
                    >
                      <div className="flex items-center gap-2">
                        {/* Remove bookmark */}
                        <button
                          onClick={() => removeBookmark(sub.id)}
                          className="p-1.5 rounded-md transition-colors"
                          style={{
                            color: 'var(--brand)',
                            background: 'var(--brand-light)',
                            border: '1px solid var(--border)'
                          }}
                          title="Remove bookmark"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4.5L5 21V5z" />
                          </svg>
                        </button>

                        {/* Download */}
                        <button onClick={() => handleDownload(sub.id, sub.cvFilename)} className="p-1.5 rounded-md transition-colors" style={{ color: 'var(--text-muted)', border: '1px solid var(--border)'}} title="Download CV">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </div>

                      <button
                        onClick={() => router.push(`/submission/${sub.id}`)}
                        className="text-xs font-medium"
                        style={{ color: 'var(--brand)' }}>
                        View profile →
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  )
}