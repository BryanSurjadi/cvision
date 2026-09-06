import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/context/AuthContext'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CVision',
  description: 'AI-powered CV analysis and talent discovery platform',
  icons: {
    icon: '/cvision-sm.png', 
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <AuthProvider>
          <Navbar />
          <main>
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}