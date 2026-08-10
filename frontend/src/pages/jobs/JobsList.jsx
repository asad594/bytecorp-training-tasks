import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import JobCard from '../../components/jobs/JobCard'
import JobDetailModal from '../../components/jobs/JobDetailModal'
import useBookmarks from '../../hooks/useBookmarks'
import useAuth from '../../hooks/useAuth'
import * as jobsApi from '../../api/jobsApi'
import * as companiesApi from '../../api/companiesApi'

const LOGO_BG_PALETTE = [
  'from-cyan-400 to-blue-500',
  'from-[#818cf8] to-purple-600',
  'from-emerald-400 to-teal-600',
  'from-amber-400 to-orange-500',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-teal-400',
  'from-indigo-500 to-cyan-500',
  'from-red-500 to-purple-600',
]

function formatRelativeTime(dateString) {
  if (!dateString) return 'Recently'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Recently'

  const now = new Date()
  const diffMs = now - date
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
  if (diffDays < 30) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
  return 'Recently'
}

function formatSalary(min, max) {
  if (min && max) {
    const minK = (min / 1000).toFixed(0)
    const maxK = (max / 1000).toFixed(0)
    return `$${minK}k - $${maxK}k`
  }
  if (min) {
    return `$${(min / 1000).toFixed(0)}k+`
  }
  return 'Competitive'
}

