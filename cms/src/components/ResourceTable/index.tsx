'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'

export type Column<T> = {
  label: string
  render: (row: T) => React.ReactNode
  // Optional: enables click-to-sort on this column's header. Return a
  // comparable primitive for the row — purely for sorting, doesn't change
  // what's rendered.
  sortValue?: (row: T) => string | number
}

export type RowAction<T> = {
  label: (row: T) => string
  // called after the user confirms; return true on success to refresh the list
  onClick: (row: T) => Promise<boolean>
  confirm?: string
}

type Props<T> = {
  title: string
  titleIcon?: string
  // Django endpoint fragment under /api/v1/, e.g. "jobs" or "accounts/admin/users"
  endpoint: string
  columns: Column<T>[]
  actions?: RowAction<T>[]
  getId: (row: T) => string | number
  // Optional extra toolbar content rendered next to the search box (e.g. SkillsView's "add" form)
  toolbarExtra?: React.ReactNode
  pageSize?: number
}

// Row actions whose label matches this get styled as destructive (red)
// instead of the default secondary style — purely visual, no behavior change.
const DESTRUCTIVE_ACTION_PATTERN = /delete|ban|reject|remove/i

// Small color-coded pill for status-like values. Purely presentational — pass
// it the exact same text you were already rendering.
const POSITIVE_PATTERN = /open|active|verified|yes|approved|hired/i
const NEGATIVE_PATTERN = /closed|banned|rejected|no$/i
const WARN_PATTERN = /pending|review/i

export function Badge({ text }: { text: string }) {
  let tone: 'positive' | 'negative' | 'warn' | 'neutral' = 'neutral'
  if (POSITIVE_PATTERN.test(text)) tone = 'positive'
  else if (NEGATIVE_PATTERN.test(text)) tone = 'negative'
  else if (WARN_PATTERN.test(text)) tone = 'warn'

  return <span className={`rt-badge rt-badge--${tone}`}>{text}</span>
}

