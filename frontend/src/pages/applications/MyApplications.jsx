import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BriefcaseIcon } from '@/assets/icons'
import colors from '@/styles/colors'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import { getApplicationStatusVariant } from '../../utils/statusVariants'
import useAuth from '../../hooks/useAuth'
import {
  useEnrichedMyApplicationsQuery,
  useWithdrawApplicationMutation,
} from '../../queries/useApplicationsQueries'
import { formatRelativeTime } from '../../utils/formatters'

export default function MyApplications() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const {
    data: enrichedApps = [],
    isLoading: loading,
    error: queryError,
    refetch: fetchApplicationsData,
  } = useEnrichedMyApplicationsQuery()

  const error = queryError
    ? queryError.response?.data?.detail ||
      queryError.message ||
      'Failed to load applications. Please try again.'
    : null

  const withdrawMutation = useWithdrawApplicationMutation()
  const [activeTab, setActiveTab] = useState('All')
  const [withdrawingId, setWithdrawingId] = useState(null)


  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) {
      return
    }
    setWithdrawingId(applicationId)
    try {
      await withdrawMutation.mutateAsync(applicationId)
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to withdraw application.')
    } finally {
      setWithdrawingId(null)
    }
  }

  const filteredApps = enrichedApps.filter((app) => {
    if (activeTab === 'All') return true
    return app.status.toLowerCase() === activeTab.toLowerCase()
  })

  const userDisplayName = user?.name || user?.email?.split('@')[0] || 'Seeker'

  return (
    <div className="relative min-h-screen bg-brand-bg text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-900 overflow-hidden">
      {/* Background Animated Glow Orbs */}
      <div className="pointer-events-none fixed -top-40 -left-40 h-[550px] w-[550px] rounded-full bg-cyan-500/15 blur-[130px] animate-pulse-glow" />
      <div
        className="pointer-events-none fixed top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-[140px] animate-pulse-glow"
        style={{ animationDelay: '3s' }}
      />

      {/* Sticky Header Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-brand-bg/85 backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-sora text-xl font-extrabold text-white group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-[0_0_18px_rgba(34,211,238,0.5)] transition duration-300 group-hover:scale-110">
              <BriefcaseIcon width="20" height="20" stroke={colors.background.main} strokeWidth="2.5" />
            </div>
            <span className="bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
              JobBoard
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              to="/jobs"
              className="text-sm font-medium text-slate-300 transition hover:text-cyan-400 hover:scale-105"
            >
              Jobs
            </Link>
            <Link
              to="/applications"
              className="text-sm font-semibold text-cyan-400 transition border-b-2 border-cyan-400 pb-0.5"
            >
              My Applications
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-md">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 text-[0.7rem] font-bold text-brand-bg">
                {(user?.name || user?.email || 'U')[0].toUpperCase()}
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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="font-sora text-3xl font-extrabold text-white">
              My Job Applications
            </h1>
            <p className="text-xs text-text-desc mt-1">
              Track the status of your submitted applications across companies.
            </p>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-md">
            {['All', 'Pending', 'Reviewed', 'Shortlisted', 'Rejected'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-cyan-400 to-indigo-400 text-brand-bg shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mt-16 flex flex-col items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent mb-4" />
            <p className="font-sora text-sm text-slate-300">Loading your applications...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="mt-10 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 text-center backdrop-blur-xl">
            <span className="text-4xl">⚠️</span>
            <h3 className="mt-3 font-sora text-lg font-bold text-white">Failed to Load Applications</h3>
            <p className="mt-2 text-xs text-rose-300 max-w-md mx-auto">{error}</p>
            <div className="mt-6">
              <Button variant="primary" size="md" onClick={fetchApplicationsData}>
                Retry Loading
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredApps.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur-xl my-8">
            <span className="text-5xl">📄</span>
            <h3 className="mt-4 font-sora text-xl font-bold text-white">No Applications Found</h3>
            <p className="mt-2 text-xs text-text-secondary max-w-sm mx-auto mb-6">
              {activeTab === 'All'
                ? "You haven't submitted any job applications yet. Start exploring open engineering and product roles!"
                : `No applications currently matched the "${activeTab}" status filter.`}
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/jobs')}
            >
              Browse Available Jobs →
            </Button>
          </div>
        )}

        {/* Applications Grid */}
        {!loading && !error && filteredApps.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredApps.map((app) => (
              <div
                key={app.application_id}
                className="group relative rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-lg backdrop-blur-xl transition duration-300 hover:border-cyan-400/40 hover:bg-white/[0.07]"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <Link
                      to={`/jobs/${app.job}`}
                      className="font-sora text-base font-bold text-white hover:text-cyan-300 transition"
                    >
                      {app.jobTitle}
                    </Link>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {app.companyName} · {app.location}
                    </p>
                  </div>

                  <Badge
                    variant={getApplicationStatusVariant(app.status)}
                    size="md"
                  >
                    {app.status.toUpperCase()}
                  </Badge>
                </div>

                {app.cover_letter && (
                  <div className="mb-4 rounded-xl border border-white/5 bg-white/5 p-3 text-xs text-text-desc leading-relaxed">
                    <span className="font-semibold text-slate-300 block mb-1">Cover Letter:</span>
                    "{app.cover_letter}"
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs">
                  <span className="text-slate-400">
                    Applied: <strong className="text-slate-200">{formatRelativeTime(app.created_at)}</strong>
                  </span>

                  <div className="flex items-center gap-3">
                    <Link
                      to={`/jobs/${app.job}`}
                      className="text-xs font-semibold text-cyan-accent hover:underline"
                    >
                      View Job →
                    </Link>
                    <button
                      onClick={() => handleWithdraw(app.application_id)}
                      disabled={withdrawingId === app.application_id}
                      className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition cursor-pointer disabled:opacity-50"
                    >
                      {withdrawingId === app.application_id ? 'Withdrawing...' : 'Withdraw'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
