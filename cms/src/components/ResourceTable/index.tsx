'use client'

import React, { useEffect, useState, useCallback } from 'react'

export type Column<T> = {
  label: string
  render: (row: T) => React.ReactNode
}

export type RowAction<T> = {
  label: (row: T) => string
  // called after the user confirms; return true on success to refresh the list
  onClick: (row: T) => Promise<boolean>
  confirm?: string
}

type Props<T> = {
  title: string
  // Django endpoint fragment under /api/v1/, e.g. "jobs" or "accounts/admin/users"
  endpoint: string
  columns: Column<T>[]
  actions?: RowAction<T>[]
  getId: (row: T) => string | number
}

// Row actions whose label matches this get styled as destructive (red)
// instead of the default secondary style — purely visual, no behavior change.
const DESTRUCTIVE_ACTION_PATTERN = /delete|ban|reject|remove/i

export function ResourceTable<T>({ title, endpoint, columns, actions = [], getId }: Props<T>) {
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/django-proxy/${endpoint}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`Failed to load (${res.status})`)
      const data = await res.json()
      // Django's DRF pagination wraps lists as { results: [...] }; fall back to a raw array
      setRows(Array.isArray(data) ? data : (data.results ?? []))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    load()
  }, [load])

  const handleAction = async (action: RowAction<T>, row: T) => {
    if (action.confirm && !window.confirm(action.confirm)) return
    setBusyId(getId(row))
    setActionError(null)
    try {
      const ok = await action.onClick(row)
      if (ok) {
        await load()
      } else {
        setActionError(`Action failed for row ${getId(row)}. Check the browser console/network tab for the response.`)
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Action failed with an unexpected error.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="rt-page">
      <div className="rt-header">
        <h1 className="rt-title">{title}</h1>
        {!loading && !error && (
          <span className="rt-count">
            {rows.length} {rows.length === 1 ? 'record' : 'records'}
          </span>
        )}
      </div>

      {error && (
        <div className="rt-error">
          <strong>{error}</strong>
          <span> — check DJANGO_API_BASE_URL / DJANGO_ADMIN_EMAIL / DJANGO_ADMIN_PASSWORD.</span>
        </div>
      )}

      {actionError && (
        <div className="rt-error">
          <strong>{actionError}</strong>
        </div>
      )}

      <div className="rt-card">
        {loading ? (
          <div className="rt-state">
            <span className="rt-spinner" aria-hidden="true" />
            Loading…
          </div>
        ) : (
          <div className="rt-scroll">
            <table className="rt-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.label}>{col.label}</th>
                  ))}
                  {actions.length > 0 && <th className="rt-actions-head">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={getId(row)} className={busyId === getId(row) ? 'rt-row-busy' : undefined}>
                    {columns.map((col) => (
                      <td key={col.label}>{col.render(row)}</td>
                    ))}
                    {actions.length > 0 && (
                      <td className="rt-actions-cell">
                        {actions.map((action) => {
                          const isDestructive = DESTRUCTIVE_ACTION_PATTERN.test(action.label(row))
                          return (
                            <button
                              key={action.label(row)}
                              disabled={busyId === getId(row)}
                              onClick={() => handleAction(action, row)}
                              className={
                                isDestructive
                                  ? 'btn btn--style-secondary rt-btn-danger'
                                  : 'btn btn--style-secondary'
                              }
                              type="button"
                            >
                              {busyId === getId(row) ? '…' : action.label(row)}
                            </button>
                          )
                        })}
                      </td>
                    )}
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + 1} className="rt-empty">
                      Nothing here yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .rt-page {
          padding: var(--base, 20px);
          max-width: 100%;
        }
        .rt-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
        }
        .rt-title {
          margin: 0;
        }
        .rt-count {
          font-size: 13px;
          color: var(--theme-elevation-500);
          white-space: nowrap;
        }
        .rt-error {
          background: color-mix(in srgb, var(--theme-error-500) 12%, transparent);
          border: 1px solid var(--theme-error-500);
          color: var(--theme-error-500);
          border-radius: 6px;
          padding: 10px 14px;
          margin-bottom: 16px;
          font-size: 13px;
        }
        .rt-card {
          border: 1px solid var(--theme-elevation-150);
          border-radius: 8px;
          background: var(--theme-elevation-0);
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }
        .rt-scroll {
          overflow-x: auto;
        }
        .rt-state {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 32px;
          color: var(--theme-elevation-500);
          font-size: 14px;
        }
        .rt-spinner {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid var(--theme-elevation-200);
          border-top-color: var(--theme-elevation-800);
          animation: rt-spin 0.7s linear infinite;
        }
        @keyframes rt-spin {
          to { transform: rotate(360deg); }
        }
        .rt-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
        }
        .rt-table thead th {
          position: sticky;
          top: 0;
          text-align: left;
          background: var(--theme-elevation-50);
          color: var(--theme-elevation-600);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          font-size: 11px;
          padding: 10px 14px;
          border-bottom: 1px solid var(--theme-elevation-150);
          white-space: nowrap;
        }
        .rt-actions-head {
          text-align: right !important;
        }
        .rt-table tbody tr {
          border-bottom: 1px solid var(--theme-elevation-100);
          transition: background-color 0.12s ease;
        }
        .rt-table tbody tr:last-child {
          border-bottom: none;
        }
        .rt-table tbody tr:hover {
          background: var(--theme-elevation-50);
        }
        .rt-table tbody tr.rt-row-busy {
          opacity: 0.55;
        }
        .rt-table td {
          padding: 10px 14px;
          vertical-align: middle;
        }
        .rt-actions-cell {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          white-space: nowrap;
        }
        .rt-btn-danger {
          color: var(--theme-error-500) !important;
          border-color: var(--theme-error-500) !important;
        }
        .rt-empty {
          text-align: center;
          padding: 40px 14px;
          color: var(--theme-elevation-400);
          font-size: 13.5px;
        }
      `}</style>
    </div>
  )
}