export function ResourceTable<T>({
  title,
  titleIcon,
  endpoint,
  columns,
  actions = [],
  getId,
  toolbarExtra,
  pageSize = 10,
}: Props<T>) {
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<{ label: string; dir: 'asc' | 'desc' } | null>(null)
  const [page, setPage] = useState(1)

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

  useEffect(() => {
    setPage(1)
  }, [query, rows])

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

  const filteredRows = useMemo(() => {
    if (!query.trim()) return rows
    const q = query.trim().toLowerCase()
    return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(q))
  }, [rows, query])

  const sortedRows = useMemo(() => {
    if (!sort) return filteredRows
    const col = columns.find((c) => c.label === sort.label)
    if (!col?.sortValue) return filteredRows
    const copy = [...filteredRows]
    copy.sort((a, b) => {
      const av = col.sortValue!(a)
      const bv = col.sortValue!(b)
      if (av === bv) return 0
      const cmp = av > bv ? 1 : -1
      return sort.dir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [filteredRows, sort, columns])

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageRows = useMemo(
    () => sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [sortedRows, currentPage, pageSize],
  )

  const toggleSort = (label: string, sortable?: boolean) => {
    if (!sortable) return
    setSort((prev) => {
      if (!prev || prev.label !== label) return { label, dir: 'asc' }
      if (prev.dir === 'asc') return { label, dir: 'desc' }
      return null
    })
  }

  return (
    <div className="rt-page">
      <div className="rt-header">
        <div className="rt-header__titles">
          <h1 className="rt-title">
            {titleIcon && (
              <span className="rt-title__icon" aria-hidden="true">
                {titleIcon}
              </span>
            )}
            {title}
          </h1>
          {!loading && !error && (
            <span className="rt-count">
              {sortedRows.length} {sortedRows.length === 1 ? 'record' : 'records'}
              {query.trim() ? ` of ${rows.length}` : ''}
            </span>
          )}
        </div>
        <div className="rt-toolbar">
          {toolbarExtra}
          <div className="rt-search">
            <span className="rt-search__icon" aria-hidden="true">
              ⌕
            </span>
            <input
              type="text"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={`Search ${title.toLowerCase()}`}
            />
          </div>
          <button
            type="button"
            className="btn btn--style-secondary rt-refresh"
            onClick={() => load()}
            disabled={loading}
            title="Refresh"
          >
            <span className={loading ? 'rt-refresh__icon rt-refresh__icon--spin' : 'rt-refresh__icon'}>⟳</span>
            Refresh
          </button>
        </div>
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
                  {columns.map((col) => {
                    const isSorted = sort?.label === col.label
                    return (
                      <th
                        key={col.label}
                        onClick={() => toggleSort(col.label, !!col.sortValue)}
                        className={col.sortValue ? 'rt-th-sortable' : undefined}
                        title={col.sortValue ? 'Click to sort' : undefined}
                      >
                        {col.label}
                        {col.sortValue && (
                          <span className="rt-sort-icon" aria-hidden="true">
                            {isSorted ? (sort!.dir === 'asc' ? '▲' : '▼') : '↕'}
                          </span>
                        )}
                      </th>
                    )
                  })}
                  {actions.length > 0 && <th className="rt-actions-head">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => (
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
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + 1} className="rt-empty">
                      {rows.length === 0 ? 'Nothing here yet.' : 'No records match your search.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="rt-pagination">
            <button
              type="button"
              className="btn btn--style-secondary"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← Prev
            </button>
            <span className="rt-pagination__label">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="btn btn--style-secondary"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next →
            </button>
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
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .rt-header__titles {
          display: flex;
          align-items: baseline;
          gap: 10px;
          flex-wrap: wrap;
        }
        .rt-title {
          margin: 0;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .rt-title__icon {
          font-size: 0.75em;
        }
        .rt-count {
          font-size: 13px;
          color: var(--theme-elevation-500);
          white-space: nowrap;
        }
        .rt-toolbar {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .rt-search {
          position: relative;
          display: flex;
          align-items: center;
        }
        .rt-search__icon {
          position: absolute;
          left: 10px;
          color: var(--theme-elevation-400);
          font-size: 13px;
          pointer-events: none;
        }
        .rt-search input {
          padding: 7px 10px 7px 28px;
          border-radius: 6px;
          border: 1px solid var(--theme-elevation-150);
          background: var(--theme-input-bg, var(--theme-elevation-0));
          color: var(--theme-text, inherit);
          font-size: 13px;
          min-width: 180px;
          transition: border-color 0.12s ease;
        }
        .rt-search input:focus {
          outline: none;
          border-color: var(--theme-success-500, #4f46e5);
        }
        .rt-refresh {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .rt-refresh__icon {
          display: inline-block;
          font-size: 13px;
          line-height: 1;
        }
        .rt-refresh__icon--spin {
          animation: rt-spin 0.8s linear infinite;
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
        .rt-th-sortable {
          cursor: pointer;
          user-select: none;
        }
        .rt-th-sortable:hover {
          color: var(--theme-elevation-900);
        }
        .rt-sort-icon {
          margin-left: 5px;
          font-size: 9px;
          opacity: 0.7;
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
        .rt-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 9px;
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 600;
          text-transform: capitalize;
          white-space: nowrap;
          line-height: 1.6;
        }
        .rt-badge--positive {
          color: #16a34a;
          background: color-mix(in srgb, #16a34a 14%, transparent);
        }
        .rt-badge--negative {
          color: var(--theme-error-500);
          background: color-mix(in srgb, var(--theme-error-500) 14%, transparent);
        }
        .rt-badge--warn {
          color: #d97706;
          background: color-mix(in srgb, #d97706 14%, transparent);
        }
        .rt-badge--neutral {
          color: var(--theme-elevation-600);
          background: var(--theme-elevation-100);
        }
        .rt-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 12px 14px;
          border-top: 1px solid var(--theme-elevation-150);
        }
        .rt-pagination__label {
          font-size: 12.5px;
          color: var(--theme-elevation-500);
        }
      `}</style>
    </div>
  )
}
