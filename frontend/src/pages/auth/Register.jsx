import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import { SpinnerIcon, GoogleIcon, EyeIcon, EyeOffIcon } from '@/assets/icons'
import AuthLayout from '../../components/common/AuthLayout'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import useGoogleAuth from '../../hooks/useGoogleAuth'
import * as authApi from '../../api/authApi'
import registerSchema from '../../schemas/registerSchema'
import { parseApiError } from '../../utils/apiError'

const roleConfig = {
  job_seeker: {
    badgeLabel: 'JobBoard',
    heading: ['Join thousands', 'of job seekers today'],
    subheading:
      'Create your profile to apply for top software engineering, design, and product roles in one click.',
    subtitle: 'Create your Job Seeker account',
    loginHref: '/login/job_seeker',
    showSocial: true,
  },
  company_rep: {
    badgeLabel: 'JobBoard for Business',
    heading: ['Hire top talent', 'faster and smarter'],
    subheading:
      'Set up your company hiring profile, post open roles, and track applications seamlessly.',
    subtitle: 'Create your Employer account',
    loginHref: '/login/company_rep',
    showSocial: false,
  },
}

// Static class maps (never build Tailwind class names dynamically with template
// strings — the JIT compiler only picks up classes it can see literally in source).
const strengthColorClasses = {
  weak: { bar: 'bg-rose-400', text: 'text-rose-400' },
  medium: { bar: 'bg-amber-400', text: 'text-amber-400' },
  strong: { bar: 'bg-gradient-to-r from-cyan-400 to-indigo-400', text: 'text-cyan-300' },
}

const strengthCriteria = [
  { key: 'length', label: '8+ Chars', test: (v) => v.length >= 8 },
  { key: 'uppercase', label: 'Uppercase', test: (v) => /[A-Z]/.test(v) },
  { key: 'lowercase', label: 'Lowercase', test: (v) => /[a-z]/.test(v) },
  { key: 'number', label: 'Number', test: (v) => /[0-9]/.test(v) },
  { key: 'symbol', label: 'Symbol', test: (v) => /[^A-Za-z0-9]/.test(v) },
]

