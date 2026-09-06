import Image from 'next/image'

export default function Footer(){
  return(
    <footer
        style={{
          borderTop: '1px solid var(--border)',
          background: 'var(--surface)'
        }}
      >
        <div className="max-w-6xl mx-auto py-6 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2">
            <Image src="/cvision-sm.png" alt="CVision" width={64} height={20} />
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} CVision. All rights reserved.
          </p>
        </div>
      </footer>
  )
}