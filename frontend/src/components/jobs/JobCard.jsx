export default function JobCard({
  job,
  isBookmarked,
  onToggleBookmark,
  onQuickApply,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-lg backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-white/[0.06] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(34,211,238,0.1)] cursor-pointer"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${job.logoBg} font-sora font-bold text-white text-lg shadow-md transition duration-300 group-hover:scale-110`}
          >
            {job.logoLetter}
          </div>
          <div>
            <h3 className="font-sora text-base font-bold text-white group-hover:text-cyan-300 transition">
              {job.title}
            </h3>
            <p className="text-xs text-[#9aa3c2]">
              {job.company} · {job.location}
            </p>
          </div>
        </div>

        <button
          onClick={(e) => onToggleBookmark(e, job.id)}
          className={`flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm transition hover:scale-110 active:scale-95 cursor-pointer ${
            isBookmarked ? 'text-amber-400 border-amber-400/40 bg-amber-400/10' : 'text-slate-400 hover:text-white'
          }`}
          title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Job'}
        >
          {isBookmarked ? '★' : '☆'}
        </button>
      </div>

      {/* Description */}
      {job.description && (
        <p className="text-xs text-[#a0a9c8] line-clamp-2 mb-4 leading-relaxed">
          {job.description}
        </p>
      )}

      {/* Tech Tags */}
      {job.tags && job.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[0.7rem] text-slate-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <div>
          <span className="font-sora font-bold text-[#67e8f9] text-sm">
            {job.salary}
          </span>
          {job.posted && (
            <span className="block text-[0.68rem] text-slate-400">
              {job.posted}
            </span>
          )}
        </div>

        <button
          onClick={(e) => onQuickApply(e, job)}
          className="rounded-xl bg-cyan-400/10 border border-cyan-400/30 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400 hover:text-[#0b0f1e] hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] cursor-pointer"
        >
          Quick Apply
        </button>
      </div>
    </div>
  )
}
