'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/layout/ProtectedRoute"
import api from "@/lib/axios"

export default function SubmitPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [targetRole, setTargetRole] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return
    if (selectedFile.type !== 'application/pdf') {
      setError('Only PDF files are allowed')
      return
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB')
      return
    }
    setError('')
    setFile(selectedFile)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileChange(e.dataTransfer.files[0])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { setError('PDF file is required'); return }
    if (!targetRole) { setError('Target role is required'); return }

    setError('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('cv', file)
      formData.append('targetRole', targetRole)

      const res = await api.post('/submission', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      router.push(`/submission/${res.data.data.submission.id}`)
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(err.response?.data?.message || 'Submission failed')
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['candidate']}>
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        <div className="max-w-6xl mx-auto py-12">

          <button
            onClick={() => router.push('/dashboard')}
            className="btn-secondary mb-8"
          >
            ← Back to dashboard
          </button>

          <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Submit your CV
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            Upload your CV and tell us your target role
          </p>

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

          <div className="card space-y-6">

            <div>
              <label className="label">Target Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Backend Developer"
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">CV — PDF only, max 5MB</label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className="rounded-lg p-8 text-center transition-colors"
                style={{
                  border: `2px dashed ${dragOver ? 'var(--brand)' : 'var(--border)'}`,
                  background: dragOver ? 'var(--brand-light)' : 'transparent'
                }}
              >
                {file ? (
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {file.name}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {(file.size / 1024).toFixed(0)} KB
                    </p>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-xs mt-2 transition-colors"
                      style={{ color: 'var(--danger)' }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Drag and drop your CV here, or
                    </p>
                    <label
                      className="text-sm cursor-pointer"
                      style={{ color: 'var(--brand)' }}
                    >
                      browse files
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary w-full py-2.5"
            >
              {loading ? 'Analyzing your CV...' : 'Submit CV'}
            </button>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}