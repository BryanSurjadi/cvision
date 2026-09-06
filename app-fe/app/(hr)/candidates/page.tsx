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

export default function HRCandidatesPage() {
  const router = useRouter()
  const [candidates, setCandidates] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [minScore, setMinScore] = useState('')
  const [maxScore, setMaxScore] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchCandidates = async ( p = 1) => {
    setLoading(true)
    try {
      const res = await api.get('/candidates', {
        params: {
          role: search || undefined,
          experienceLevel: experienceLevel || undefined,
          minScore: minScore ? Number(minScore) : undefined,
          maxScore: maxScore ? Number(maxScore) : undefined,
          page: p,
          limit: 10
        }
      })
      setCandidates(res.data.data)
      setTotalPages(res.data.pagination?.totalPages || 1)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchBookmarks = async () => {
    try {
      const res = await api.get('/bookmarks')
      const ids = new Set<string>(
        res.data.data.map((b: any) => b.submissionId)// eslint-disable-line @typescript-eslint/no-explicit-any
      )
      setBookmarked(ids)
    } catch {
      // silent
    }
  }

  useEffect(() => {
    fetchCandidates()
    fetchBookmarks()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchCandidates(1)
  }

  const handleReset = () => {
    setSearch('')
    setExperienceLevel('')
    setMinScore('')
    setMaxScore('')
    setPage(1)
    fetchCandidates(1)
  }

  const toggleBookmark = async (submissionId: string) => {
    try {
      if (bookmarked.has(submissionId)) {
        await api.delete(`/bookmarks/${submissionId}`)
        setBookmarked(prev => { const s = new Set(prev); s.delete(submissionId); return s })
      } else {
        await api.post(`/bookmarks/${submissionId}`)
        setBookmarked(prev => new Set(prev).add(submissionId))
      }
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
        <div className="max-w-6xl mx-auto py-12">

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="section-label">Talent Pool</p>
              <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Candidates
              </h1>
            </div>
          </div>

          {/* Search + Filters */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="flex gap-3 mb-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by role, e.g. Backend Developer"
                className="input"
              />
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary px-4 shrink-0 flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                Filters
                {(experienceLevel || minScore || maxScore) && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--brand)' }}
                  />
                )}
              </button>
              <button type="submit" className="btn-primary px-6 shrink-0">
                Search
              </button>
            </form>

            {/* Filter panel */}
            {showFilters && (
              <div
                className="rounded-xl p-4 grid grid-cols-3 gap-4"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)'
                }}
              >
                {/* Experience level */}
                <div>
                  <label className="label">Experience Level</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="input"
                  >
                    <option value="">All levels</option>
                    <option value="fresh_graduate">Fresh Graduate</option>
                    <option value="junior">Junior</option>
                    <option value="mid">Mid</option>
                    <option value="senior">Senior</option>
                  </select>
                </div>

                {/* Min score */}
                <div>
                  <label className="label">Min ATS Score</label>
                  <input
                    type="number"
                    value={minScore}
                    onChange={(e) => setMinScore(e.target.value)}
                    placeholder="e.g. 60"
                    min={0}
                    max={100}
                    className="input"
                  />
                </div>

                {/* Max score */}
                <div>
                  <label className="label">Max ATS Score</label>
                  <input
                    type="number"
                    value={maxScore}
                    onChange={(e) => setMaxScore(e.target.value)}
                    placeholder="e.g. 100"
                    min={0}
                    max={100}
                    className="input"
                  />
                </div>

                {/* Reset */}
                <div className="col-span-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    Reset filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          {loading ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</p>
          ) : candidates.length === 0 ? (
            <div className="card text-center py-16">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                No candidates found.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {candidates.map((sub) => {
                  const score = sub.analysisResult?.atsScore
                  const band = score !== undefined ? scoreBand(score) : null
                  const r = 22
                  const circ = 2 * Math.PI * r
                  const offset = score !== undefined ? circ - (score / 100) * circ : circ
                  const isBookmarked = bookmarked.has(sub.id)

                  return (
                    <div
                      key={sub.id}
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
                          {/* Bookmark */}
                          <button
                            onClick={() => toggleBookmark(sub.id)}
                            className="p-1.5 rounded-md transition-colors"
                            style={{
                              color: isBookmarked ? 'var(--brand)' : 'var(--text-muted)',
                              background: isBookmarked ? 'var(--brand-light)' : 'transparent',
                              border: '1px solid var(--border)'
                            }}
                            title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                          >
                            <svg className="w-3.5 h-3.5" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4.5L5 21V5z" />
                            </svg>
                          </button>

                          {/* Download */}
                          <button
                            onClick={() => handleDownload(sub.id, sub.cvFilename)}
                            className="p-1.5 rounded-md transition-colors"
                            style={{
                              color: 'var(--text-muted)',
                              border: '1px solid var(--border)'
                            }}
                            title="Download CV"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                        </div>

                        <button
                          onClick={() => router.push(`/submission/${sub.id}`)}
                          className="text-xs font-medium"
                          style={{ color: 'var(--brand)' }}
                        >
                          View profile →
                        </button>
                      </div>

                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => { setPage(p => p - 1); fetchCandidates(page - 1) }}
                    disabled={page === 1}
                    className="btn-secondary px-4 py-1.5 text-xs disabled:opacity-40"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => { setPage(p => p + 1); fetchCandidates(page + 1) }}
                    disabled={page === totalPages}
                    className="btn-secondary px-4 py-1.5 text-xs disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </ProtectedRoute>
  )
}