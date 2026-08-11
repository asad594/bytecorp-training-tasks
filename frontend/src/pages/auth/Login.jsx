import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/common/AuthLayout'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
// Wired custom hooks (useForm & useAuth)
import useForm from '../../hooks/useForm'
import useAuth from '../../hooks/useAuth'
import useGoogleAuth from '../../hooks/useGoogleAuth'
import * as authApi from '../../api/authApi'

const roleConfig = {
  job_seeker: {
    badgeLabel: 'JobBoard',
    heading: ['Every application', 'starts with a good match'],
    subheading:
      'Sign in to browse open roles, track your applications, and hear back from companies that are hiring right now.',
    signInSubtitle: 'Continue your job search where you left off',
    emailPlaceholder: 'you@company.com',
    showSocial: true,
    showRegister: true,
    registerHref: '/register/job_seeker',
    showFloatingCards: true,
    cardsVariant: 'jobs',
  },
  company_rep: {
    badgeLabel: 'JobBoard for Business',
    heading: ['Every great hire', 'starts with the right match'],
    subheading:
      'Sign in to post roles, manage your listings, and review applicants for your company.',
    signInSubtitle: 'Pick up your hiring where you left off',
    emailPlaceholder: 'hr@yourcompany.com',
    showSocial: false,
    showRegister: true,
    registerHref: '/register/company_rep',
    showFloatingCards: true,
    cardsVariant: 'hiring',
  },
  admin: {
    badgeLabel: 'JobBoard Admin',
    heading: ['Keep the whole', 'pipeline in check'],
    subheading:
      'Sign in to manage companies, moderate listings, and oversee accounts across the platform.',
    signInSubtitle: 'Restricted administrative access',
    emailPlaceholder: 'admin@jobboard.com',
    showSocial: false,
    showRegister: false,
    registerHref: null,
    showFloatingCards: false,
    cardsVariant: 'jobs',
  },
}

