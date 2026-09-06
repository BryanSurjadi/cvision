'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'

const navLinks = {
  candidate: [
    { label: 'Home', href: '/home' },
    { label: 'Submissions', href: '/dashboard' },
    { label: 'Submit CV', href: '/submit' },
    { label: 'Notifications', href: '/notifications' },
  ],
  hr: [
    { label: 'Home', href: '/home' },
    { label: 'Candidates', href: '/candidates' },
    { label: 'Saved', href: '/saved' },
  ],
  admin: [
    { label: 'Home', href: '/home' },
    { label: 'Pending', href: '/admin/dashboard' },
    { label: 'Users', href: '/admin/users' },
  ],
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const links = user ? navLinks[user.role] : []

  return (
    <nav
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
      }}
      className="sticky top-0 z-50 w-full"
    >
      {/* Inner wrapper centers content and limits max width */}
      <div className="max-w-6xl mx-auto h-14 flex items-center justify-between">
        <Link href={user ? '/home' : '/'} className="flex items-center gap-2">
          <Image src="/cvision-sm.png" alt="CVision" width={48} height={32} />
        </Link>

        {user && (
          <div className="flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link href="/login">
                <button className="btn-secondary">Login</button>
              </Link>
              <Link href="/register">
                <button className="btn-primary">Register</button>
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 text-sm transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                  style={{ background: 'var(--brand)' }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ color: 'var(--text-primary)' }} className="text-sm font-medium">
                  {user.name.split(' ')[0]}
                </span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-44 rounded-xl shadow-sm py-1"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <button
                    onClick={() => { setDropdownOpen(false); router.push('/profile') }}
                    className="w-full text-left px-4 py-2 text-sm transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >
                    Profile
                  </button>
                  <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                  <button
                    onClick={() => { setDropdownOpen(false); logout() }}
                    className="w-full text-left px-4 py-2 text-sm transition-colors"
                    style={{ color: 'var(--danger)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#b91c1c')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--danger)')}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}