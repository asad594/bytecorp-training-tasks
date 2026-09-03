import { useState } from 'react'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import EditUserModal from './EditUserModal'
import {
  useAdminUsersQuery,
  useDeleteAdminUserMutation,
  useSetAdminUserBanStatusMutation,
} from '../../queries/useAdminQueries'

export default function AdminUsersTab() {
  const [selectedRole, setSelectedRole] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [actionError, setActionError] = useState('')

  const {
    data: users = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAdminUsersQuery(selectedRole)

  const { mutate: deleteUser, isPending: isDeleting, variables: deletingVars } = useDeleteAdminUserMutation({
    onError: (err) => setActionError(err?.response?.data?.detail || err?.message || 'Failed to delete user.'),
  })

  const { mutate: setBanStatus, isPending: isBanning, variables: banningVars } = useSetAdminUserBanStatusMutation({
    onError: (err) => setActionError(err?.response?.data?.detail || err?.message || 'Failed to update ban status.'),
  })

  const handleDelete = (u) => {
    setActionError('')
    if (!window.confirm(`Delete ${u.name || u.email}? This will soft-delete the account.`)) return
    deleteUser(u.user_id)
  }

  const handleToggleBan = (u) => {
    setActionError('')
    const nextIsBanned = !u.is_banned
    const verb = nextIsBanned ? 'ban' : 'unban'
    if (!window.confirm(`Are you sure you want to ${verb} ${u.name || u.email}?`)) return
    setBanStatus({ userId: u.user_id, isBanned: nextIsBanned })
  }

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.bio?.toLowerCase().includes(q)
    )
  })

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <Badge variant="emerald" size="sm">Admin 🛡️</Badge>
      case 'company_rep':
        return <Badge variant="purple" size="sm">Employer Rep 🏢</Badge>
      case 'job_seeker':
      default:
        return <Badge variant="cyan" size="sm">Job Seeker 👤</Badge>
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Header Banner */}
      <div className="rounded-2xl border border-white/14 bg-white/[0.06] p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1 text-xs font-semibold text-cyan-300 mb-3">
              <span>👥</span> Directory
            </div>
            <h1 className="font-sora text-2xl font-extrabold text-white sm:text-3xl">
              User Accounts
            </h1>
            <p className="mt-1 text-xs text-text-secondary sm:text-sm">
              Manage all registered job seekers, company representatives, and administrators.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={() => refetch()}
              isLoading={isFetching}
            >
              Refresh List
            </Button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Role Filter Pills */}
        <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur-md self-start flex-wrap gap-1">
          <button
            onClick={() => setSelectedRole(null)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
              selectedRole === null
                ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            All Roles
          </button>
          <button
            onClick={() => setSelectedRole('job_seeker')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
              selectedRole === 'job_seeker'
                ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Job Seekers
          </button>
          <button
            onClick={() => setSelectedRole('company_rep')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
              selectedRole === 'company_rep'
                ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Company Reps
          </button>
          <button
            onClick={() => setSelectedRole('admin')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
              selectedRole === 'admin'
                ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Admins
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or bio..."
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

      {/* Error State */}
      {isError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-center justify-between">
          <span>⚠️ {error?.response?.data?.detail || error?.message || 'Failed to fetch user accounts.'}</span>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Action Error (edit/ban/delete) */}
      {actionError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-center justify-between">
          <span>⚠️ {actionError}</span>
          <button onClick={() => setActionError('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent mb-4" />
          <p className="font-sora text-xs text-slate-300">Loading user accounts...</p>
        </div>
      ) : (
        <>
          {filteredUsers.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur-xl">
              <span className="text-4xl">🔍</span>
              <h3 className="mt-3 font-sora text-lg font-bold text-white">No Users Found</h3>
              <p className="mt-1 text-xs text-text-secondary max-w-sm mx-auto">
                {searchQuery
                  ? `No user accounts matched "${searchQuery}".`
                  : 'No user accounts found under this role.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="text-xs font-semibold text-text-secondary">
                Displaying {filteredUsers.length} User{filteredUsers.length !== 1 ? 's' : ''}
              </div>

              <div className="grid gap-3.5">
                {filteredUsers.map((u) => {
                  const joinDate = u.created_at
                    ? new Date(u.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'N/A'

                  const isThisDeleting = isDeleting && deletingVars === u.user_id
                  const isThisBanning = isBanning && banningVars?.userId === u.user_id

                  return (
                    <div
                      key={u.user_id}
                      className={`group relative rounded-2xl border p-5 shadow-lg backdrop-blur-xl transition duration-300 ${
                        u.is_banned
                          ? 'border-rose-500/30 bg-rose-500/[0.05] hover:border-rose-400/40'
                          : 'border-white/10 bg-white/[0.04] hover:border-cyan-400/30 hover:bg-white/[0.07]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 font-sora text-base font-bold text-brand-bg shadow-[0_0_12px_rgba(34,211,238,0.25)]">
                            {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <h3 className="font-sora text-base font-bold text-white group-hover:text-cyan-300 transition">
                                {u.name || 'Anonymous User'}
                              </h3>
                              {getRoleBadge(u.role)}
                              {u.is_banned && (
                                <Badge variant="rose" size="sm">Banned 🚫</Badge>
                              )}
                            </div>
                            <p className="mt-0.5 text-xs font-mono text-cyan-accent">
                              {u.email}
                            </p>
                            {u.role === 'company_rep' && (
                              <p className="mt-1 text-xs text-text-secondary">
                                Company:{' '}
                                {u.company ? (
                                  <span className="text-white font-medium">
                                    {u.company.name}
                                    {!u.company.is_verified && (
                                      <span className="ml-1.5 text-amber-400 font-normal">(pending verification)</span>
                                    )}
                                  </span>
                                ) : (
                                  <span className="text-slate-500 italic">Not associated with any company</span>
                                )}
                              </p>
                            )}
                            {u.bio && (
                              <p className="mt-2 text-xs text-text-card line-clamp-2 max-w-2xl leading-relaxed">
                                {u.bio}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Metadata Pills */}
                        <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-1.5 shrink-0 border-t sm:border-t-0 border-white/8 pt-3 sm:pt-0">
                          <div className="text-xs text-text-secondary">
                            Joined: <span className="text-white font-medium">{joinDate}</span>
                          </div>
                          {u.role === 'job_seeker' && (
                            <div className="text-xs text-text-secondary">
                              Experience: <span className="text-white font-medium">{u.years_of_experience ?? 0} yr(s)</span>
                            </div>
                          )}
                          <span className="text-[11px] font-mono text-slate-500">ID #{u.user_id}</span>
                        </div>
                      </div>

                      {/* Admin Actions */}
                      {u.role !== 'admin' && (
                        <div className="mt-4 flex items-center gap-2 border-t border-white/8 pt-3">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setEditingUser(u)}
                          >
                            ✏️ Edit
                          </Button>
                          <Button
                            variant={u.is_banned ? 'emerald' : 'outline'}
                            size="sm"
                            isLoading={isThisBanning}
                            onClick={() => handleToggleBan(u)}
                          >
                            {u.is_banned ? '✅ Unban' : '🚫 Ban'}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            isLoading={isThisDeleting}
                            onClick={() => handleDelete(u)}
                          >
                            🗑️ Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {editingUser && (
        <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} />
      )}
    </div>
  )
}

