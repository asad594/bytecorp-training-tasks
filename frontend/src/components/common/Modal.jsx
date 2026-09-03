import { createPortal } from 'react-dom'

export default function Modal({
  isOpen = true,
  onClose,
  title,
  subtitle = null,
  children,
  maxWidth = 'max-w-lg',
  className = '',
}) {
  if (!isOpen) return null

  // Rendered via a portal straight into document.body so that a `fixed`
  // modal is never positioned relative to some ancestor that happens to
  // have a `transform` applied (e.g. a parent using the `animate-fade-in-up`
  // CSS animation, which leaves `transform: translateY(0) scale(1)` on the
  // element even after it finishes because of `animation-fill-mode: forwards`).
  // Any non-`none` transform on an ancestor creates a new containing block
  // for `position: fixed` descendants, which was trapping this modal deep
  // inside the page instead of centering it in the viewport.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full ${maxWidth} rounded-2xl border border-white/14 bg-brand-card p-6 sm:p-8 shadow-2xl backdrop-blur-2xl ${className}`}
      >
        <div className={`flex items-center justify-between mb-4 ${subtitle ? 'border-b border-white/10 pb-4' : ''}`}>
          <div>
            {title && <h3 className="font-sora text-xl font-bold text-white">{title}</h3>}
            {subtitle && (
              <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer transition"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  )
}