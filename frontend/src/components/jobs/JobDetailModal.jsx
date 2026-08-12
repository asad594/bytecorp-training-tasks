import { useEffect } from 'react'
import Button from '../common/Button'

export default function JobDetailModal({
  job,
  onClose,
  onSubmitApplication,
  appliedSuccess,
}) {
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
              Redirecting you to complete your profile sign in...
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3.5 mb-4">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${job.logoBg} font-sora font-bold text-white text-xl shadow-lg`}
              >
                {job.logoLetter}
              </div>
              <div>
                <h3 id="job-modal-title" className="font-sora text-lg font-bold text-white">
                  {job.title}
                </h3>
                <p className="text-xs text-text-secondary">{job.company} · {job.location}</p>
              </div>
            </div>

            <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
              <p className="text-slate-300">{job.description}</p>
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-semibold text-cyan-300 uppercase tracking-wide mb-2">Key Requirements:</h4>
              <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                {job.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4 mb-6">
              <span className="font-sora font-bold text-cyan-accent text-base">{job.salary}</span>
              <span className="text-xs text-slate-400">{job.posted}</span>
            </div>

            <form onSubmit={onSubmitApplication} className="space-y-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full btn-gradient-shimmer"
              >
                Submit Quick Application →
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
