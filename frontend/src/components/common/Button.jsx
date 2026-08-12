import { SpinnerIcon } from '@/assets/icons'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon = null,
  iconPosition = 'left',
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'

  const variants = {
    primary:
      'bg-gradient-to-r from-cyan-400 to-indigo-500 text-brand-bg hover:from-cyan-300 hover:to-indigo-400 focus:ring-cyan-400 shadow-[0_4px_20px_rgba(34,211,238,0.25)] hover:shadow-[0_6px_24px_rgba(34,211,238,0.35)]',
    secondary:
      'bg-white/10 text-white hover:bg-white/15 focus:ring-white/30 border border-white/10 backdrop-blur-md',
    outline:
      'border-2 border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10 hover:border-cyan-400 focus:ring-cyan-400',
    danger:
      'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 focus:ring-red-400',
    emerald:
      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 focus:ring-emerald-400',
    ghost:
      'text-slate-400 hover:text-white hover:bg-white/5 focus:ring-slate-400',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  }

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <SpinnerIcon />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="flex items-center">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="flex items-center">{icon}</span>}
        </>
      )}
    </button>
  )
}
