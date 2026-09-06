'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import api from '@/lib/axios'
import { Notification } from '@/types'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isSubscribed = true

    // Read accessToken from cookies!
    const token = Cookies.get('accessToken')

    if (!token) {
      console.error('No accessToken found in Cookies')
      return
    }

    // 1. Initial HTTP Fetch
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications')
        if (isSubscribed) setNotifications(res.data.data)
      } catch (err) {
        console.error('Failed to fetch notifications:', err)
      } finally {
        if (isSubscribed) setLoading(false)
      }
    }

    fetchNotifications()

    // 2. Establish SSE Connection passing cookie token
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    const eventSource = new EventSource(`${backendUrl}/notifications/stream?token=${token}`)

    eventSource.onopen = () => {
      if (isSubscribed) console.log('SSE Stream Connected')
    }

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)
        if (parsed.type === 'NOTIFICATION_RECEIVED' && isSubscribed) {
          setNotifications((prev) => [parsed.data, ...prev])
        }
      } catch (err) {
        console.error('Failed to parse SSE payload', err)
      }
    }

    eventSource.onerror = () => {
      if (isSubscribed && eventSource.readyState === EventSource.CLOSED) {
        console.warn('SSE Stream disconnected')
      }
    }

    return () => {
      isSubscribed = false
      eventSource.close()
    }
    
  }, [])

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      )
    } catch (err) {
      console.error(err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.isRead)
      await Promise.all(unread.map(n => api.put(`/notifications/${n.id}/read`)))
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (err) {
      console.error(err)
    }
  }

  const notifIcon = (type: string) => {
    if (type === 'verified') return { icon: '✓', color: 'var(--success)', bg: 'var(--success-light)', border: 'var(--success-border)' }
    if (type === 'rejected') return { icon: '✕', color: 'var(--danger)', bg: 'var(--danger-light)', border: 'var(--danger-border)' }
    return { icon: '•', color: 'var(--brand)', bg: 'var(--brand-light)', border: '#BFDBFE' }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <ProtectedRoute allowedRoles={['candidate']}>
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        <div className="max-w-2xl mx-auto px-6 py-12">

          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="section-label">Candidate</p>
              <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Notifications
                {unreadCount > 0 && (
                  <span
                    className="ml-2 text-sm font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: 'var(--brand-light)',
                      color: 'var(--brand)',
                      fontSize: '0.75rem'
                    }}
                  >
                    {unreadCount} new
                  </span>
                )}
              </h1>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</p>
          ) : notifications.length === 0 ? (
            <div className="card text-center py-16">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                No notifications yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => {
                const style = notifIcon(notif.type)
                return (
                  <div
                    key={notif.id}
                    className="rounded-xl p-4 flex items-start gap-4 transition-all cursor-pointer"
                    style={{
                      background: notif.isRead ? 'var(--surface)' : 'var(--brand-light)',
                      border: `1px solid ${notif.isRead ? 'var(--border)' : '#BFDBFE'}`,
                    }}
                    onClick={() => {
                      if (!notif.isRead) markAsRead(notif.id)
                      if (notif.submissionId) router.push(`/submission/${notif.submissionId}`)
                    }}
                  >
                    {/* Icon */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                      style={{
                        background: style.bg,
                        border: `1px solid ${style.border}`,
                        color: style.color
                      }}
                    >
                      {style.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm"
                        style={{
                          color: 'var(--text-primary)',
                          fontWeight: notif.isRead ? 400 : 600
                        }}
                      >
                        {notif.message}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {new Date(notif.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!notif.isRead && (
                      <div
                        className="w-2 h-2 rounded-full shrink-0 mt-1"
                        style={{ background: 'var(--brand)' }}
                      />
                    )}
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