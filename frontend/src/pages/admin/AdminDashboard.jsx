import { useParams, useNavigate, Link } from 'react-router-dom'
import { BriefcaseIcon } from '@/assets/icons'
import colors from '@/styles/colors'
import Button from '../../components/common/Button'
import useAuth from '../../hooks/useAuth'

import AdminOverviewTab from './AdminOverviewTab'
import AdminCompaniesTab from './AdminCompaniesTab'
import AdminSkillsTab from './AdminSkillsTab'
import AdminUsersTab from './AdminUsersTab'
import AdminAdminsTab from './AdminAdminsTab'

export default function AdminDashboard({ defaultTab = 'overview' }) {
  const { tab } = useParams()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const currentTab = tab || defaultTab

  const handleTabChange = (newTab) => {
    navigate(`/admin/${newTab}`)
  }

  const handleLogout = () => {
    logout()
    navigate('/login/admin')
  }

  const userDisplayName = user?.name || user?.email?.split('@')[0] || 'Admin'

  const tabsConfig = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'companies', label: 'Companies', icon: '🏢' },
    { key: 'skills', label: 'Skills', icon: '⚡' },
    { key: 'users', label: 'Users', icon: '👥' },
    { key: 'admins', label: 'Admins', icon: '🛡️' },
  ]

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'companies':
        return <AdminCompaniesTab />
      case 'skills':
        return <AdminSkillsTab />
      case 'users':
        return <AdminUsersTab />
      case 'admins':
        return <AdminAdminsTab />
      case 'overview':
      default:
        return <AdminOverviewTab onNavigateTab={handleTabChange} />
    }
  }

  return (
    <div className="relative min-h-screen bg-brand-bg text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-900 overflow-hidden">
      {/* Background Animated Glow Orbs */}
      <div className="pointer-events-none fixed -top-40 -left-40 h-[550px] w-[550px] rounded-full bg-cyan-500/15 blur-[130px] animate-pulse-glow" />
      <div
        className="pointer-events-none fixed top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-[140px] animate-pulse-glow"
        style={{ animationDelay: '3s' }}
      />
      <div
        className="pointer-events-none fixed -bottom-40 left-1/3 h-[450px] w-[450px] rounded-full bg-cyan-600/10 blur-[150px] animate-pulse-glow"
        style={{ animationDelay: '6s' }}
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

        {/* Horizontal Navigation Tabs Bar */}
        <div className="border-t border-white/6 bg-white/[0.02] backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 sm:px-8 overflow-x-auto py-2 scrollbar-none">
            {tabsConfig.map((item) => {
              const isActive = currentTab === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => handleTabChange(item.key)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-bold shadow-[0_0_14px_rgba(34,211,238,0.3)]'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 pt-8 pb-16 sm:px-8">
        {renderActiveTab()}
      </main>
    </div>
  )
}