export default function JobsList() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { toggleBookmark, isBookmarked } = useBookmarks()

  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [locationFilter, setLocationFilter] = useState('All Locations')
  const [activeTab, setActiveTab] = useState('All')
  const [selectedJobModal, setSelectedJobModal] = useState(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [appliedSuccess, setAppliedSuccess] = useState(false)

  const submitTimerRef = useRef(null)

  const fetchJobsAndCompanies = async () => {
    try {
      setLoading(true)
      setError(null)
      const rawJobs = await jobsApi.getJobs()

      // Extract unique company IDs to deduplicate requests
      const uniqueCompanyIds = [
        ...new Set((rawJobs || []).map((j) => j.company).filter(Boolean)),
      ]

      // Fetch all needed companies in parallel
      const companyMap = {}
      await Promise.all(
        uniqueCompanyIds.map(async (id) => {
          try {
            const companyData = await companiesApi.getCompany(id)
            companyMap[id] = companyData?.name || 'Company'
          } catch {
            companyMap[id] = 'Company'
          }
        })
      )

      // Transform raw backend jobs into frontend shape
      const transformedJobs = (rawJobs || []).map((job) => {
        const companyName = companyMap[job.company] || 'Company'
        const rawType = (job.employment_type || '').toLowerCase()

        let displayType = 'Full-time'
        if (rawType === 'part-time') displayType = 'Part-time'
        else if (rawType === 'contract') displayType = 'Contract'
        else if (rawType === 'full-time') displayType = 'Full-time'
        else if (job.employment_type) displayType = job.employment_type

        const logoBg =
          LOGO_BG_PALETTE[(job.job_id || 0) % LOGO_BG_PALETTE.length]
        const logoLetter = (companyName[0] || 'C').toUpperCase()

        return {
          id: job.job_id,
          title: job.title || 'Untitled Role',
          company: companyName,
          location: job.location || 'Remote',
          description: job.description || '',
          salary: formatSalary(job.salary_min, job.salary_max),
          posted: formatRelativeTime(job.created_at),
          type: displayType,
          rawType: rawType,
          tags: [displayType, job.location].filter(Boolean),
          requirements: [],
          logoLetter,
          logoBg,
        }
      })

      setJobs(transformedJobs)
    } catch (err) {
      console.error('Failed to fetch jobs:', err)
      setError(
        err.response?.data?.detail ||
          err.message ||
          'Failed to load job listings. Please check your connection and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobsAndCompanies()

    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (submitTimerRef.current) clearTimeout(submitTimerRef.current)
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleQuickApply = (e, job) => {
    e.stopPropagation()
    setSelectedJobModal(job)
    setAppliedSuccess(false)
  }

  const handleCloseModal = () => {
    if (submitTimerRef.current) clearTimeout(submitTimerRef.current)
    setSelectedJobModal(null)
    setAppliedSuccess(false)
  }

  const submitApplication = (e) => {
    e.preventDefault()
    setAppliedSuccess(true)
    if (submitTimerRef.current) clearTimeout(submitTimerRef.current)
    submitTimerRef.current = setTimeout(() => {
      setSelectedJobModal(null)
      setAppliedSuccess(false)
    }, 1500)
  }

  // Derive distinct locations from fetched jobs for dropdown
  const distinctLocations = [
    'All Locations',
    ...new Set(jobs.map((j) => j.location).filter(Boolean)),
  ]

  // Filter jobs based on search query, location dropdown, and category tab
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesLocation =
      locationFilter === 'All Locations' ||
      job.location.toLowerCase().includes(locationFilter.toLowerCase())

    const matchesTab =
      activeTab === 'All' ||
      (activeTab === 'Full-time' && job.rawType === 'full-time') ||
      (activeTab === 'Part-time' && job.rawType === 'part-time') ||
      (activeTab === 'Contract' && job.rawType === 'contract')

    return matchesSearch && matchesLocation && matchesTab
  })

  const userDisplayName = user?.name || user?.email?.split('@')[0] || 'there'

  return (
    <div className="relative min-h-screen bg-[#0b0f1e] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-900 overflow-hidden">
      {/* Background Animated Glow Orbs */}
      <div className="pointer-events-none fixed -top-40 -left-40 h-[550px] w-[550px] rounded-full bg-cyan-500/15 blur-[130px] animate-pulse-glow" />
      <div
        className="pointer-events-none fixed top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-[140px] animate-pulse-glow"
        style={{ animationDelay: '3s' }}
      />
      <div
        className="pointer-events-none fixed bottom-10 left-1/4 h-[450px] w-[450px] rounded-full bg-teal-500/15 blur-[120px] animate-pulse-glow"
        style={{ animationDelay: '6s' }}
      />

      {/* Sticky Header Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0b0f1e]/85 backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 font-sora text-xl font-extrabold text-white group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-[0_0_18px_rgba(34,211,238,0.5)] transition duration-300 group-hover:scale-110">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="7"
                  width="18"
                  height="13"
                  rx="2"
                  stroke="#0b0f1e"
                  strokeWidth="2.5"
                />
                <path
                  d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                  stroke="#0b0f1e"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
            <span className="bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent group-hover:to-indigo-300 transition">
              JobBoard
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              to="/jobs"
              className="text-sm font-semibold text-cyan-400 transition border-b-2 border-cyan-400 pb-0.5"
            >
              Jobs
            </Link>
            <Link
              to="/applications"
              className="text-sm font-medium text-slate-300 transition hover:text-cyan-400 hover:scale-105"
            >
              My Applications
            </Link>
          </nav>

          {/* User Info & Logout Button */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-md">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 text-[0.7rem] font-bold text-[#0b0f1e]">
                {(user?.name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-slate-200">
                {user?.name || user?.email || 'Job Seeker'}
              </span>
            </div>

            <Button variant="ghost" size="md" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Personalized Welcome Header */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-10 pb-8 sm:px-8 lg:pt-14 lg:pb-10">
        <div className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 backdrop-blur-md w-fit">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold text-cyan-300">
              Job Seeker Portal
            </span>
          </div>

          <h1 className="font-sora text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              {userDisplayName}
            </span>
          </h1>

          <p className="max-w-2xl text-sm leading-relaxed text-[#a8b0cc] sm:text-base">
            Explore active openings, filter by location or contract type, and connect directly with hiring teams.
          </p>
        </div>

        {/* Search Bar Box */}
        <div className="mt-8 rounded-2xl border border-white/14 bg-white/[0.06] p-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl transition duration-300 hover:border-cyan-400/30 focus-within:border-cyan-400/50 focus-within:shadow-[0_0_30px_rgba(34,211,238,0.2)]">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 transition focus-within:border-cyan-400/40">
              <span className="text-slate-400 text-lg">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by job title, company, or location..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
              />
            </div>

            {/* Location Select */}
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-3 sm:w-48 transition focus-within:border-cyan-400/40">
              <span className="text-slate-400 text-lg">📍</span>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full bg-transparent text-sm text-white outline-none cursor-pointer [&>option]:bg-[#0b0f1e]"
              >
                {distinctLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Action Button */}
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                const elem = document.getElementById('jobs-grid')
                elem?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="btn-gradient-shimmer px-6 py-3.5"
            >
              <span>Search Roles</span>
              <span>→</span>
            </Button>
          </div>
        </div>

        {/* Quick Filter Tag Clear Action */}
        {searchQuery && (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <span>Searching for "{searchQuery}"</span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </section>

      {/* Main Job Grid Section */}
      <section
        id="jobs-grid"
        className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:py-12"
      >
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="font-sora text-2xl font-bold text-white sm:text-3xl">
              Available Opportunities
            </h2>
            {!loading && !error && (
              <p className="mt-1 text-xs text-[#a8b0cc] sm:text-sm">
                Showing {filteredJobs.length}{' '}
                {filteredJobs.length === 1 ? 'role' : 'roles'} matching your criteria
              </p>
            )}
          </div>

          {/* Category Filter Tabs */}
          <div className="flex rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-md">
            {['All', 'Full-time', 'Part-time', 'Contract'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-cyan-400 to-indigo-400 text-[#0b0f1e] shadow-[0_0_15px_rgba(34,211,238,0.3)] scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mt-12 flex flex-col items-center justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent mb-4" />
            <p className="font-sora text-sm text-slate-300">Loading job listings...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="mt-10 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 text-center backdrop-blur-xl">
            <span className="text-4xl">⚠️</span>
            <h3 className="mt-3 font-sora text-lg font-bold text-white">
              Unable to Load Jobs
            </h3>
            <p className="mt-2 text-xs text-rose-300 max-w-md mx-auto">{error}</p>
            <div className="mt-6">
              <Button
                variant="primary"
                size="md"
                onClick={fetchJobsAndCompanies}
              >
                Retry Loading
              </Button>
            </div>
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && !error && filteredJobs.length > 0 && (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isBookmarked={isBookmarked(job.id)}
                onToggleBookmark={toggleBookmark}
                onQuickApply={handleQuickApply}
                onClick={() => setSelectedJobModal(job)}
              />
            ))}
          </div>
        )}

        {/* Empty Search State */}
        {!loading && !error && filteredJobs.length === 0 && (
          <div className="mt-10 rounded-2xl border border-white/12 bg-white/[0.04] p-12 text-center backdrop-blur-xl">
            <span className="text-4xl">🔍</span>
            <h3 className="mt-4 font-sora text-lg font-bold text-white">
              No Jobs Found
            </h3>
            <p className="mt-2 text-xs text-[#9aa3c2]">
              No jobs match your current search query or active filters. Try clearing filters.
            </p>
            <div className="mt-6">
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setSearchQuery('')
                  setLocationFilter('All Locations')
                  setActiveTab('All')
                }}
              >
                Reset All Filters
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#070a14] py-12 text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link to="/" className="font-sora text-lg font-bold text-white">
                JobBoard
              </Link>
              <p className="mt-3 text-xs leading-relaxed text-[#9aa3c2]">
                Precision career matching platform connecting top engineering talent with leading tech companies.
              </p>
            </div>

            <div>
              <h4 className="font-sora font-semibold text-white mb-3">Navigation</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/jobs" className="hover:text-cyan-400 transition text-cyan-400">
                    Jobs Feed
                  </Link>
                </li>
                <li>
                  <Link to="/applications" className="hover:text-cyan-400 transition">
                    My Applications
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-sora font-semibold text-white mb-3">Account</h4>
              <ul className="space-y-2">
                <li>
                  <span className="text-slate-300">{user?.email || 'Logged in'}</span>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="hover:text-rose-400 transition cursor-pointer"
                  >
                    Sign Out
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-sora font-semibold text-white mb-3">Platform</h4>
              <p className="text-xs text-[#9aa3c2] mb-3">
                Connected to Django REST Framework backend API.
              </p>
              <p className="text-[0.7rem] text-slate-500">
                © {new Date().getFullYear()} JobBoard. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 text-lg font-bold text-[#0b0f1e] shadow-[0_0_20px_rgba(34,211,238,0.5)] transition duration-200 hover:scale-110 active:scale-95 cursor-pointer animate-fade-in-up"
          title="Scroll to Top"
        >
          ↑
        </button>
      )}

      {/* Interactive Job Detail Modal */}
      <JobDetailModal
        job={selectedJobModal}
        onClose={handleCloseModal}
        onSubmitApplication={submitApplication}
        appliedSuccess={appliedSuccess}
      />
    </div>
  )
}
