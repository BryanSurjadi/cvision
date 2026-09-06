import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-8 text-center">
        <div className="flex justify-center mb-4">
          <Image src="/cvision-sm.png" alt="CVision" width={124} height={56} />
        </div>

        <h1
          className="text-5xl font-bold tracking-tight mb-6 leading-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Your CV, analyzed.<br />
          <span style={{ color: 'var(--brand)'}}>Your talent, discovered.</span>
        </h1>

        <p
          className="text-lg max-w-xl mx-auto mb-10 leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          CVision uses AI to score and analyze your CV against your target role,
          then puts your profile in front of the right HR recruiters.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link href="/register">
            <button className="btn-primary px-6 py-2.5 text-sm">
              Get started free
            </button>
          </Link>
          <Link href="/login">
            <button className="btn-secondary px-6 py-2.5 text-sm">
              Sign in
            </button>
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <hr className="divider" />
      </div>

      {/* How it works — Candidate */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <p className="section-label text-center mb-12">For candidates</p>
        <div className="grid grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Upload your CV',
              desc: 'Submit your CV as a PDF and tell us your target role.'
            },
            {
              step: '02',
              title: 'Get AI analysis',
              desc: 'Our AI scores your CV and extracts your skills, experience, and fit.'
            },
            {
              step: '03',
              title: 'Get discovered',
              desc: 'Once verified, your profile enters the talent pool visible to HR recruiters.'
            },
          ].map((item) => (
            <div key={item.step}>
              <p
                className="text-xs font-semibold mb-3 tabular-nums"
                style={{ color: 'var(--brand)' }}
              >
                {item.step}
              </p>
              <h3
                className="text-sm font-semibold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6">
        <hr className="divider" />
      </div>

      {/* How it works — HR */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <p className="section-label text-center mb-12">For recruiters</p>
        <div className="grid grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Search the talent pool',
              desc: 'Filter verified candidates by role, skills, ATS score, and experience level.'
            },
            {
              step: '02',
              title: 'Review AI analysis',
              desc: 'Read extracted skills, experience, strengths, and fit scores at a glance.'
            },
            {
              step: '03',
              title: 'Save and reach out',
              desc: 'Bookmark candidates and download their CVs directly from the platform.'
            },
          ].map((item) => (
            <div key={item.step}>
              <p
                className="text-xs font-semibold mb-3 tabular-nums"
                style={{ color: 'var(--brand)' }}
              >
                {item.step}
              </p>
              <h3
                className="text-sm font-semibold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6">
        <hr className="divider" />
      </div>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2
          className="text-2xl font-semibold mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          Ready to get noticed?
        </h2>
        <p
          className="text-sm mb-8"
          style={{ color: 'var(--text-secondary)' }}
        >
          Join CVision and let AI do the heavy lifting.
        </p>
        <Link href="/register">
          <button className="btn-primary px-6 py-2.5 text-sm">
            Create your account
          </button>
        </Link>
      </section>

      {/* Footer */}

    </div>
  )
}