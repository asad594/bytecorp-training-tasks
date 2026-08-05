export default function Input({
  label,
  error,
  icon,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  required = false,
  className = '',
  containerClassName = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
      {label && (
        <label className="text-xs font-semibold text-[#a8b0cc] flex items-center justify-between">
          <span>
            {label} {required && <span className="text-cyan-400">*</span>}
          </span>
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-xl border bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-500 transition-all duration-200 focus:outline-none ${
            icon ? 'pl-10' : ''
          } ${
            error
              ? 'border-red-500/60 focus:border-red-400 focus:ring-1 focus:ring-red-400/50'
              : 'border-white/12 focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/50 hover:border-white/20'
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[0.75rem] text-red-400 mt-0.5 animate-fade-in-up font-medium">
          {error}
        </p>
      )}
    </div>
  )
}
