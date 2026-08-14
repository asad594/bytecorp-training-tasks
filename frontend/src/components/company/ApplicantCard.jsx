import Badge from '../common/Badge'
import { getApplicationStatusVariant } from '../../utils/statusVariants'

export default function ApplicantCard({ app, onUpdateStatus, showJobTitle = true }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:border-white/20">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h4 className="font-sora text-sm font-bold text-white">
            {app.applicant_name || 'Candidate'}
          </h4>
          <p className="text-xs text-cyan-accent">{app.applicant_email}</p>
        </div>
        <Badge
          variant={getApplicationStatusVariant(app.status)}
          size="sm"
        >
          {app.status.toUpperCase()}
        </Badge>
      </div>

      {showJobTitle && app.job_title && (
        <div className="text-xs text-slate-300 mb-3">
          Applied for: <span className="font-semibold text-white">{app.job_title}</span>
        </div>
      )}

      {app.cover_letter && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/5 p-3 text-xs text-text-desc leading-relaxed">
          "{app.cover_letter}"
        </div>
      )}

      {/* Quick Action Buttons for Employer */}
      <div className="flex items-center gap-2 border-t border-white/10 pt-3">
        <span className="text-[0.7rem] font-semibold text-slate-400">Set Status:</span>
        <button
          onClick={() => onUpdateStatus(app.application_id, 'shortlisted')}
          className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-[0.68rem] font-semibold text-emerald-300 hover:bg-emerald-500/30 transition cursor-pointer"
        >
          Shortlist
        </button>
        <button
          onClick={() => onUpdateStatus(app.application_id, 'reviewed')}
          className="rounded-lg bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-1 text-[0.68rem] font-semibold text-indigo-300 hover:bg-indigo-500/30 transition cursor-pointer"
        >
          Mark Reviewed
        </button>
        <button
          onClick={() => onUpdateStatus(app.application_id, 'rejected')}
          className="rounded-lg bg-rose-500/15 border border-rose-500/30 px-2.5 py-1 text-[0.68rem] font-semibold text-rose-300 hover:bg-rose-500/30 transition cursor-pointer"
        >
          Reject
        </button>
      </div>
    </div>
  )
}
