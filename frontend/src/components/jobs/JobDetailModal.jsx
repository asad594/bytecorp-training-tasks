import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Button from '../common/Button'

export default function JobDetailModal({
  job,
  onClose,
  onSubmitApplication,
  appliedSuccess,
  isSubmitting = false,
  submitError = null,
}) {
  const [coverLetter, setCoverLetter] = useState('')
  const [resume, setResume] = useState(null)
  const [resumeError, setResumeError] = useState('')

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!job) return null

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0] || null
    setResumeError('')
    if (!file) {
      setResume(null)
      return
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setResumeError('Please upload a PDF file.')
      setResume(null)
      e.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setResumeError('File size must not exceed 5MB.')
      setResume(null)
      e.target.value = ''
      return
    }
    setResume(file)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!resume) {
      setResumeError('Resume is required to apply.')
      return
    }
    if (onSubmitApplication) {
      onSubmitApplication(e, coverLetter, resume)
    }
  }

  const jobId = job.id || job.job_id

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-fade-in-up"
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-brand-card p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-slate-400 transition hover:bg-white/20 hover:text-white cursor-pointer"
          aria-label="Close dialog"
        >
          ✕
        </button>

        {appliedSuccess ? (
          <div className="py-8 text-center">
            <span className="text-5xl">🎉</span>
            <h3 className="mt-4 font-sora text-xl font-bold text-white">Application Received!</h3>
            <p className="mt-2 text-xs text-slate-300">
              Your application has been successfully submitted to the employer.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3.5 mb-4">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${
                  job.logoBg || 'from-cyan-400 to-indigo-500'
                } font-sora font-bold text-white text-xl shadow-lg`}
              >
                {job.logoLetter || (job.title ? job.title.charAt(0) : 'J')}
              </div>
              <div>
                <h3 id="job-modal-title" className="font-sora text-lg font-bold text-white">
                  {job.title}
                </h3>
                <p className="text-xs text-text-secondary">{job.company} · {job.location}</p>
              </div>
            </div>

            {submitError && (
              <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {submitError}
              </div>
            )}

            <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
              <p className="text-slate-300 line-clamp-3">{job.description}</p>
            </div>

            {job.requirements && job.requirements.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-cyan-300 uppercase tracking-wide mb-2">Key Requirements:</h4>
                <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                  {job.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-white/10 pt-4 mb-4">
              <span className="font-sora font-bold text-cyan-accent text-base">{job.salary}</span>
              <span className="text-xs text-slate-400">{job.posted}</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-desc mb-1.5">
                  Cover Letter <span className="text-slate-500 font-normal">(Optional, min 10 chars if provided)</span>
                </label>
                <textarea
                  rows={3}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Introduce yourself or share why you're a great fit for this role..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-desc mb-1.5">
                  Resume / CV <span className="text-rose-400 font-normal">(Required, PDF only, max 5MB)</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleResumeChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-cyan-300 outline-none focus:border-cyan-400"
                />
                {resume && (
                  <p className="mt-1.5 text-[0.7rem] text-emerald-300">Selected: {resume.name}</p>
                )}
                {resumeError && (
                  <p className="mt-1.5 text-[0.7rem] text-rose-400">{resumeError}</p>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <Link
                  to={`/jobs/${jobId}`}
                  onClick={onClose}
                  className="text-xs font-semibold text-cyan-accent hover:underline flex items-center gap-1"
                >
                  View Full Details →
                </Link>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                >
                  Submit Application →
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
