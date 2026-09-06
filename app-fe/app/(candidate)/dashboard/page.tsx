'use client'

import { useEffect, useState } from "react"
import ProtectedRoute from "@/components/layout/ProtectedRoute"
import api from "@/lib/axios"
import { Submission } from "@/types"
import Link from "next/link"
import { useAuth } from '@/lib/context/AuthContext'


const scoreBand = (score: number) => {
  if (score >= 80) return { color: '#16a34a', stroke: '#22c55e' }
  if (score >= 60) return { color: '#2563eb', stroke: '#3b82f6' }
  if (score >= 40) return { color: '#d97706', stroke: '#f59e0b' }
  return { color: '#dc2626', stroke: '#ef4444' }
}

export default function DashboardPage () {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect (() => {
    const fetchSubmissions = async () => {
      try {
        const res = await api.post('/submission/mine')
        setSubmissions(res.data.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchSubmissions()
  },[])


  return (
    <ProtectedRoute allowedRoles = {['candidate']}>
      <div className="min-h-screen  p-8">
        <div className="max-w-6xl mx-auto py-12">
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Submissions</h1>
              <p className="text-gray-500 mt-1">Track your CV submissions and their status</p>
            </div>
            <Link
              href="/submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md text-sm transition-colors"
            >
              Submit New CV
            </Link>
          </div>

          {loading ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</p>
          ) : submissions.length === 0 ? (
            <div className="card text-center py-16">
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                You haven&apos;t submitted any CVs yet.
              </p>
              <link href='/submit' className="btn-primary">
                Submit your first CV
              </link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {submissions.map((sub) => {
                const score = sub.analysisResult?.atsScore
                const band = score !== undefined ? scoreBand(score) : null
                const r = 22
                const circ = 2 * Math.PI * r
                const offset = score !== undefined ? circ - (score / 100) * circ : circ

                return (
                  <Link
                    key={sub.id}
                    href={`/submission/${sub.id}`}
                    className="rounded-xl p-5 transition-all"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--brand)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  >
                    {/* Top row — avatar + name + score ring */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar initials */}
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold text-white shrink-0"
                          style={{ background: 'var(--brand)' }}
                        >
                          {user?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {sub.targetRole}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {new Date(sub.submittedAt).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'short', day: 'numeric'
                            })}
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

                    {/* Divider + status */}
                    <div
                      className="pt-3 flex items-center justify-between"
                      style={{ borderTop: '1px solid var(--border)' }}
                    >
                      <span className={`badge-${sub.status}`}>
                        {(sub.status.charAt(0).toUpperCase() + sub.status.slice(1))}
                      </span>
                      <span
                        className="text-xs font-medium"
                        style={{ color: 'var(--brand)' }}
                      >
                        View details →
                      </span>
                    </div>

                  </Link>
                )
              })}
            </div>
          )}

        </div>
      </div>

    </ProtectedRoute>

  )
}