export default function Register() {
  const { role = 'job_seeker' } = useParams()
  const navigate = useNavigate()
  const currentRole = roleConfig[role] ? role : 'job_seeker'
  const config = roleConfig[currentRole]
  const { triggerGoogleSignIn, loading: googleLoading, error: googleError, hiddenButtonRef } = useGoogleAuth()

  // Keep non-form UI state as local useState
  const [showPassword, setShowPassword] = useState(false)
  const [generalError, setGeneralError] = useState('')

  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    years_of_experience: '',
  }

  // Formik form handling with Yup validation schema
  const formik = useFormik({
    initialValues,
    validationSchema: registerSchema,
    onSubmit: async (values, { setErrors }) => {
      setGeneralError('')
      try {
        const fullName = `${values.firstName || ''} ${values.lastName || ''}`.trim() || values.email.split('@')[0]
        await authApi.register(currentRole, {
          name: fullName,
          email: values.email,
          password: values.password,
          ...(currentRole === 'job_seeker' && values.years_of_experience !== ''
            ? { years_of_experience: Number(values.years_of_experience) }
            : {}),
        })
        navigate(`/login/${currentRole}`, {
          state: { message: 'Account created successfully! Please sign in.' },
        })
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

  // Real-time password strength (derived on every render — no extra effect needed)
  const passwordValue = formik.values.password || ''
  const passedChecks = strengthCriteria.filter((c) => c.test(passwordValue))
  const strengthScore = passedChecks.length
  const strengthTier =
    strengthScore <= 2 ? 'weak' : strengthScore <= 4 ? 'medium' : 'strong'
  const strengthLabel =
    strengthScore <= 2 ? 'Weak' : strengthScore <= 4 ? 'Medium' : 'Strong'

  const confirmPasswordValue = formik.values.confirmPassword || ''
  const passwordsMatch =
    confirmPasswordValue.length > 0 && passwordValue === confirmPasswordValue

  return (
    <AuthLayout
      badgeLabel={config.badgeLabel}
      heading={config.heading}
      subheading={config.subheading}
      showFloatingCards={true}
      cardsVariant={currentRole === 'company_rep' ? 'hiring' : 'jobs'}
    >
      <div className="rounded-[20px] border border-white/14 bg-white/[0.06] p-7 sm:p-9 shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[22px] transition-all duration-300 focus-within:border-cyan-400/45">
        
        {/* Role Selector Tabs (Left as raw buttons to preserve custom active/inactive tab segment styling) */}
        <div className="mb-6 flex rounded-xl border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => navigate('/register/job_seeker')}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
              currentRole === 'job_seeker'
                ? 'bg-gradient-to-r from-cyan-400 to-indigo-400 text-brand-bg shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Job Seeker
          </button>
          <button
            type="button"
            onClick={() => navigate('/register/company_rep')}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
              currentRole === 'company_rep'
                ? 'bg-gradient-to-r from-cyan-400 to-indigo-400 text-brand-bg shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Employer
          </button>
        </div>

        {/* Card Header */}
        <h2 className="font-sora text-2xl font-bold text-white mb-1">Create Account</h2>
        <p className="text-xs text-text-sub mb-6">{config.subtitle}</p>

        {/* Form */}
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
          {(generalError || formik.errors.general || formik.errors.agreeTerms || googleError) && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              {generalError || formik.errors.general || formik.errors.agreeTerms || googleError}
            </div>
          )}

          {/* Name Row with field-specific errors from Formik */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              type="text"
              name="firstName"
              required
              value={formik.values.firstName || ''}
              onChange={(e) => {
                if (generalError) setGeneralError('')
                formik.handleChange(e)
              }}
              onBlur={formik.handleBlur}
              error={formik.touched.firstName && formik.errors.firstName}
              placeholder="Alex"
            />
            <Input
              label="Last Name"
              type="text"
              name="lastName"
              required
              value={formik.values.lastName || ''}
              onChange={(e) => {
                if (generalError) setGeneralError('')
                formik.handleChange(e)
              }}
              onBlur={formik.handleBlur}
              error={formik.touched.lastName && formik.errors.lastName}
              placeholder="Morgan"
            />
          </div>

          {/* Email with field-specific error from Formik */}
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
            placeholder="you@domain.com"
          />

          {/* Years of Experience (job seekers only) with field-specific error from Formik */}
          {currentRole === 'job_seeker' && (
            <Input
              label="Years of Experience"
              type="number"
              name="years_of_experience"
              min="0"
              max="60"
              value={formik.values.years_of_experience ?? ''}
              onChange={(e) => {
                if (generalError) setGeneralError('')
                formik.handleChange(e)
              }}
              onBlur={formik.handleBlur}
              error={formik.touched.years_of_experience && formik.errors.years_of_experience}
              placeholder="e.g. 2"
            />
          )}

          {/* Password with field-specific error from Formik */}
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
              placeholder="Minimum 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-9 text-slate-400 hover:text-white transition opacity-80 cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOffIcon width="18" height="18" stroke="currentColor" strokeWidth="2" />
              ) : (
                <EyeIcon width="18" height="18" stroke="currentColor" strokeWidth="2" />
              )}
            </button>
          </div>

          {/* Real-Time Password Strength Meter */}
          {passwordValue.length > 0 && (
            <div className="-mt-2 rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Password Strength</span>
                <span className={`font-bold ${strengthColorClasses[strengthTier].text}`}>
                  {strengthLabel}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${strengthColorClasses[strengthTier].bar}`}
                  style={{ width: `${(strengthScore / strengthCriteria.length) * 100}%` }}
                />
              </div>
              <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[0.7rem]">
                {strengthCriteria.map((c) => {
                  const passed = c.test(passwordValue)
                  return (
                    <span
                      key={c.key}
                      className={`transition-colors ${passed ? 'text-cyan-300' : 'text-slate-500'}`}
                    >
                      {passed ? '✓' : '○'} {c.label}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Confirm Password with field-specific error from Formik */}
          <Input
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            required
            value={formik.values.confirmPassword || ''}
            onChange={(e) => {
              if (generalError) setGeneralError('')
              formik.handleChange(e)
            }}
            onBlur={formik.handleBlur}
            error={formik.touched.confirmPassword && formik.errors.confirmPassword}
            placeholder="Re-enter your password"
          />

          {/* Real-Time Password Match Indicator */}
          {confirmPasswordValue.length > 0 && (
            <p
              className={`-mt-2 flex items-center gap-1.5 text-[0.7rem] font-medium ${
                passwordsMatch ? 'text-cyan-300' : 'text-rose-400'
              }`}
            >
              {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
            </p>
          )}

          {/* Terms checkbox */}
          <div className="mt-1">
            <label className="flex items-start gap-2.5 cursor-pointer text-[0.78rem] text-text-desc">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formik.values.agreeTerms || false}
                onChange={(e) => {
                  if (generalError) setGeneralError('')
                  formik.handleChange(e)
                }}
                className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 accent-cyan-400"
              />
              <span>
                I agree to the{' '}
                <Link
                  to={`/legal/terms/${currentRole}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  to={`/legal/privacy/${currentRole}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          </div>

          {/* Submit Button using Formik isSubmitting state */}
          <Button
            type="submit"
            isLoading={formik.isSubmitting}
            variant="primary"
            size="lg"
            className="mt-2 w-full btn-gradient-shimmer"
          >
            <span>Create Account</span>
            <span className="font-bold">→</span>
          </Button>
        </form>

        {/* Social Login Separator */}
        {config.showSocial && (
          <>
            <div className="my-6 flex items-center text-xs text-text-divider">
              <span className="flex-1 border-b border-white/10" />
              <span className="px-3">or sign up with</span>
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
                  <span>Sign up with Google</span>
                </>
              )}
            </button>
          </>
        )}

        {/* Footer Link */}
        <p className="mt-6 text-center text-xs text-text-sub">
          Already have an account?{' '}
          <Link to={config.loginHref} className="font-semibold text-cyan-accent hover:underline transition hover:text-cyan-300">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}