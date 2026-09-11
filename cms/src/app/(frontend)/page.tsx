import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'
import { fileURLToPath } from 'url'

import config from '@/payload.config'
import { ThemeToggle } from '@/components/ThemeToggle'
import './styles.css'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`

  const features = [
    { icon: '💼', title: 'Jobs', desc: 'Review listings, close or reopen postings.' },
    { icon: '🏢', title: 'Companies', desc: 'Verify employers before they can publish.' },
    { icon: '🧾', title: 'Applications', desc: 'Track applicants from submission to hire.' },
    { icon: '🏷️', title: 'Skills', desc: 'Curate the skill tags applicants choose from.' },
  ]

  return (
    <div className="home">
      <ThemeToggle />

      <div className="home__glow home__glow--one" aria-hidden="true" />
      <div className="home__glow home__glow--two" aria-hidden="true" />

      <div className="content">
        <div className="logo-mark" aria-hidden="true">
          JB
        </div>

        <span className="badge-pill">Job Board · Content Platform</span>

        {!user || !('email' in user) ? (
          <h1>
            Welcome to your <span className="accent-text">Job Board CMS</span>.
          </h1>
        ) : (
          <h1>
            Welcome back, <span className="accent-text">{user.email}</span>
          </h1>
        )}

        <p className="lead">
          Manage jobs, companies, applicants and skills from one place. Sign in to the admin
          panel to review applications, verify companies and keep listings up to date.
        </p>

        <div className="links">
          <a className="btn btn--primary" href={payloadConfig.routes.admin} rel="noopener noreferrer">
            Go to admin panel
          </a>
          <a
            className="btn btn--secondary"
            href="https://payloadcms.com/docs"
            rel="noopener noreferrer"
            target="_blank"
          >
            Documentation
          </a>
        </div>

        <div className="feature-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <span className="feature-card__icon" aria-hidden="true">
                {f.icon}
              </span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="footer">
        <p>Update this page by editing</p>
        <a className="codeLink" href={fileURL}>
          <code>app/(frontend)/page.tsx</code>
        </a>
      </div>
    </div>
  )
}
