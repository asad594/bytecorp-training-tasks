'use client'

import React, { useEffect, useState } from 'react'

type Mode = 'light' | 'dark' | 'auto'

const STORAGE_KEY = 'jb-theme'

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

function resolve(mode: Mode): 'light' | 'dark' {
  return mode === 'auto' ? (systemPrefersDark() ? 'dark' : 'light') : mode
}

function apply(mode: Mode) {
  const resolved = resolve(mode)
  document.documentElement.setAttribute('data-theme', resolved)
  document.documentElement.setAttribute('data-theme-mode', mode)
}

const OPTIONS: { mode: Mode; label: string }[] = [
  { mode: 'light', label: 'Light' },
  { mode: 'auto', label: 'Auto' },
  { mode: 'dark', label: 'Dark' },
]

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="2" />
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.6 6.6 0 0 0 10.5 10.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AutoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8.5 20h7M12 16.5V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

const ICONS: Record<Mode, React.FC> = { light: SunIcon, dark: MoonIcon, auto: AutoIcon }

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>('auto')
  const [mounted, setMounted] = useState(false)

  // Pick up whatever the blocking inline script (in layout.tsx) already applied.
  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Mode | null) || 'auto'
    setMode(stored)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    apply(mode)
    localStorage.setItem(STORAGE_KEY, mode)
  }, [mode, mounted])

  // Keep "auto" mode live if the OS-level preference changes while the tab is open.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (mode === 'auto') apply('auto')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [mode])

  if (!mounted) return <div className="theme-toggle theme-toggle--placeholder" aria-hidden="true" />

  const activeIndex = OPTIONS.findIndex((o) => o.mode === mode)

  return (
    <div className="theme-toggle" role="radiogroup" aria-label="Theme">
      <span className="theme-toggle__thumb" style={{ transform: `translateX(${activeIndex * 100}%)` }} />
      {OPTIONS.map((opt) => {
        const Icon = ICONS[opt.mode]
        const active = opt.mode === mode
        return (
          <button
            key={opt.mode}
            type="button"
            role="radio"
            aria-checked={active}
            title={opt.label}
            aria-label={opt.label}
            className={active ? 'theme-toggle__btn theme-toggle__btn--active' : 'theme-toggle__btn'}
            onClick={() => setMode(opt.mode)}
          >
            <Icon />
          </button>
        )
      })}
    </div>
  )
}
