'use client'

import React from 'react'
import { Link, useConfig } from '@payloadcms/ui'

export function AfterNavLinks() {
  const {
    config: {
      routes: { admin: adminRoute },
    },
  } = useConfig()

  const links = [
    { href: `${adminRoute}/job-board/jobs`, label: 'Jobs' },
    { href: `${adminRoute}/job-board/companies`, label: 'Companies' },
    { href: `${adminRoute}/job-board/users`, label: 'Users' },
    { href: `${adminRoute}/job-board/skills`, label: 'Skills' },
    { href: `${adminRoute}/job-board/applications`, label: 'Job Applications' },
  ]

  return (
    <div style={{ marginTop: 'var(--base)' }}>
      <p className="nav__label" style={{ margin: '0 0 8px' }}>
        Job Board
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {links.map((link) => (
          <Link key={link.href} className="nav__link" href={link.href}>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
