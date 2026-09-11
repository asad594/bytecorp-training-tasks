'use client'

import React from 'react'
import Link from 'next/link'
import { useConfig } from '@payloadcms/ui'

// Renders a clear "Log out" button in the top-right admin bar (next to the
// avatar), on every admin page including the Account page. Uses Payload's
// own /admin/logout route, which logs the user out and sends them back to
// the login screen — no custom auth logic, nothing to break.
export function LogoutAction() {
  const {
    config: {
      admin: {
        routes: { logout: logoutRoute },
      },
      routes: { admin: adminRoute },
    },
  } = useConfig()

  return (
    <Link href={`${adminRoute}${logoutRoute}`} className="logout-action" prefetch={false}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Log out
      <style>{`
        .logout-action {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid var(--theme-elevation-150);
          color: var(--theme-elevation-800);
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          transition: border-color 0.12s ease, background-color 0.12s ease;
        }
        .logout-action:hover {
          border-color: var(--theme-error-500);
          color: var(--theme-error-500);
          background: color-mix(in srgb, var(--theme-error-500) 8%, transparent);
        }
      `}</style>
    </Link>
  )
}