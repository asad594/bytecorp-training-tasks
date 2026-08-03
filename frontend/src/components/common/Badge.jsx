export default function Badge({
  children,
  variant = 'cyan',
  size = 'md',
  className = '',
}) {
  const variants = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    slate: 'bg-slate-800 text-slate-300 border border-slate-700',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-[0.7rem]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-lg backdrop-blur-md ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  )
}
