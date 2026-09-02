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
                I agree to the <span className="text-cyan-400 hover:underline">Terms of Service</span> and <span className="text-cyan-400 hover:underline">Privacy Policy</span>.
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
