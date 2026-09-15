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

export type EditField<T> = {
  name: string
  label: string
  type?: 'text' | 'textarea' | 'select' | 'number'
  options?: { label: string; value: string | number }[]
  getValue: (row: T) => any
  placeholder?: string
  required?: boolean
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
  // Optional editable fields configuration to enable admin edit modal
  editFields?: EditField<T>[]
  // Optional custom title for the edit modal (defaults to "Edit <Resource>")
  editModalTitle?: (row: T) => string
  // Optional custom endpoint for editing (defaults to endpoint)
  editEndpoint?: string | ((row: T) => string)
  // Optional custom save handler; if provided, called instead of default PATCH
  onSaveEdit?: (row: T, changedValues: Record<string, any>) => Promise<boolean>
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
  editFields,
  editModalTitle,
  editEndpoint,
  onSaveEdit,
}: Props<T>) {
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<{ label: string; dir: 'asc' | 'desc' } | null>(null)
  const [page, setPage] = useState(1)

  // Edit modal state
  const [editingRow, setEditingRow] = useState<T | null>(null)
  const [editValues, setEditValues] = useState<Record<string, any>>({})
  const [editBusy, setEditBusy] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

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

  // Dismiss edit modal on Escape key
  useEffect(() => {
    if (!editingRow) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !editBusy) {
        setEditingRow(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [editingRow, editBusy])

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

  const startEditing = (row: T) => {
    if (!editFields) return
    const initial: Record<string, any> = {}
    editFields.forEach((field) => {
      const val = field.getValue(row)
      initial[field.name] = val ?? ''
    })
    setEditingRow(row)
    setEditValues(initial)
    setEditError(null)
  }

  const handleFieldChange = (name: string, value: any) => {
    setEditValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveEdit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!editingRow || !editFields) return

    // Calculate changed fields only — never send unchanged fields
    const changedValues: Record<string, any> = {}
    for (const field of editFields) {
      const original = field.getValue(editingRow)
      const current = editValues[field.name]

      const originalNorm = original === null || original === undefined ? '' : String(original)
      const currentNorm = current === null || current === undefined ? '' : String(current).trim()

      if (originalNorm !== currentNorm) {
        if (field.type === 'number') {
          changedValues[field.name] = current === '' ? null : Number(current)
        } else {
          changedValues[field.name] = current
        }
      }
    }

    // If nothing changed, simply close the modal
    if (Object.keys(changedValues).length === 0) {
      setEditingRow(null)
      return
    }

    setEditBusy(true)
    setEditError(null)

    try {
      if (onSaveEdit) {
        const ok = await onSaveEdit(editingRow, changedValues)
        if (ok) {
          setEditingRow(null)
          await load()
        } else {
          setEditError('Update failed. Please check the inputs or console for details.')
        }
      } else {
        const targetPath = editEndpoint
          ? typeof editEndpoint === 'function'
            ? editEndpoint(editingRow)
            : `${editEndpoint}/${getId(editingRow)}`
          : `${endpoint}/${getId(editingRow)}`

        const res = await fetch(`/api/django-proxy/${targetPath}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(changedValues),
        })

        if (res.ok) {
          setEditingRow(null)
          await load()
        } else {
          let errMessage = `Update failed (${res.status})`
          try {
            const data = await res.json()
            if (typeof data === 'string') {
              errMessage = data
            } else if (data && typeof data === 'object') {
              if (data.detail) {
                errMessage = String(data.detail)
              } else if (data.message) {
                errMessage = String(data.message)
              } else {
                const parts: string[] = []
                for (const [key, val] of Object.entries(data)) {
                  const valStr = Array.isArray(val) ? val.join(' ') : String(val)
                  parts.push(`${key}: ${valStr}`)
                }
                if (parts.length > 0) errMessage = parts.join(' | ')
              }
            }
          } catch {
            // fallback to default errMessage
          }
          setEditError(errMessage)
        }
      }
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'An unexpected error occurred while saving.')
    } finally {
      setEditBusy(false)
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

  const hasActions = actions.length > 0 || !!(editFields && editFields.length > 0)

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
                  {hasActions && <th className="rt-actions-head">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => (
                  <tr key={getId(row)} className={busyId === getId(row) ? 'rt-row-busy' : undefined}>
                    {columns.map((col) => (
                      <td key={col.label}>{col.render(row)}</td>
                    ))}
                    {hasActions && (
                      <td className="rt-actions-cell">
                        {editFields && editFields.length > 0 && (
                          <button
                            type="button"
                            className="btn btn--style-secondary rt-btn-edit"
                            onClick={() => startEditing(row)}
                            disabled={busyId === getId(row) || editBusy}
                          >
                            Edit
                          </button>
                        )}
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
                    <td colSpan={columns.length + (hasActions ? 1 : 0)} className="rt-empty">
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

      {/* Edit Modal */}
      {editingRow && editFields && (
        <div
          className="rt-modal-overlay"
          onClick={() => !editBusy && setEditingRow(null)}
          role="presentation"
        >
          <div
            className="rt-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rt-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rt-modal__header">
              <h2 id="rt-modal-title" className="rt-modal__title">
                {editModalTitle ? editModalTitle(editingRow) : `Edit ${title.replace(/s$/, '')}`}
              </h2>
              <button
                type="button"
                className="rt-modal__close"
                onClick={() => !editBusy && setEditingRow(null)}
                aria-label="Close"
                disabled={editBusy}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="rt-modal__form">
              {editError && (
                <div className="rt-modal__error">
                  <strong>Error:</strong> {editError}
                </div>
              )}

              <div className="rt-modal__fields">
                {editFields.map((field) => {
                  const val = editValues[field.name] ?? ''
                  return (
                    <div key={field.name} className="rt-modal__field">
                      <label htmlFor={`rt-field-${field.name}`} className="rt-modal__label">
                        {field.label}
                        {field.required && <span className="rt-modal__required">*</span>}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          id={`rt-field-${field.name}`}
                          value={String(val)}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          className="rt-modal__input rt-modal__select"
                          disabled={editBusy}
                          required={field.required}
                        >
                          {field.options?.map((opt) => (
                            <option key={String(opt.value)} value={String(opt.value)}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          id={`rt-field-${field.name}`}
                          value={val}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className="rt-modal__input rt-modal__textarea"
                          rows={3}
                          disabled={editBusy}
                          required={field.required}
                        />
                      ) : (
                        <input
                          id={`rt-field-${field.name}`}
                          type={field.type || 'text'}
                          value={val}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className="rt-modal__input"
                          disabled={editBusy}
                          required={field.required}
                        />
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="rt-modal__actions">
                <button
                  type="button"
                  className="btn btn--style-secondary"
                  onClick={() => setEditingRow(null)}
                  disabled={editBusy}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--style-primary rt-modal__save-btn"
                  disabled={editBusy}
                >
                  {editBusy ? (
                    <>
                      <span className="rt-spinner rt-spinner--btn" aria-hidden="true" />
                      Saving…
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
        .rt-btn-edit {
          color: var(--theme-elevation-800);
        }
        .rt-btn-edit:hover {
          color: var(--theme-elevation-900);
          border-color: var(--theme-elevation-400);
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

        /* Edit Modal */
        .rt-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
          animation: rtFadeIn 0.15s ease-out;
        }
        @keyframes rtFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .rt-modal {
          background: var(--theme-elevation-0);
          border: 1px solid var(--theme-elevation-150);
          border-radius: 8px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18), 0 2px 6px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          animation: rtScaleIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes rtScaleIn {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .rt-modal__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          border-bottom: 1px solid var(--theme-elevation-150);
          background: var(--theme-elevation-50);
        }
        .rt-modal__title {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: var(--theme-elevation-900);
        }
        .rt-modal__close {
          background: transparent;
          border: none;
          font-size: 15px;
          cursor: pointer;
          color: var(--theme-elevation-500);
          padding: 4px 8px;
          border-radius: 4px;
          line-height: 1;
          transition: color 0.12s, background-color 0.12s;
        }
        .rt-modal__close:hover:not(:disabled) {
          color: var(--theme-elevation-900);
          background: var(--theme-elevation-100);
        }
        .rt-modal__close:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .rt-modal__form {
          padding: 18px;
        }
        .rt-modal__fields {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .rt-modal__field {
          display: flex;
          flex-direction: column;
        }
        .rt-modal__label {
          font-size: 11.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: var(--theme-elevation-600);
          margin-bottom: 6px;
        }
        .rt-modal__required {
          color: var(--theme-error-500);
          margin-left: 3px;
        }
        .rt-modal__input {
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid var(--theme-elevation-150);
          background: var(--theme-input-bg, var(--theme-elevation-0));
          color: var(--theme-text, inherit);
          font-size: 13.5px;
          font-family: inherit;
          transition: border-color 0.12s ease, box-shadow 0.12s ease;
          width: 100%;
          box-sizing: border-box;
        }
        .rt-modal__input:focus {
          outline: none;
          border-color: var(--theme-success-500, #4f46e5);
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--theme-success-500, #4f46e5) 20%, transparent);
        }
        .rt-modal__select {
          appearance: auto;
        }
        .rt-modal__textarea {
          resize: vertical;
          min-height: 64px;
        }
        .rt-modal__actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
          padding-top: 14px;
          border-top: 1px solid var(--theme-elevation-100);
        }
        .rt-modal__save-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .rt-spinner--btn {
          width: 12px;
          height: 12px;
          border-width: 1.5px;
          border-top-color: currentColor;
        }
        .rt-modal__error {
          background: color-mix(in srgb, var(--theme-error-500) 12%, transparent);
          border: 1px solid var(--theme-error-500);
          color: var(--theme-error-500);
          border-radius: 6px;
          padding: 8px 12px;
          margin-bottom: 14px;
          font-size: 12.5px;
        }
      `}</style>
    </div>
  )
}
