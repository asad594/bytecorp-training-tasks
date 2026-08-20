import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BriefcaseIcon, SpinnerIcon } from '@/assets/icons'
import colors from '@/styles/colors'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import useAuth from '../../hooks/useAuth'
import { getPendingCompanies, verifyCompany } from '../../api/companiesApi'

export default function AdminCompanies() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [verifyingId, setVerifyingId] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const userDisplayName = user?.name || user?.email?.split('@')[0] || 'Admin'

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getPendingCompanies()
      setCompanies(data)
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Failed to fetch pending companies.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount, not a bug
    fetchPending()
  }, [fetchPending])

  const handleVerify = async (companyId, companyName) => {
    try {
      setVerifyingId(companyId)
      setError(null)
      setSuccessMessage(null)
      await verifyCompany(companyId, true)
      setSuccessMessage(`Company "${companyName}" was successfully verified!`)
      setCompanies((prev) => prev.filter((c) => c.company_id !== companyId))
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Failed to verify company.'
      setError(msg)
    } finally {
      setVerifyingId(null)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login/admin')
  }

  return (
    <div className="relative min-h-screen bg-brand-bg text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-900 overflow-hidden">
      {/* Background Animated Glow Orbs */}
      <div className="pointer-events-none fixed -top-40 -left-40 h-[550px] w-[550px] rounded-full bg-cyan-500/15 blur-[130px] animate-pulse-glow" />
      <div
        className="pointer-events-none fixed top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-[140px] animate-pulse-glow"
        style={{ animationDelay: '3s' }}
      />

      {/* Sticky Admin Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-brand-bg/85 backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5 font-sora text-xl font-extrabold text-white group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-[0_0_18px_rgba(34,211,238,0.5)] transition duration-300 group-hover:scale-110">
              <BriefcaseIcon width="20" height="20" stroke={colors.background.main} strokeWidth="2.5" />
            </div>
            <span className="bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
              JobBoard <span className="text-xs font-semibold text-cyan-400">Admin</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-md">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 text-[0.7rem] font-bold text-brand-bg">
                {(user?.name || user?.email || 'A')[0].toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-slate-200">
                {userDisplayName}
              </span>
            </div>

            <Button variant="ghost" size="md" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 pt-8 pb-16 sm:px-8">
        <div className="flex flex-col gap-6">
          {/* Header Banner */}
          <div className="rounded-2xl border border-white/14 bg-white/[0.06] p-6 sm:p-8 backdrop-blur-xl shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1 text-xs font-semibold text-cyan-300 mb-3">
                  <span>🛡️</span> Admin Portal
                </div>
                <h1 className="font-sora text-2xl font-extrabold text-white sm:text-3xl">
                  Company Verifications
                </h1>
                <p className="mt-1 text-xs text-text-secondary sm:text-sm">
                  Review and verify registered employer companies to enable their job posting capabilities.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="secondary" size="md" onClick={fetchPending} isLoading={loading}>
                  Refresh List
                </Button>
              </div>
            </div>
          </div>

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
            <div className="mt-12 flex flex-col items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent mb-4" />
              <p className="font-sora text-xs text-slate-300">Fetching pending verification requests...</p>
            </div>
          )}

          {/* Companies List */}
          {!loading && (
            <>
              {companies.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur-xl">
                  <span className="text-4xl">🎉</span>
                  <h3 className="mt-3 font-sora text-lg font-bold text-white">All Caught Up!</h3>
                  <p className="mt-1 text-xs text-text-secondary max-w-sm mx-auto">
                    There are no pending company verifications right now. All registered employers have been reviewed.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="text-xs font-semibold text-text-secondary">
                    Pending Requests ({companies.length})
                  </div>
                  <div className="grid gap-4">
                    {companies.map((company) => {
                      const isActionBusy = verifyingId === company.company_id
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
                                {company.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-3 flex-wrap">
                                  <h3 className="font-sora text-lg font-bold text-white group-hover:text-cyan-300 transition">
                                    {company.name}
                                  </h3>
                                  <Badge variant="amber" size="sm">
                                    Pending Approval ⏳
                                  </Badge>
                                </div>
                                <p className="mt-1 text-xs text-text-secondary">
                                  Reg #: <span className="font-mono text-white">{company.registration_number}</span> · {company.location || 'Location Not Specified'} · Registered on {createdDate}
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

                            <div className="flex items-center gap-3 shrink-0">
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
                                    <span>Verifying...</span>
                                  </>
                                ) : (
                                  <span>Verify Company ✓</span>
                                )}
                              </Button>
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
      </main>
    </div>
  )
}
