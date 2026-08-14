export default function Badge({
  children,
  variant = 'cyan',
  size = 'md',
  className = '',
}) {
  const variants = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    slate: 'bg-slate-800 text-slate-300 border border-slate-700/60',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px] rounded-md',
    md: 'px-2.5 py-1 text-xs rounded-lg',
    lg: 'px-3 py-1.5 text-sm rounded-xl',
  }

  return (
    <span
      className={`inline-flex items-center font-medium ${
        variants[variant] || variants.slate
      } ${sizes[size] || sizes.md} ${className}`}
    >
      {children}
    </span>
  )
}
