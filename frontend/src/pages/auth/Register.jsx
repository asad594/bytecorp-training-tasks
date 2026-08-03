import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/common/AuthLayout'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
// Wired custom hooks (useForm)
import useForm from '../../hooks/useForm'

const roleConfig = {
  job_seeker: {
    badgeLabel: 'JobBoard',
    heading: ['Join thousands', 'of job seekers today'],
    subheading:
      'Create your profile to apply for top software engineering, design, and product roles in one click.',
    subtitle: 'Create your Job Seeker account',
    loginHref: '/login/job_seeker',
    showCompanyField: false,
    showSocial: true,
  },
  company_rep: {
    badgeLabel: 'JobBoard for Business',
    heading: ['Hire top talent', 'faster and smarter'],
    subheading:
      'Set up your company hiring profile, post open roles, and track applications seamlessly.',
    subtitle: 'Create your Employer account',
    loginHref: '/login/company_rep',
    showCompanyField: true,
    showSocial: false,
  },
}

export default function Register() {
  const { role = 'job_seeker' } = useParams()
  const navigate = useNavigate()
  const currentRole = roleConfig[role] ? role : 'job_seeker'
  const config = roleConfig[currentRole]

  // Keep non-form UI state as local useState
  const [showPassword, setShowPassword] = useState(false)

  const initialValues = {
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  }

  // Wired useForm custom hook for form state, validation errors, and submit handling
  const { form, errors, loading, handleChange, handleSubmit } = useForm(
    initialValues,
    async (values, { setErrors }) => {
      if (values.password !== values.confirmPassword) {
        setErrors({ confirmPassword: 'Passwords do not match.' })
        return
      }

      if (!values.agreeTerms) {
        setErrors({ general: 'You must agree to the Terms of Service to create an account.' })
        return
      }

      // Simulate API request delay
      await new Promise((resolve) => setTimeout(resolve, 600))
      navigate(`/login/${currentRole}`)
    }
  )

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
                ? 'bg-gradient-to-r from-cyan-400 to-indigo-400 text-[#0b0f1e] shadow-md'
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
                ? 'bg-gradient-to-r from-cyan-400 to-indigo-400 text-[#0b0f1e] shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Employer
          </button>
        </div>

        {/* Card Header */}
        <h2 className="font-sora text-2xl font-bold text-white mb-1">Create Account</h2>
        <p className="text-xs text-[#99a2c2] mb-6">{config.subtitle}</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {errors.general && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              {errors.general}
            </div>
          )}

          {/* Name Row with field-specific errors from useForm */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              type="text"
              name="firstName"
              required
              value={form.firstName || ''}
              onChange={handleChange}
              error={errors.firstName}
              placeholder="Alex"
            />
            <Input
              label="Last Name"
              type="text"
              name="lastName"
              required
              value={form.lastName || ''}
              onChange={handleChange}
              error={errors.lastName}
              placeholder="Morgan"
            />
          </div>

          {/* Optional Company Name for Company Rep */}
          {config.showCompanyField && (
            <Input
              label="Company Name"
              type="text"
              name="companyName"
              required
              value={form.companyName || ''}
              onChange={handleChange}
              error={errors.companyName}
              placeholder="Acme Tech Inc."
            />
          )}

          {/* Email with field-specific error from useForm */}
          <Input
            label="Email Address"
            type="email"
            name="email"
            required
            value={form.email || ''}
            onChange={handleChange}
            error={errors.email}
            placeholder="you@domain.com"
          />

          {/* Password with field-specific error from useForm */}
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              value={form.password || ''}
              onChange={handleChange}
              error={errors.password}
              placeholder="Minimum 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-9 text-base text-slate-400 hover:text-white transition opacity-80 cursor-pointer"
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>

          {/* Confirm Password with field-specific error from useForm */}
          <Input
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            required
            value={form.confirmPassword || ''}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Re-enter your password"
          />

          {/* Terms checkbox */}
          <div className="mt-1">
            <label className="flex items-start gap-2.5 cursor-pointer text-[0.78rem] text-[#a8b0cc]">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={form.agreeTerms || false}
                onChange={handleChange}
                className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 accent-cyan-400"
              />
              <span>
                I agree to the <span className="text-cyan-400 hover:underline">Terms of Service</span> and <span className="text-cyan-400 hover:underline">Privacy Policy</span>.
              </span>
            </label>
          </div>

          {/* Submit Button using useForm loading state */}
          <Button
            type="submit"
            isLoading={loading}
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
            <div className="my-6 flex items-center text-xs text-[#6b7394]">
              <span className="flex-1 border-b border-white/10" />
              <span className="px-3">or sign up with</span>
              <span className="flex-1 border-b border-white/10" />
            </div>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/12 bg-white/[0.05] py-3 text-xs font-semibold text-[#e6e9f5] transition duration-200 hover:bg-white/10 hover:border-cyan-400/40 hover:scale-[1.01] cursor-pointer"
            >
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
              <span>Sign up with Google</span>
            </button>
          </>
        )}

        {/* Footer Link */}
        <p className="mt-6 text-center text-xs text-[#99a2c2]">
          Already have an account?{' '}
          <Link to={config.loginHref} className="font-semibold text-[#67e8f9] hover:underline transition hover:text-cyan-300">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
