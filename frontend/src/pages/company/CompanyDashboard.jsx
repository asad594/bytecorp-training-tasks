import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import { BriefcaseIcon } from '@/assets/icons'
import colors from '@/styles/colors'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Input from '../../components/common/Input'
import AnimatedCounter from '../../components/common/AnimatedCounter'
import ApplicantCard from '../../components/company/ApplicantCard'
import useAuth from '../../hooks/useAuth'
import useCompanyDashboard from '../../hooks/useCompanyDashboard'
import jobPostSchema from '../../schemas/jobPostSchema'
import companyCreateSchema from '../../schemas/companyCreateSchema'
import companyJoinSchema from '../../schemas/companyJoinSchema'

export default function CompanyDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const {
    company,
    jobs,
    applications,
    loading,
    error,
    actionLoading,
    stats,
    refetch,
    createCompany,
    joinCompany,
    createJob,
    updateJobStatus,
    updateApplicationStatus,
  } = useCompanyDashboard()

  // Tab & Modal State
  const [activeJobTab, setActiveJobTab] = useState('All')
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null)
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false)
  const [isApplicantsModalOpen, setIsApplicantsModalOpen] = useState(false)
  const [isRegisterCompanyModalOpen, setIsRegisterCompanyModalOpen] = useState(false)
  const [isJoinCompanyModalOpen, setIsJoinCompanyModalOpen] = useState(false)
  const [applicantFilterStatus, setApplicantFilterStatus] = useState('All')

  // Formik: Post Job Form
  const postJobFormik = useFormik({
    initialValues: {
      title: '',
      employment_type: 'full-time',
      location: '',
      salary_min: 150000,
      salary_max: 250000,
      description: '',
      status: 'open',
    },
    validationSchema: jobPostSchema,
    onSubmit: async (values, { resetForm, setErrors }) => {
      const res = await createJob({
        title: values.title,
        employment_type: values.employment_type,
        location: values.location || 'Remote',
        salary_min: Number(values.salary_min),
        salary_max: Number(values.salary_max),
        description: values.description,
        status: values.status,
      })

      if (res.success) {
        setIsPostJobModalOpen(false)
        resetForm()
      } else {
        setErrors({ general: res.error })
      }
    },
  })

  // Formik: Register Company Form
  const companyCreateFormik = useFormik({
    initialValues: {
      name: '',
      registration_number: '',
      description: '',
      website: '',
      location: '',
    },
    validationSchema: companyCreateSchema,
    onSubmit: async (values, { resetForm, setErrors }) => {
      const res = await createCompany(values)
      if (res.success) {
        setIsRegisterCompanyModalOpen(false)
        resetForm()
      } else {
        setErrors({ general: res.error })
      }
    },
  })

  // Formik: Join Company Form
  const companyJoinFormik = useFormik({
    initialValues: {
      registration_number: '',
    },
    validationSchema: companyJoinSchema,
    onSubmit: async (values, { resetForm, setErrors }) => {
      const res = await joinCompany(values.registration_number.trim())
      if (res.success) {
        setIsJoinCompanyModalOpen(false)
        resetForm()
      } else {
        setErrors({ general: res.error })
      }
    },
  })

  const userDisplayName = user?.name || user?.email?.split('@')[0] || 'Employer'

  const handleLogout = () => {
    logout()
    navigate('/login/company_rep')
  }

  // Filter Jobs by Tab
  const filteredJobs = jobs.filter((job) => {
    if (activeJobTab === 'All') return true
    return job.status.toLowerCase() === activeJobTab.toLowerCase()
  })

  // Filter Applications
  const filteredApplications = applications.filter((app) => {
    if (applicantFilterStatus === 'All') return true
    return app.status.toLowerCase() === applicantFilterStatus.toLowerCase()
  })

  return (
    <div className="relative min-h-screen bg-brand-bg text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-900 overflow-hidden">
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

      {/* Sticky Employer Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-brand-bg/85 backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5 font-sora text-xl font-extrabold text-white group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-[0_0_18px_rgba(34,211,238,0.5)] transition duration-300 group-hover:scale-110">
              <BriefcaseIcon width="20" height="20" stroke={colors.background.main} strokeWidth="2.5" />
            </div>
            <span className="bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
              JobBoard <span className="text-xs font-semibold text-cyan-400">Employer</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-md">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 text-[0.7rem] font-bold text-brand-bg">
                {(user?.name || user?.email || 'E')[0].toUpperCase()}
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

      {/* Main Page Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 pt-8 pb-16 sm:px-8">
        {/* Loading State */}
        {loading && (
          <div className="mt-16 flex flex-col items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent mb-4" />
            <p className="font-sora text-sm text-slate-300">Loading Employer Dashboard...</p>
          </div>
        )}

        {/* Global Error State */}
        {!loading && error && (
          <div className="mt-10 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 text-center backdrop-blur-xl">
            <span className="text-4xl">⚠️</span>
            <h3 className="mt-3 font-sora text-lg font-bold text-white">Dashboard Error</h3>
            <p className="mt-2 text-xs text-rose-300 max-w-md mx-auto">{error}</p>
            <div className="mt-6">
              <Button variant="primary" size="md" onClick={refetch}>
                Retry Loading
              </Button>
            </div>
          </div>
        )}

        {/* Dashboard Body */}
        {!loading && !error && (
          <div className="flex flex-col gap-8">
            {/* Edge Case: No Company Account Linked */}
            {!company ? (
              <div className="rounded-2xl border border-white/14 bg-white/[0.06] p-8 sm:p-10 backdrop-blur-xl shadow-2xl animate-fade-in-up">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-semibold text-amber-300 mb-4">
                    <span>🏢</span> Company Profile Required
                  </div>
                  <h1 className="font-sora text-3xl font-extrabold text-white mb-2">
                    Welcome, {userDisplayName}!
                  </h1>
                  <p className="text-sm text-text-desc mb-6 leading-relaxed">
                    You are registered as an employer representative, but you haven't set up or joined a company profile yet. Create a new company profile or join an existing company by registration number to get started.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => setIsRegisterCompanyModalOpen(true)}
                    >
                      Create New Company →
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => setIsJoinCompanyModalOpen(true)}
                    >
                      Join Existing Company →
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Company Banner & Verification Header */}
                <div className="rounded-2xl border border-white/14 bg-white/[0.06] p-6 sm:p-8 backdrop-blur-xl shadow-xl transition-all duration-300">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 font-sora text-2xl font-bold text-brand-bg shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                        {company.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h1 className="font-sora text-2xl font-extrabold text-white sm:text-3xl">
                            {company.name}
                          </h1>
                          {company.is_verified ? (
                            <Badge variant="emerald">Verified Company ✓</Badge>
                          ) : (
                            <Badge variant="amber">Pending Verification ⏳</Badge>
                          )}
                          {company.role && (
                            <Badge variant="indigo" size="sm">
                              {company.role.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-text-secondary sm:text-sm">
                          Reg #: <span className="text-white font-mono">{company.registration_number}</span> · {company.location || 'Location Not Specified'}
                        </p>
                        {company.website && (
                          <a
                            href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-block text-xs text-cyan-accent hover:underline"
                          >
                            🌐 {company.website}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Action Button: Post Job */}
                    <div className="flex flex-col items-start lg:items-end gap-2">
                      <Button
                        variant="primary"
                        size="lg"
                        disabled={!company.is_verified}
                        onClick={() => setIsPostJobModalOpen(true)}
                        className={!company.is_verified ? 'opacity-50 cursor-not-allowed' : ''}
                      >
                        <span>+ Post New Job</span>
                      </Button>
                      {!company.is_verified && (
                        <p className="text-[0.72rem] text-amber-300/80">
                          🔒 Job posting locked until admin verification
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Verification Pending Banner Alert */}
                  {!company.is_verified && (
                    <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
                      <span className="text-lg leading-none">⚠️</span>
                      <div>
                        <span className="font-bold text-amber-100">Verification Pending:</span> Your company account is currently under administrative review. You can prepare and view your dashboard, but job posting will be activated once an administrator approves your registration.
                      </div>
                    </div>
                  )}
                </div>

                {/* Summary Stats Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                    <p className="text-xs text-text-secondary font-medium">Total Jobs Posted</p>
                    <div className="mt-2 font-sora text-3xl font-extrabold text-white">
                      <AnimatedCounter end={stats.totalJobs} />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                    <p className="text-xs text-text-secondary font-medium">Active Openings</p>
                    <div className="mt-2 font-sora text-3xl font-extrabold text-cyan-400">
                      <AnimatedCounter end={stats.activeJobs} />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                    <p className="text-xs text-text-secondary font-medium">Total Applicants</p>
                    <div className="mt-2 font-sora text-3xl font-extrabold text-indigo-400">
                      <AnimatedCounter end={stats.totalApplicants} />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                    <p className="text-xs text-text-secondary font-medium">Pending Review</p>
                    <div className="mt-2 font-sora text-3xl font-extrabold text-amber-400">
                      <AnimatedCounter end={stats.pendingApplicants} />
                    </div>
                  </div>
                </div>

                {/* Posted Jobs Section */}
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
                    <div>
                      <h2 className="font-sora text-xl font-bold text-white">
                        Company Posted Jobs
                      </h2>
                      <p className="text-xs text-text-desc mt-0.5">
                        Manage your active listings and review applicants.
                      </p>
                    </div>

                    {/* Job Filter Tabs */}
                    <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-md">
                      {['All', 'Open', 'Draft', 'Closed'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveJobTab(tab)}
                          className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                            activeJobTab === tab
                              ? 'bg-gradient-to-r from-cyan-400 to-indigo-400 text-brand-bg shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Empty Jobs State */}
                  {filteredJobs.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center backdrop-blur-xl">
                      <span className="text-3xl">💼</span>
                      <h3 className="mt-3 font-sora text-base font-bold text-white">No Jobs Found</h3>
                      <p className="mt-1 text-xs text-text-secondary max-w-sm mx-auto">
                        No posted jobs match your selected filter tab.
                      </p>
                    </div>
                  ) : (
                    /* Jobs Grid */
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                      {filteredJobs.map((job) => {
                        const jobAppsCount = applications.filter((a) => a.job === job.job_id).length
                        return (
                          <div
                            key={job.job_id}
                            className="group relative rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-lg backdrop-blur-xl transition duration-300 hover:border-cyan-400/40 hover:bg-white/[0.07]"
                          >
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div>
                                <h3 className="font-sora text-base font-bold text-white group-hover:text-cyan-300 transition">
                                  {job.title}
                                </h3>
                                <p className="text-xs text-text-secondary">
                                  {job.location || 'Remote'} · {job.employment_type}
                                </p>
                              </div>

                              <Badge
                                variant={
                                  job.status === 'open'
                                    ? 'emerald'
                                    : job.status === 'draft'
                                    ? 'amber'
                                    : 'slate'
                                }
                                size="sm"
                              >
                                {job.status.toUpperCase()}
                              </Badge>
                            </div>

                            <p className="text-xs text-text-card line-clamp-2 mb-4 leading-relaxed">
                              {job.description || 'No description provided.'}
                            </p>

                            <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs">
                              <div>
                                <span className="font-sora font-bold text-cyan-accent">
                                  PKR {(job.salary_min / 1000).toFixed(0)}k - {(job.salary_max / 1000).toFixed(0)}k
                                </span>
                                <span className="block text-[0.68rem] text-slate-400">
                                  👥 {jobAppsCount} {jobAppsCount === 1 ? 'Applicant' : 'Applicants'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedJobForApplicants(job)
                                    setIsApplicantsModalOpen(true)
                                  }}
                                >
                                  Applicants ({jobAppsCount})
                                </Button>

                                <button
                                  onClick={() =>
                                    updateJobStatus(
                                      job.job_id,
                                      job.status === 'open' ? 'closed' : 'open'
                                    )
                                  }
                                  className="text-[0.72rem] font-semibold text-slate-400 hover:text-cyan-300 transition underline cursor-pointer"
                                >
                                  {job.status === 'open' ? 'Close' : 'Reopen'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* All Applicants Overview Section */}
                <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="font-sora text-xl font-bold text-white">
                        All Job Applicants
                      </h2>
                      <p className="text-xs text-text-desc mt-0.5">
                        Review candidate profiles and update hiring application statuses.
                      </p>
                    </div>

                    {/* Applicant Status Filter */}
                    <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-md">
                      {['All', 'Pending', 'Reviewed', 'Shortlisted', 'Rejected'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setApplicantFilterStatus(st)}
                          className={`rounded-lg px-3 py-1 text-[0.72rem] font-semibold transition ${
                            applicantFilterStatus === st
                              ? 'bg-gradient-to-r from-cyan-400 to-indigo-400 text-brand-bg shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredApplications.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center backdrop-blur-xl">
                      <span className="text-3xl">📑</span>
                      <h3 className="mt-3 font-sora text-base font-bold text-white">
                        No Applications Received
                      </h3>
                      <p className="mt-1 text-xs text-text-secondary max-w-sm mx-auto">
                        No candidate applications match the selected status filter.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {filteredApplications.map((app) => (
                        <ApplicantCard
                          key={app.application_id}
                          app={app}
                          onUpdateStatus={updateApplicationStatus}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* MODAL: Post New Job */}
      {isPostJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-white/14 bg-brand-card p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sora text-xl font-bold text-white">Post New Job Opening</h3>
              <button
                onClick={() => {
                  setIsPostJobModalOpen(false)
                  postJobFormik.resetForm()
                }}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {postJobFormik.errors.general && (
              <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {postJobFormik.errors.general}
              </div>
            )}

            <form onSubmit={postJobFormik.handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Job Title"
                name="title"
                required
                value={postJobFormik.values.title}
                onChange={postJobFormik.handleChange}
                onBlur={postJobFormik.handleBlur}
                error={postJobFormik.touched.title && postJobFormik.errors.title}
                placeholder="e.g. Senior Backend Engineer"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-desc mb-1.5">
                    Employment Type
                  </label>
                  <select
                    name="employment_type"
                    value={postJobFormik.values.employment_type}
                    onChange={postJobFormik.handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 [&>option]:bg-brand-bg"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>

                <Input
                  label="Location"
                  name="location"
                  value={postJobFormik.values.location}
                  onChange={postJobFormik.handleChange}
                  onBlur={postJobFormik.handleBlur}
                  placeholder="e.g. Remote / Karachi"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Salary Min (PKR)"
                  type="number"
                  name="salary_min"
                  value={postJobFormik.values.salary_min}
                  onChange={postJobFormik.handleChange}
                  onBlur={postJobFormik.handleBlur}
                />
                <Input
                  label="Salary Max (PKR)"
                  type="number"
                  name="salary_max"
                  value={postJobFormik.values.salary_max}
                  onChange={postJobFormik.handleChange}
                  onBlur={postJobFormik.handleBlur}
                  error={postJobFormik.touched.salary_max && postJobFormik.errors.salary_max}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-desc mb-1.5">
                  Job Description
                </label>
                <textarea
                  rows={4}
                  name="description"
                  value={postJobFormik.values.description}
                  onChange={postJobFormik.handleChange}
                  placeholder="Detailed job responsibilities and requirements..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                />
                {postJobFormik.errors.description && (
                  <p className="mt-1 text-[0.72rem] text-rose-400">{postJobFormik.errors.description}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsPostJobModalOpen(false)
                    postJobFormik.resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={actionLoading || postJobFormik.isSubmitting}>
                  Publish Job →
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Register Company (Edge Case) */}
      {isRegisterCompanyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-white/14 bg-brand-card p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sora text-xl font-bold text-white">Register Your Company</h3>
              <button
                onClick={() => {
                  setIsRegisterCompanyModalOpen(false)
                  companyCreateFormik.resetForm()
                }}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {companyCreateFormik.errors.general && (
              <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {companyCreateFormik.errors.general}
              </div>
            )}

            <form onSubmit={companyCreateFormik.handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Company Name"
                name="name"
                required
                value={companyCreateFormik.values.name}
                onChange={companyCreateFormik.handleChange}
                onBlur={companyCreateFormik.handleBlur}
                error={companyCreateFormik.touched.name && companyCreateFormik.errors.name}
                placeholder="e.g. ByteCorp Technologies"
              />

              <Input
                label="Registration Number"
                name="registration_number"
                required
                value={companyCreateFormik.values.registration_number}
                onChange={companyCreateFormik.handleChange}
                onBlur={companyCreateFormik.handleBlur}
                error={companyCreateFormik.touched.registration_number && companyCreateFormik.errors.registration_number}
                placeholder="e.g. REG-998231"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Website URL"
                  name="website"
                  value={companyCreateFormik.values.website}
                  onChange={companyCreateFormik.handleChange}
                  onBlur={companyCreateFormik.handleBlur}
                  placeholder="https://example.com"
                />
                <Input
                  label="Headquarters Location"
                  name="location"
                  value={companyCreateFormik.values.location}
                  onChange={companyCreateFormik.handleChange}
                  onBlur={companyCreateFormik.handleBlur}
                  placeholder="e.g. Karachi, Pakistan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-desc mb-1.5">
                  Company Description
                </label>
                <textarea
                  rows={3}
                  name="description"
                  value={companyCreateFormik.values.description}
                  onChange={companyCreateFormik.handleChange}
                  placeholder="Brief overview of your company and industry..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsRegisterCompanyModalOpen(false)
                    companyCreateFormik.resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={actionLoading || companyCreateFormik.isSubmitting}>
                  Create Company Profile →
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Join Company (Edge Case) */}
      {isJoinCompanyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-white/14 bg-brand-card p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sora text-xl font-bold text-white">Join Existing Company</h3>
              <button
                onClick={() => {
                  setIsJoinCompanyModalOpen(false)
                  companyJoinFormik.resetForm()
                }}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-text-secondary mb-4">
              Enter the registration number of the company you want to join. Your account will be linked to the company as a team member.
            </p>

            {companyJoinFormik.errors.general && (
              <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {companyJoinFormik.errors.general}
              </div>
            )}

            <form onSubmit={companyJoinFormik.handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Company Registration Number"
                name="registration_number"
                required
                value={companyJoinFormik.values.registration_number}
                onChange={companyJoinFormik.handleChange}
                onBlur={companyJoinFormik.handleBlur}
                error={companyJoinFormik.touched.registration_number && companyJoinFormik.errors.registration_number}
                placeholder="e.g. REG12345"
              />

              <div className="flex justify-end gap-3 mt-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsJoinCompanyModalOpen(false)
                    companyJoinFormik.resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={actionLoading || companyJoinFormik.isSubmitting}>
                  Join Company →
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Applicants per Job */}
      {isApplicantsModalOpen && selectedJobForApplicants && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/14 bg-brand-card p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="font-sora text-xl font-bold text-white">
                  Applicants for {selectedJobForApplicants.title}
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  {selectedJobForApplicants.location || 'Remote'} · {selectedJobForApplicants.employment_type}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsApplicantsModalOpen(false)
                  setSelectedJobForApplicants(null)
                }}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {applications.filter((a) => a.job === selectedJobForApplicants.job_id).length === 0 ? (
              <div className="p-8 text-center">
                <span className="text-3xl">📑</span>
                <h4 className="mt-2 font-sora text-sm font-bold text-white">No Applicants Yet</h4>
                <p className="mt-1 text-xs text-text-secondary">No candidates have applied to this specific job yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 mt-4">
                {applications
                  .filter((a) => a.job === selectedJobForApplicants.job_id)
                  .map((app) => (
                    <ApplicantCard
                      key={app.application_id}
                      app={app}
                      onUpdateStatus={updateApplicationStatus}
                      showJobTitle={false}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
