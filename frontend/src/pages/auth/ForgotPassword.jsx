import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../../components/common/AuthLayout'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      console.log('Sending forgot password request for:', email)
      await new Promise((resolve) => setTimeout(resolve, 800))
      setMessage('If an account with that email exists, a password reset link has been sent to your email.')
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      badgeLabel="JobBoard"
      heading={['Reset your', 'account password']}
      subheading="Enter the email address registered with your account and we will send you instructions to reset your password."
      showFloatingCards={false}
    >
      <div className="rounded-[20px] border border-white/14 bg-white/[0.06] p-7 sm:p-9 shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[22px] transition-all duration-300 focus-within:border-cyan-400/50 animate-fade-in-up">
        
        <h2 className="font-sora text-2xl font-bold text-white mb-1">Forgot Password</h2>
        <p className="text-xs text-[#99a2c2] mb-6">Enter your email to receive a password reset link.</p>

        {message && (
          <div className="mb-4 rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-3.5 text-xs text-cyan-200">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[0.78rem] font-medium text-[#b7bede] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-xl border border-white/12 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-[#6b7394] outline-none transition-all duration-200 focus:border-[#22d3ee] focus:bg-[#22d3ee]/[0.08] focus:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl btn-gradient-shimmer py-3.5 text-sm font-semibold text-[#0b0f1e] shadow-[0_8px_20px_rgba(34,211,238,0.3)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(34,211,238,0.45)] active:scale-98 disabled:opacity-60 cursor-pointer group"
          >
            <span>{loading ? 'Sending link…' : 'Send Reset Link'}</span>
            <span className="transition-transform duration-200 group-hover:translate-x-1.5 font-bold">→</span>
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#99a2c2]">
          Remember your password?{' '}
          <Link to="/login/job_seeker" className="font-semibold text-[#67e8f9] hover:underline transition hover:text-cyan-300">
            Back to Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
