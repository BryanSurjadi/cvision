'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import api from '@/lib/axios'
import { Submission } from '@/types'
import { useAuth } from '@/lib/context/AuthContext'


const scoreBand = (score: number) => {
  if (score >= 80) return { label: 'Great match', color: '#16a34a', stroke: '#22c55e' }
  if (score >= 60) return { label: 'Good match', color: '#2563eb', stroke: '#3b82f6' }
  if (score >= 40) return { label: 'Fair match', color: '#d97706', stroke: '#f59e0b' }
  return { label: 'Poor match', color: '#dc2626', stroke: '#ef4444' }
}

const statusStyles: Record<string, string> = {
  verified: 'bg-green-50 text-green-700 border border-green-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
}

export default function SubmissionDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [submitting, setSubmitting] = useState(false)



  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.post(`/submission/${id}`)
        setSubmission(res.data.data)

        if (user?.role === 'hr') {
          try {
            const bookmarkRes = await api.get('/bookmarks')
            const ids = new Set(bookmarkRes.data.data.map((b: any) => b.submissionId))// eslint-disable-line @typescript-eslint/no-explicit-any
            setIsBookmarked(ids.has(id))
          } catch {}
        }
      } catch {
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const toggleBookmark = async (submissionId: string) => {
    try {
      if (isBookmarked) {
        await api.delete(`/bookmarks/${submissionId}`)
        setIsBookmarked(false)
      } else {
        await api.post(`/bookmarks/${submissionId}`)
        setIsBookmarked(true)
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

  const handleReject = async (submissionId:string) => {
    if (!rejectionReason.trim()) return

    setSubmitting(true)
    try {
      await api.post(`/submission/${submissionId}/reject`, {
        rejectionReason: rejectionReason
      })
      setShowRejectModal(false)
      router.push('/admin/dashboard')
    } catch (err) {
      console.error(err)
      alert('Failed to reject submission')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerify = async (submissionId:string) => {
    setSubmitting(true)
    try {
      await api.post(`/submission/${submissionId}/verify`)
      setShowVerifyModal(false)
      // Redirect back to admin dashboard after successful verification
      router.push('/admin/dashboard')
    } catch (err) {
      console.error(err)
      alert('Failed to verify submission')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['candidate', 'hr', 'admin']}>
        <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center">
          <p className="text-sm text-gray-400 tracking-wide">Loading analysis...</p>
        </div>
      </ProtectedRoute>
    )
  }

  if (!submission?.analysisResult) {
    return (
      <ProtectedRoute allowedRoles={['candidate','hr', 'admin']}>
        <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center">
          <p className="text-sm text-gray-400">Submission not found.</p>
        </div>
      </ProtectedRoute>
    )
  }

  const a = submission.analysisResult
  const band = scoreBand(a.atsScore)
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ - (a.atsScore / 100) * circ

  return (
    <ProtectedRoute allowedRoles={['candidate','hr', 'admin']}>
      <div className="min-h-screen">
        <div className="max-w-6xl card mx-auto my-12">

          <button
            onClick={() => router.back()}
            className="btn-secondary px-4 py-2 mb-4"
          >
            ← Back to dashboard
          </button>
          

          <div className="flex items-start justify-between mb-10">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Target Role</p>
              <h1 className="text-2xl font-semibold text-[#0A0A0A]">{submission.targetRole}</h1>
              <p className="text-sm text-gray-400 mt-1">
                Submitted {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusStyles[submission.status]}`}>
              {(submission.status.charAt(0).toUpperCase() + submission.status.slice(1))}
            </span>
          </div>

          {/* Rejection reason */}
          {submission.status === 'rejected' && submission.rejectionReason && (
            <div className="border border-red-200 bg-red-50 rounded-lg px-4 py-3 mb-8 text-sm text-red-600">
              <span className="font-medium">Reason: </span>{submission.rejectionReason}
            </div>
          )}

          {/* HR View only */}
          {user?.role === 'hr' && (
            <div className="flex items-center gap-3 mb-8 rounded-xl">
              <button onClick={() => toggleBookmark(submission.id)}  className="btn-secondary flex items-center gap-2" style={{ color: isBookmarked ? 'var(--brand)' : 'var(--text-muted)', borderColor: isBookmarked ? 'var(--brand)' : undefined }}>
                <svg className="w-3.5 h-3.5" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4.5L5 21V5z" />
                </svg>
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </button>

              <button onClick={() => handleDownload(submission.id, submission.cvFilename)} className="btn-secondary flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download CV
              </button>

              <a href={`mailto:${submission.candidate?.email}`} className="btn-secondary flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email candidate
              </a>
            </div>
          )}

          {/* Admin view only */}
          {user?.role === 'admin' && (
            <div className="flex items-center justify-between gap-3 mb-8">
              {/* Reject Button (Red X) */}
              <button onClick={() => setShowRejectModal(true)} 
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors"
              >
                Reject
                {/* X Icon */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Verify Button (Green Checkmark / V) */}
              <button onClick={() => setShowVerifyModal(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[#0000c9] bg-[#8ec5ff] border border-[#2563EB] rounded-lg hover:bg-[#2563EB] hover:text-[#ffffff] transition-colors"
              >
                Verify
                {/* Checkmark / V Icon */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>

            
          )}

          {/* Score hero */}
          <div className="flex items-center gap-10 mb-12 pb-10 border-b border-[#E8E8E4]">
            <div className="relative shrink-0">
              <svg width="128" height="128" className="-rotate-90">
                <circle cx="64" cy="64" r={r} fill="none" stroke="#E8E8E4" strokeWidth="7" />
                <circle
                  cx="64" cy="64" r={r}
                  fill="none"
                  stroke={band.stroke}
                  strokeWidth="7"
                  strokeDasharray={circ}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-[#0A0A0A] tabular-nums">{a.atsScore}</span>
                <span className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: band.color }}>
                  {band.label}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Summary</p>
              <p className="text-sm text-gray-600 leading-relaxed">{a.overallSummary}</p>
              <p className="text-xs text-gray-400 mt-3">
                Experience level — <span className="text-gray-600 capitalize">{a.experienceLevel.replace('_', ' ')}</span>
              </p>
            </div>
          </div>

          

          {/* Skills */}
          <section className="mb-10">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Skills</p>
            <div className="flex flex-wrap gap-2">
              {a.extractedSkills.map((skill, i) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1.5 rounded-md bg-white border border-[#E8E8E4] text-gray-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

          <div className="border-t border-[#E8E8E4] mb-10" />

          {/* Experience */}
          <section className="mb-10">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">Experience</p>
            <div className="space-y-6">
              {a.extractedExperience.map((exp, i) => (
                <div key={i}>
                  <div className="flex items-baseline justify-between mb-1">
                    <p className="text-sm font-medium text-[#0A0A0A]">{exp.role}</p>
                    <p className="text-xs text-gray-400">{exp.duration}</p>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{exp.company}</p>
                  <ul className="space-y-1">
                    {exp.highlights.map((h, j) => (
                      <li key={j} className="text-sm text-gray-500 flex gap-2">
                        <span className="text-gray-300 mt-0.5">—</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <div className="border-t border-[#E8E8E4] mb-10" />

          {/* Education */}
          <section className="mb-10">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">Education</p>
            <div className="space-y-4">
              {a.extractedEducation.map((edu, i) => (
                <div key={i} className="flex items-baseline justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#0A0A0A]">{edu.institution}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{edu.degree}{edu.gpa && ` · GPA ${edu.gpa}`}</p>
                  </div>
                  <p className="text-xs text-gray-400">{edu.year}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="border-t border-[#E8E8E4] mb-10" />

          {/* Strengths & Weaknesses */}
          <section className="mb-10">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Strengths</p>
                <ul className="space-y-2">
                  {a.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-green-400 mt-0.5">+</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Weaknesses</p>
                <ul className="space-y-2">
                  {a.weaknesses.map((w, i) => (
                    <li key={i} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-red-400 mt-0.5">−</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <div className="border-t border-[#E8E8E4] mb-10" />

          {/* Recommendation */}
          <section>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Recommendation</p>
            <p className="text-sm text-gray-600 leading-relaxed">{a.recommendation}</p>
          </section>

        </div>
      </div>

      {/* --- REJECT MODAL --- */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Reject Submission</h3>
            <p className="text-sm text-gray-500">Please provide a reason for rejecting this candidate&apos;s CV.</p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Missing required technical certifications..."
              className="w-full h-24 p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(submission.id)}
                disabled={!rejectionReason.trim() || submitting}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- VERIFY MODAL --- */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Approve Candidate</h3>
            <p className="text-sm text-gray-500">
              Are you sure you want to verify this candidate? They will become visible in the HR discovery pool.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerify(submission.id)}
                disabled={submitting}
                className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {submitting ? 'Verifying...' : 'Confirm Verification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  )
}