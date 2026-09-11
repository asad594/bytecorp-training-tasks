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
    { href: `${adminRoute}/job-board/jobs`, label: 'Jobs', icon: '💼' },
    { href: `${adminRoute}/job-board/companies`, label: 'Companies', icon: '🏢' },
    { href: `${adminRoute}/job-board/users`, label: 'Users', icon: '👤' },
    { href: `${adminRoute}/job-board/skills`, label: 'Skills', icon: '🏷️' },
    { href: `${adminRoute}/job-board/applications`, label: 'Job Applications', icon: '🧾' },
  ]

  return (
    <div style={{ marginTop: 'var(--base)' }}>
      <p className="nav__label" style={{ margin: '0 0 8px' }}>
        Job Board
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {links.map((link) => (
          <Link
            key={link.href}
            className="nav__link"
            href={link.href}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <span aria-hidden="true" style={{ fontSize: 13 }}>
              {link.icon}
            </span>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
