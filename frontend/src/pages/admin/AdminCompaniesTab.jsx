import { useState, useEffect, useCallback } from 'react'
import { SpinnerIcon } from '@/assets/icons'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import { getPendingCompanies, getCompanies, verifyCompany } from '../../api/companiesApi'

export default function AdminCompaniesTab() {
  const [activeView, setActiveView] = useState('pending') // 'pending' | 'all'
  const [pendingCompanies, setPendingCompanies] = useState([])
  const [allCompanies, setAllCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionBusyId, setActionBusyId] = useState(null)
  const [confirmingRevokeId, setConfirmingRevokeId] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')


  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      if (activeView === 'pending') {
        const data = await getPendingCompanies()
        setPendingCompanies(data)
      } else {
        const data = await getCompanies()
        setAllCompanies(data)
      }
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to fetch companies.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [activeView])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount/change, not a bug
    fetchCompanies()
  }, [fetchCompanies])


  const handleVerify = async (companyId, companyName) => {
    try {
      setActionBusyId(companyId)
      setError(null)
      setSuccessMessage(null)
      await verifyCompany(companyId, true)
      setSuccessMessage(`Company "${companyName}" was successfully verified!`)
      // Update local states
      setPendingCompanies((prev) => prev.filter((c) => c.company_id !== companyId))
      setAllCompanies((prev) =>
        prev.map((c) => (c.company_id === companyId ? { ...c, is_verified: true } : c))
      )
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to verify company.'
      setError(msg)
    } finally {
      setActionBusyId(null)
    }
  }

  const handleReject = async (companyId, companyName) => {
    try {
      setActionBusyId(companyId)
      setError(null)
      setSuccessMessage(null)
      await verifyCompany(companyId, false)
      setSuccessMessage(`Company "${companyName}" verification was rejected.`)
      // Update local states
      setPendingCompanies((prev) => prev.filter((c) => c.company_id !== companyId))
      setAllCompanies((prev) =>
        prev.map((c) => (c.company_id === companyId ? { ...c, is_verified: false } : c))
      )
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to reject company verification.'
      setError(msg)
    } finally {
      setActionBusyId(null)
    }
  }

  const currentList = activeView === 'pending' ? pendingCompanies : allCompanies
  const filteredList = currentList.filter((company) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      company.name?.toLowerCase().includes(q) ||
      company.registration_number?.toLowerCase().includes(q) ||
      company.location?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Header Banner */}
      <div className="rounded-2xl border border-white/14 bg-white/[0.06] p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1 text-xs font-semibold text-cyan-300 mb-3">
              <span>🛡️</span> Company Management
            </div>
            <h1 className="font-sora text-2xl font-extrabold text-white sm:text-3xl">
              Company Verifications
            </h1>
            <p className="mt-1 text-xs text-text-secondary sm:text-sm">
              Review and verify registered employer companies to enable their job posting capabilities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" size="md" onClick={fetchCompanies} isLoading={loading}>
              Refresh List
            </Button>
          </div>
        </div>
      </div>

      {/* View Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Toggle Pills */}
        <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur-md self-start">
          <button
            onClick={() => {
              setActiveView('pending')
              setConfirmingRevokeId(null)
            }}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeView === 'pending'
                ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>Pending Approvals</span>
            {pendingCompanies.length > 0 && (
              <span className="rounded-full bg-amber-400 text-slate-950 px-1.5 py-0.2 text-[10px] font-bold">
                {pendingCompanies.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveView('all')
              setConfirmingRevokeId(null)
            }}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeView === 'all'
                ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>All Companies</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, reg # or location..."
            className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2 text-xs text-white placeholder-slate-500 transition focus:border-cyan-400/60 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* All Companies Static Help Banner */}
      {activeView === 'all' && (
        <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-2.5 text-xs text-text-secondary flex items-center gap-2">
          <span className="text-cyan-400 font-semibold text-sm">ℹ️</span>
          <span>
            Revoking verification blocks the company from posting new jobs going forward. It does not hide or remove jobs the company already posted.
          </span>
        </div>
      )}


      {/* Success Banner */}
      {successMessage && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-200 flex items-center justify-between">
          <span>✓ {successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-300 hover:text-white font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button
            onClick={() => setError(null)}
            className="text-rose-300 hover:text-white font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent mb-4" />
          <p className="font-sora text-xs text-slate-300">
            {activeView === 'pending' ? 'Fetching pending requests...' : 'Fetching registered companies...'}
          </p>
        </div>
      )}

      {/* Companies List */}
      {!loading && (
        <>
          {filteredList.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur-xl">
              <span className="text-4xl">{activeView === 'pending' ? '🎉' : '🏢'}</span>
              <h3 className="mt-3 font-sora text-lg font-bold text-white">
                {activeView === 'pending' ? 'All Caught Up!' : 'No Companies Found'}
              </h3>
              <p className="mt-1 text-xs text-text-secondary max-w-sm mx-auto">
                {activeView === 'pending'
                  ? 'There are no pending company verifications right now. All registered employers have been reviewed.'
                  : searchQuery
                  ? `No companies matched "${searchQuery}".`
                  : 'No companies are currently registered on the platform.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="text-xs font-semibold text-text-secondary">
                {activeView === 'pending'
                  ? `Pending Requests (${filteredList.length})`
                  : `Registered Companies (${filteredList.length})`}
              </div>
              <div className="grid gap-4">
                {filteredList.map((company) => {
                  const isActionBusy = actionBusyId === company.company_id
                  const createdDate = company.created_at
                    ? new Date(company.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'N/A'

                  return (
                    <div
                      key={company.company_id}
                      className="group relative rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-lg backdrop-blur-xl transition duration-300 hover:border-cyan-400/40 hover:bg-white/[0.07]"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex items-start gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 font-sora text-xl font-bold text-brand-bg shadow-[0_0_16px_rgba(34,211,238,0.3)]">
                            {company.name?.charAt(0).toUpperCase() || 'C'}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="font-sora text-lg font-bold text-white group-hover:text-cyan-300 transition">
                                {company.name}
                              </h3>
                              {company.is_verified ? (
                                <Badge variant="emerald" size="sm">
                                  Verified ✓
                                </Badge>
                              ) : (
                                <Badge variant="amber" size="sm">
                                  Pending Approval ⏳
                                </Badge>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-text-secondary">
                              Reg #: <span className="font-mono text-white">{company.registration_number}</span> ·{' '}
                              {company.location || 'Location Not Specified'} · Registered on {createdDate}
                            </p>
                            {company.description && (
                              <p className="mt-2 text-xs text-text-card line-clamp-2 max-w-2xl leading-relaxed">
                                {company.description}
                              </p>
                            )}
                            {company.website && (
                              <a
                                href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1.5 inline-block text-xs text-cyan-accent hover:underline"
                              >
                                🌐 {company.website}
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2.5 shrink-0">
                          {!company.is_verified ? (
                            <>
                              <Button
                                variant="primary"
                                size="md"
                                isLoading={isActionBusy}
                                disabled={isActionBusy}
                                onClick={() => handleVerify(company.company_id, company.name)}
                                className="whitespace-nowrap"
                              >
                                {isActionBusy ? (
                                  <>
                                    <SpinnerIcon />
                                    <span>Processing...</span>
                                  </>
                                ) : (
                                  <span>Verify Company ✓</span>
                                )}
                              </Button>

                              <button
                                type="button"
                                disabled={isActionBusy}
                                onClick={() => handleReject(company.company_id, company.name)}
                                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/50 transition cursor-pointer disabled:opacity-50"
                              >
                                Reject ✕
                              </button>
                            </>
                          ) : confirmingRevokeId === company.company_id ? (
                            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                              <span className="text-[11px] text-amber-300 font-medium whitespace-nowrap">
                                Revoke verification?
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={isActionBusy}
                                  onClick={() => {
                                    setConfirmingRevokeId(null)
                                    handleReject(company.company_id, company.name)
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
                                >
                                  {isActionBusy ? 'Revoking...' : 'Confirm Revoke'}
                                </button>
                                <button
                                  type="button"
                                  disabled={isActionBusy}
                                  onClick={() => setConfirmingRevokeId(null)}
                                  className="px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={isActionBusy}
                              onClick={() => setConfirmingRevokeId(company.company_id)}
                              className="px-3 py-1.5 rounded-lg text-[11px] font-medium border border-rose-500/20 bg-white/[0.02] text-slate-400 hover:text-rose-300 hover:border-rose-500/40 hover:bg-rose-500/5 transition cursor-pointer disabled:opacity-50"
                            >
                              Revoke Verification
                            </button>
                          )}

                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
