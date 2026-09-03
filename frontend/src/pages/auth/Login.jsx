import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import { SpinnerIcon, GoogleIcon, EyeIcon, EyeOffIcon } from '@/assets/icons'
import AuthLayout from '../../components/common/AuthLayout'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import useAuth from '../../hooks/useAuth'
import useGoogleAuth from '../../hooks/useGoogleAuth'
import * as authApi from '../../api/authApi'
import loginSchema from '../../schemas/loginSchema'
import { parseApiError } from '../../utils/apiError'

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
    showFloatingCards: true,
    cardsVariant: 'admin',
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
  const [generalError, setGeneralError] = useState('')

  // Formik form handling with Yup validation schema
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { setErrors }) => {
      setGeneralError('')
      try {
        const tokens = await authApi.login(currentRole, {
          email: values.email,
          password: values.password,
        })
        const userProfile = await authApi.getProfile(tokens.access)
        authLogin(userProfile, tokens.access, tokens.refresh)

        if (currentRole === 'job_seeker') {
          navigate('/jobs')
        } else if (currentRole === 'admin') {
          navigate('/admin/companies')
        } else {
          navigate('/dashboard')
        }
      } catch (err) {
        const { general, fieldErrors } = parseApiError(err)
        if (general) {
          setGeneralError(general)
        }
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors)
        }
      }
    },
  })

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
                ? 'bg-gradient-to-r from-cyan-400 to-indigo-400 text-brand-bg shadow-[0_0_12px_rgba(34,211,238,0.3)] scale-[1.02]'
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
                ? 'bg-gradient-to-r from-cyan-400 to-indigo-400 text-brand-bg shadow-[0_0_12px_rgba(34,211,238,0.3)] scale-[1.02]'
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
                ? 'bg-gradient-to-r from-cyan-400 to-indigo-400 text-brand-bg shadow-[0_0_12px_rgba(34,211,238,0.3)] scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Card Header */}
        <h2 className="font-sora text-2xl font-bold text-white mb-1">Sign in</h2>
        <p className="text-xs text-text-sub mb-6">{config.signInSubtitle}</p>

        {/* Form */}
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
          {(generalError || formik.errors.general || googleError) && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 animate-pulse">
              {generalError || formik.errors.general || googleError}
            </div>
          )}

          {/* Email Field with field-specific error prop from Formik */}
          <Input
            label="Email Address"
            type="email"
            name="email"
            required
            value={formik.values.email || ''}
            onChange={(e) => {
              if (generalError) setGeneralError('')
              formik.handleChange(e)
            }}
            onBlur={formik.handleBlur}
            error={formik.touched.email && formik.errors.email}
            placeholder={config.emailPlaceholder}
          />

          {/* Password Field with field-specific error prop from Formik */}
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              value={formik.values.password || ''}
              onChange={(e) => {
                if (generalError) setGeneralError('')
                formik.handleChange(e)
              }}
              onBlur={formik.handleBlur}
              error={formik.touched.password && formik.errors.password}
              placeholder="••••••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-9 text-slate-400 hover:text-white transition duration-200 opacity-80 cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOffIcon width="18" height="18" stroke="currentColor" strokeWidth="2" />
              ) : (
                <EyeIcon width="18" height="18" stroke="currentColor" strokeWidth="2" />
              )}
            </button>
          </div>

          {/* Field Row: Remember me & Forgot Password */}
          <div className="flex items-center justify-between text-[0.78rem] text-text-desc mt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/5 accent-cyan-400 cursor-pointer transition group-hover:scale-110"
              />
              <span className="group-hover:text-slate-200 transition">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-cyan-accent hover:underline font-medium transition hover:text-cyan-300">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button using Formik isSubmitting state */}
          <Button
            type="submit"
            isLoading={formik.isSubmitting}
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
            <div className="my-6 flex items-center text-xs text-text-divider">
              <span className="flex-1 border-b border-white/10" />
              <span className="px-3">or continue with</span>
              <span className="flex-1 border-b border-white/10" />
            </div>

            <div ref={hiddenButtonRef} className="absolute opacity-0 pointer-events-none h-0 overflow-hidden" />
            <button
              type="button"
              onClick={triggerGoogleSignIn}
              disabled={googleLoading}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/12 bg-white/[0.05] py-3 text-xs font-semibold text-body-text transition duration-200 hover:bg-white/10 hover:border-cyan-400/40 hover:scale-[1.01] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <>
                  <SpinnerIcon />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </>
        )}

        {/* Footer Link */}
        {config.showRegister && (
          <p className="mt-6 text-center text-xs text-text-sub">
            New here?{' '}
            <Link to={config.registerHref} className="font-semibold text-cyan-accent hover:underline transition hover:text-cyan-300">
              Create an account
            </Link>
          </p>
        )}
      </div>
    </AuthLayout>
  )
}