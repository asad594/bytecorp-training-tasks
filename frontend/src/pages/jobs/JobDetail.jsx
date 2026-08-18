import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { BriefcaseIcon } from '@/assets/icons'
import colors from '@/styles/colors'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import JobDetailModal from '../../components/jobs/JobDetailModal'
import useAuth from '../../hooks/useAuth'
import * as jobsApi from '../../api/jobsApi'
import * as companiesApi from '../../api/companiesApi'
import * as applicationsApi from '../../api/applicationsApi'

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

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // TODO(react-query): Hand-rolled loading/error/fetch state is a candidate for TanStack Query migration.
  const [job, setJob] = useState(null)
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [appliedSuccess, setAppliedSuccess] = useState(false)
  const [submittingApp, setSubmittingApp] = useState(false)
  const [submitAppError, setSubmitAppError] = useState(null)

  const fetchJobDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      const jobData = await jobsApi.getJob(id)
      setJob(jobData)

      if (jobData?.company) {
        try {
          const compData = await companiesApi.getCompany(jobData.company)
          setCompany(compData)
        } catch {
          setCompany({ name: 'Company' })
        }
      }
    } catch (err) {
      console.error('Error fetching job details:', err)
      if (err.response?.status === 404) {
        setError('Job not found or has been removed.')
      } else {
        setError(err.response?.data?.detail || err.message || 'Failed to load job details.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchJobDetails()
    }
  }, [id])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleApplySubmit = async (e, coverLetter) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!job) return

    setSubmittingApp(true)
    setSubmitAppError(null)

    try {
      await applicationsApi.applyForJob(job.job_id || job.id, coverLetter || '')
      setAppliedSuccess(true)
      setTimeout(() => {
        setIsApplyModalOpen(false)
        setAppliedSuccess(false)
      }, 2000)
    } catch (err) {
      let msg = 'Failed to submit application. Please try again.'
      if (err.response?.data) {
        const d = err.response.data
        if (typeof d === 'string') msg = d
        else if (typeof d.detail === 'string') msg = d.detail
        else if (d.error?.message) msg = d.error.message
        else if (Array.isArray(d.non_field_errors)) msg = d.non_field_errors.join(' ')
        else if (d.cover_letter) msg = Array.isArray(d.cover_letter) ? d.cover_letter.join(' ') : d.cover_letter
      }
      setSubmitAppError(msg)
    } finally {
      setSubmittingApp(false)
    }
  }

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
      <main className="relative z-10 mx-auto max-w-4xl px-4 pt-8 pb-16 sm:px-8">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-accent hover:underline mb-6"
        >
          ← Back to All Jobs
        </Link>

        {loading && (
          <div className="mt-16 flex flex-col items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent mb-4" />
            <p className="font-sora text-sm text-slate-300">Loading job specifications...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 text-center backdrop-blur-xl">
            <span className="text-4xl">⚠️</span>
            <h3 className="mt-3 font-sora text-lg font-bold text-white">{error}</h3>
            <div className="mt-6 flex justify-center gap-4">
              <Button variant="secondary" size="md" onClick={() => navigate('/jobs')}>
                Back to Jobs
              </Button>
              <Button variant="primary" size="md" onClick={fetchJobDetails}>
                Retry
              </Button>
            </div>
          </div>
        )}

        {!loading && !error && job && (
          <div className="rounded-3xl border border-white/14 bg-white/[0.06] p-6 sm:p-10 shadow-2xl backdrop-blur-2xl animate-fade-in-up">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between border-b border-white/10 pb-6">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 font-sora text-2xl font-bold text-brand-bg shadow-lg">
                  {(company?.name || 'C')[0].toUpperCase()}
                </div>
                <div>
                  <h1 className="font-sora text-2xl font-extrabold text-white sm:text-3xl">
                    {job.title}
                  </h1>
                  <p className="mt-1 text-sm text-cyan-accent font-medium">
                    {company?.name || 'Company'} · <span className="text-slate-300">{job.location || 'Remote'}</span>
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="indigo" size="md">
                      {(job.employment_type || 'Full-time').toUpperCase()}
                    </Badge>
                    <Badge variant="emerald" size="md">
                      {formatSalary(job.salary_min, job.salary_max)}
                    </Badge>
                    {company?.is_verified && (
                      <Badge variant="emerald" size="md">
                        Verified Employer ✓
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  setSubmitAppError(null)
                  setAppliedSuccess(false)
                  setIsApplyModalOpen(true)
                }}
                className="btn-gradient-shimmer whitespace-nowrap"
              >
                Apply for this Role →
              </Button>
            </div>

            {/* Description Body */}
            <div className="mt-8 space-y-6">
              <div>
                <h3 className="font-sora text-lg font-bold text-white mb-3">Job Description</h3>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {job.description || 'No detailed description provided for this opening.'}
                </div>
              </div>

              {company?.description && (
                <div>
                  <h3 className="font-sora text-lg font-bold text-white mb-3">About the Company</h3>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300 leading-relaxed">
                    {company.description}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-white/10 pt-6 text-xs text-slate-400">
                <span>Posted: <strong className="text-slate-200">{formatRelativeTime(job.created_at)}</strong></span>
                <span>Job ID: <strong className="text-slate-200">#{job.job_id}</strong></span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Apply Modal */}
      {isApplyModalOpen && job && (
        <JobDetailModal
          job={{
            id: job.job_id,
            title: job.title,
            company: company?.name || 'Company',
            location: job.location || 'Remote',
            description: job.description,
            salary: formatSalary(job.salary_min, job.salary_max),
            posted: formatRelativeTime(job.created_at),
          }}
          onClose={() => setIsApplyModalOpen(false)}
          onSubmitApplication={handleApplySubmit}
          appliedSuccess={appliedSuccess}
          isSubmitting={submittingApp}
          submitError={submitAppError}
        />
      )}
    </div>
  )
}