export default function Login() {
  const { role = 'job_seeker' } = useParams()
  const navigate = useNavigate()
  const currentRole = roleConfig[role] ? role : 'job_seeker'
  const config = roleConfig[currentRole]

  // Wired useAuth custom hook for global auth state management
  const { login: authLogin } = useAuth()
  const { triggerGoogleSignIn, loading: googleLoading, error: googleError, hiddenButtonRef } = useGoogleAuth()

  // Keep non-form UI state as local useState
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)

  // Wired useForm custom hook for form state, validation errors, and submit handling
  const { form, errors, loading, handleChange, handleSubmit } = useForm(
    { email: '', password: '' },
    async (values, { setErrors }) => {
      try {
        const tokens = await authApi.login(currentRole, {
          email: values.email,
          password: values.password,
        })
        const userProfile = await authApi.getProfile(tokens.access)
        authLogin(userProfile, tokens.access)

        if (currentRole === 'job_seeker') {
          navigate('/jobs')
        } else {
          navigate('/dashboard')
        }
      } catch (err) {
        let errorMessage = 'Login failed. Please check your email and password.'
        if (!err.response) {
          errorMessage =
            'Unable to connect to the backend server. Please ensure the Django server is running on http://localhost:8000'
        } else if (err.response?.data) {
          const d = err.response.data
          if (typeof d.detail === 'string') {
            errorMessage = d.detail
          } else if (typeof d.message === 'string') {
            errorMessage = d.message
          } else if (Array.isArray(d.non_field_errors)) {
            errorMessage = d.non_field_errors.join(' ')
          } else if (typeof d === 'object') {
            const firstKey = Object.keys(d)[0]
            if (firstKey && Array.isArray(d[firstKey])) {
              errorMessage = `${firstKey}: ${d[firstKey].join(' ')}`
            }
          }
        }
        setErrors({ general: errorMessage })
      }
    }
  )

  return (
    <AuthLayout
      badgeLabel={config.badgeLabel}
      heading={config.heading}
      subheading={config.subheading}
      showFloatingCards={config.showFloatingCards}
      cardsVariant={config.cardsVariant}
    >
      <div className="w-full rounded-[20px] border border-white/14 bg-white/[0.06] p-7 sm:p-9 shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[22px] transition-all duration-300 hover:border-cyan-400/30 hover:shadow-[0_12px_45px_rgba(0,0,0,0.5)] focus-within:border-cyan-400/50 focus-within:shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_30px_rgba(34,211,238,0.15)]">

        {/* Role Selector Tabs (Left as raw buttons to preserve custom active/inactive tab segment styling) */}
        <div className="mb-6 flex rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-md">
          <button
            type="button"
            onClick={() => navigate('/login/job_seeker')}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
              currentRole === 'job_seeker'
                ? 'bg-gradient-to-r from-cyan-400 to-indigo-400 text-[#0b0f1e] shadow-[0_0_12px_rgba(34,211,238,0.3)] scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Job Seeker
          </button>
          <button
            type="button"
            onClick={() => navigate('/login/company_rep')}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
              currentRole === 'company_rep'
                ? 'bg-gradient-to-r from-cyan-400 to-indigo-400 text-[#0b0f1e] shadow-[0_0_12px_rgba(34,211,238,0.3)] scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Employer
          </button>
          <button
            type="button"
            onClick={() => navigate('/login/admin')}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
              currentRole === 'admin'
                ? 'bg-gradient-to-r from-cyan-400 to-indigo-400 text-[#0b0f1e] shadow-[0_0_12px_rgba(34,211,238,0.3)] scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Card Header */}
        <h2 className="font-sora text-2xl font-bold text-white mb-1">Sign in</h2>
        <p className="text-xs text-[#99a2c2] mb-6">{config.signInSubtitle}</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {(errors.general || googleError) && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 animate-pulse">
              {errors.general || googleError}
            </div>
          )}

          {/* Email Field with field-specific error prop from useForm */}
          <Input
            label="Email Address"
            type="email"
            name="email"
            required
            value={form.email || ''}
            onChange={handleChange}
            error={errors.email}
            placeholder={config.emailPlaceholder}
          />

          {/* Password Field with field-specific error prop from useForm */}
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              value={form.password || ''}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-9 text-base text-slate-400 hover:text-white transition duration-200 hover:scale-125 opacity-80 cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>

          {/* Field Row: Remember me & Forgot Password */}
          <div className="flex items-center justify-between text-[0.78rem] text-[#a8b0cc] mt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/5 accent-cyan-400 cursor-pointer transition group-hover:scale-110"
              />
              <span className="group-hover:text-slate-200 transition">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-[#67e8f9] hover:underline font-medium transition hover:text-cyan-300">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button using useForm loading state */}
          <Button
            type="submit"
            isLoading={loading}
            variant="primary"
            size="lg"
            className="mt-2 w-full btn-gradient-shimmer"
          >
            <span>Sign in</span>
            <span className="font-bold">→</span>
          </Button>
        </form>

        {/* Social Login Separator */}
        {config.showSocial && (
          <>
            <div className="my-6 flex items-center text-xs text-[#6b7394]">
              <span className="flex-1 border-b border-white/10" />
              <span className="px-3">or continue with</span>
              <span className="flex-1 border-b border-white/10" />
            </div>

            <div ref={hiddenButtonRef} className="absolute opacity-0 pointer-events-none h-0 overflow-hidden" />
            <button
              type="button"
              onClick={triggerGoogleSignIn}
              disabled={googleLoading}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/12 bg-white/[0.05] py-3 text-xs font-semibold text-[#e6e9f5] transition duration-200 hover:bg-white/10 hover:border-cyan-400/40 hover:scale-[1.01] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-current"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 12.8s.7 3.1 1.9 5.5l3.7-3.5z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </>
        )}

        {/* Footer Link */}
        {config.showRegister && (
          <p className="mt-6 text-center text-xs text-[#99a2c2]">
            New here?{' '}
            <Link to={config.registerHref} className="font-semibold text-[#67e8f9] hover:underline transition hover:text-cyan-300">
              Create an account
            </Link>
          </p>
        )}
      </div>
    </AuthLayout>
  )
}