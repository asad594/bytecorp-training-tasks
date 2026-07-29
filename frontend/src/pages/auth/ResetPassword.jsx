import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/common/AuthLayout'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const uid = searchParams.get('uid') || ''
  const token = searchParams.get('token') || ''

  const [form, setForm] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (form.newPassword.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    setLoading(true)

    try {
      // Simulate API call to POST /accounts/password/reset/ with { uid, token, new_password }
      console.log('Resetting password with payload:', { uid, token, new_password: form.newPassword })
      await new Promise((resolve) => setTimeout(resolve, 800))
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired reset token. Please request a new link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      badgeLabel="JobBoard"
      heading={['Set your new', 'account password']}
      subheading="Please enter your new password below. Make sure it is at least 8 characters long with numbers and special characters."
      showFloatingCards={false}
    >
      <div className="rounded-[20px] border border-white/14 bg-white/[0.06] p-7 sm:p-9 shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[22px] transition-all duration-300 focus-within:border-cyan-400/50 animate-fade-in-up">
        
        <h2 className="font-sora text-2xl font-bold text-white mb-1">Reset Password</h2>
        <p className="text-xs text-[#99a2c2] mb-6">Create a new secure password for your account.</p>

        {success ? (
          <div className="text-center py-4">
            <span className="text-4xl">🎉</span>
            <h3 className="mt-3 font-sora text-lg font-bold text-white">Password Reset Successful!</h3>
            <p className="mt-2 text-xs text-slate-300 mb-6">
              Your password has been updated. You can now log in with your new password.
            </p>
            <button
              onClick={() => navigate('/login/job_seeker')}
              className="w-full rounded-xl btn-gradient-shimmer py-3 text-sm font-semibold text-[#0b0f1e] shadow-lg cursor-pointer"
            >
              Go to Sign In →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 animate-pulse">
                {error}
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="block text-[0.78rem] font-medium text-[#b7bede] mb-1.5">
                New Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  required
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-xl border border-white/12 bg-white/[0.05] px-4 py-3 pr-11 text-sm text-white placeholder-[#6b7394] outline-none transition-all duration-200 focus:border-[#22d3ee] focus:bg-[#22d3ee]/[0.08] focus:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 text-base text-slate-400 hover:text-white transition duration-200 hover:scale-125 opacity-80 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[0.78rem] font-medium text-[#b7bede] mb-1.5">
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your new password"
                className="w-full rounded-xl border border-white/12 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-[#6b7394] outline-none transition-all duration-200 focus:border-[#22d3ee] focus:bg-[#22d3ee]/[0.08] focus:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl btn-gradient-shimmer py-3.5 text-sm font-semibold text-[#0b0f1e] shadow-[0_8px_20px_rgba(34,211,238,0.3)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(34,211,238,0.45)] active:scale-98 disabled:opacity-60 cursor-pointer group"
            >
              <span>{loading ? 'Updating Password…' : 'Update Password'}</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1.5 font-bold">→</span>
            </button>
          </form>
        )}

        {!success && (
          <p className="mt-6 text-center text-xs text-[#99a2c2]">
            Remember your password?{' '}
            <Link to="/login/job_seeker" className="font-semibold text-[#67e8f9] hover:underline transition hover:text-cyan-300">
              Back to Sign in
            </Link>
          </p>
        )}
      </div>
    </AuthLayout>
  )
}
