import AnimatedCounter from '../../components/common/AnimatedCounter'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import { useAdminStatsQuery } from '../../queries/useAdminQueries'

export default function AdminOverviewTab({ onNavigateTab }) {
  const { data: stats, isLoading, isError, error, refetch, isFetching } = useAdminStatsQuery()

  const userStats = stats?.users || { total: 0, job_seekers: 0, company_reps: 0, admins: 0 }
  const companyStats = stats?.companies || { total: 0, verified: 0, pending: 0 }
  const jobStats = stats?.jobs || { total: 0, open: 0, closed: 0, draft: 0 }
  const applicationStats = stats?.applications || {
    total: 0,
    pending: 0,
    reviewed: 0,
    shortlisted: 0,
    rejected: 0,
  }
  const skillStats = stats?.skills || { total: 0 }

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      {/* Header Banner */}
      <div className="rounded-2xl border border-white/14 bg-white/[0.06] p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1 text-xs font-semibold text-cyan-300 mb-3">
              <span>📊</span> System Analytics
            </div>
            <h1 className="font-sora text-2xl font-extrabold text-white sm:text-3xl">
              Platform Overview
            </h1>
            <p className="mt-1 text-xs text-text-secondary sm:text-sm">
              Live statistics and operational metrics across users, companies, jobs, applications, and skills.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={() => refetch()}
              isLoading={isFetching}
            >
              Refresh Stats
            </Button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {isError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-center justify-between">
          <span>⚠️ {error?.response?.data?.detail || error?.message || 'Failed to load platform stats.'}</span>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent mb-4" />
          <p className="font-sora text-xs text-slate-300">Loading platform statistics...</p>
        </div>
      ) : (
        <>
          {/* Top Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Users */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-lg backdrop-blur-xl transition duration-300 hover:border-cyan-400/40 hover:bg-white/[0.07] group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Total Users
                </span>
                <span className="text-xl">👥</span>
              </div>
              <div className="mt-3 font-sora text-3xl font-extrabold text-white group-hover:text-cyan-300 transition">
                <AnimatedCounter end={userStats.total} />
              </div>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <Badge variant="cyan" size="sm">{userStats.job_seekers} Seekers</Badge>
                <Badge variant="purple" size="sm">{userStats.company_reps} Reps</Badge>
                <Badge variant="emerald" size="sm">{userStats.admins} Admins</Badge>
              </div>
            </div>

            {/* Companies */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-lg backdrop-blur-xl transition duration-300 hover:border-indigo-400/40 hover:bg-white/[0.07] group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Companies
                </span>
                <span className="text-xl">🏢</span>
              </div>
              <div className="mt-3 font-sora text-3xl font-extrabold text-white group-hover:text-indigo-300 transition">
                <AnimatedCounter end={companyStats.total} />
              </div>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <Badge variant="emerald" size="sm">{companyStats.verified} Verified</Badge>
                {companyStats.pending > 0 ? (
                  <Badge variant="amber" size="sm">{companyStats.pending} Pending ⏳</Badge>
                ) : (
                  <Badge variant="slate" size="sm">0 Pending</Badge>
                )}
              </div>
            </div>

            {/* Jobs */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-lg backdrop-blur-xl transition duration-300 hover:border-emerald-400/40 hover:bg-white/[0.07] group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Jobs Posted
                </span>
                <span className="text-xl">💼</span>
              </div>
              <div className="mt-3 font-sora text-3xl font-extrabold text-white group-hover:text-emerald-300 transition">
                <AnimatedCounter end={jobStats.total} />
              </div>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <Badge variant="emerald" size="sm">{jobStats.open} Open</Badge>
                <Badge variant="slate" size="sm">{jobStats.draft} Draft</Badge>
                <Badge variant="rose" size="sm">{jobStats.closed} Closed</Badge>
              </div>
            </div>

            {/* Applications */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-lg backdrop-blur-xl transition duration-300 hover:border-amber-400/40 hover:bg-white/[0.07] group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Applications
                </span>
                <span className="text-xl">📄</span>
              </div>
              <div className="mt-3 font-sora text-3xl font-extrabold text-white group-hover:text-amber-300 transition">
                <AnimatedCounter end={applicationStats.total} />
              </div>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <Badge variant="amber" size="sm">{applicationStats.pending} Pending</Badge>
                <Badge variant="emerald" size="sm">{applicationStats.shortlisted} Shortlisted</Badge>
              </div>
            </div>
          </div>

          {/* Detailed Metric Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Breakdown Card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-lg backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="font-sora text-base font-bold text-white flex items-center gap-2">
                  <span>👤</span> User Demographics
                </h3>
                <span className="text-xs text-text-secondary">
                  {userStats.total} Total
                </span>
              </div>
              <div className="mt-4 flex flex-col gap-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Job Seekers</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{userStats.job_seekers}</span>
                    <Badge variant="cyan" size="sm">
                      {userStats.total > 0
                        ? `${Math.round((userStats.job_seekers / userStats.total) * 100)}%`
                        : '0%'}
                    </Badge>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full"
                    style={{
                      width: `${userStats.total > 0 ? (userStats.job_seekers / userStats.total) * 100 : 0}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-slate-300">Company Representatives</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{userStats.company_reps}</span>
                    <Badge variant="purple" size="sm">
                      {userStats.total > 0
                        ? `${Math.round((userStats.company_reps / userStats.total) * 100)}%`
                        : '0%'}
                    </Badge>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full"
                    style={{
                      width: `${userStats.total > 0 ? (userStats.company_reps / userStats.total) * 100 : 0}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-slate-300">Platform Administrators</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{userStats.admins}</span>
                    <Badge variant="emerald" size="sm">
                      {userStats.total > 0
                        ? `${Math.round((userStats.admins / userStats.total) * 100)}%`
                        : '0%'}
                    </Badge>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                    style={{
                      width: `${userStats.total > 0 ? (userStats.admins / userStats.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => onNavigateTab?.('users')}
                >
                  View All Users →
                </Button>
              </div>
            </div>

            {/* Applications Breakdown Card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-lg backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="font-sora text-base font-bold text-white flex items-center gap-2">
                  <span>📬</span> Application Pipeline
                </h3>
                <span className="text-xs text-text-secondary">
                  {applicationStats.total} Total
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                  <span className="text-[11px] text-amber-300 font-medium">Pending</span>
                  <div className="mt-1 font-sora text-xl font-bold text-white">
                    {applicationStats.pending}
                  </div>
                </div>
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
                  <span className="text-[11px] text-cyan-300 font-medium">Reviewed</span>
                  <div className="mt-1 font-sora text-xl font-bold text-white">
                    {applicationStats.reviewed}
                  </div>
                </div>
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <span className="text-[11px] text-emerald-300 font-medium">Shortlisted</span>
                  <div className="mt-1 font-sora text-xl font-bold text-white">
                    {applicationStats.shortlisted}
                  </div>
                </div>
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
                  <span className="text-[11px] text-rose-300 font-medium">Rejected</span>
                  <div className="mt-1 font-sora text-xl font-bold text-white">
                    {applicationStats.rejected}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-text-secondary">
                <span>Active Skills Library:</span>
                <Badge variant="cyan" size="sm">{skillStats.total} Skills</Badge>
              </div>
            </div>

            {/* Quick Actions & Short-cuts Card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-lg backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="border-b border-white/10 pb-4">
                  <h3 className="font-sora text-base font-bold text-white flex items-center gap-2">
                    <span>⚡</span> Quick Management
                  </h3>
                  <p className="mt-1 text-xs text-text-secondary">
                    Direct access to core administrative operational modules.
                  </p>
                </div>
                <div className="mt-4 flex flex-col gap-2.5">
                  <button
                    onClick={() => onNavigateTab?.('companies')}
                    className="flex items-center justify-between w-full rounded-xl border border-white/8 bg-white/[0.03] p-3 text-left transition hover:border-cyan-400/40 hover:bg-white/[0.07] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">🏢</span>
                      <div>
                        <div className="text-xs font-semibold text-white">Company Verifications</div>
                        <div className="text-[11px] text-text-secondary">
                          {companyStats.pending} pending requests
                        </div>
                      </div>
                    </div>
                    {companyStats.pending > 0 && (
                      <Badge variant="amber" size="sm">Action Req</Badge>
                    )}
                  </button>

                  <button
                    onClick={() => onNavigateTab?.('skills')}
                    className="flex items-center justify-between w-full rounded-xl border border-white/8 bg-white/[0.03] p-3 text-left transition hover:border-cyan-400/40 hover:bg-white/[0.07] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">⚡</span>
                      <div>
                        <div className="text-xs font-semibold text-white">Skills Library</div>
                        <div className="text-[11px] text-text-secondary">
                          {skillStats.total} standard tags
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-cyan-400 font-semibold">Manage →</span>
                  </button>

                  <button
                    onClick={() => onNavigateTab?.('admins')}
                    className="flex items-center justify-between w-full rounded-xl border border-white/8 bg-white/[0.03] p-3 text-left transition hover:border-cyan-400/40 hover:bg-white/[0.07] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">🛡️</span>
                      <div>
                        <div className="text-xs font-semibold text-white">Admin Management</div>
                        <div className="text-[11px] text-text-secondary">
                          {userStats.admins} platform admin(s)
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-indigo-400 font-semibold">Add New +</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
