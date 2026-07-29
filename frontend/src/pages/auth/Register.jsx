import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/common/AuthLayout'

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

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [e.target.name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!form.agreeTerms) {
      setError('You must agree to the Terms of Service to create an account.')
      return
    }

    setLoading(true)

    try {
      console.log(`Registering ${currentRole} payload:`, form)
      await new Promise((resolve) => setTimeout(resolve, 600))
      navigate(`/login/${currentRole}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create account. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      badgeLabel={config.badgeLabel}
      heading={config.heading}
      subheading={config.subheading}
      showFloatingCards={true}
      cardsVariant={currentRole === 'company_rep' ? 'hiring' : 'jobs'}
    >
      <div className="rounded-[20px] border border-white/14 bg-white/[0.06] p-7 sm:p-9 shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[22px] transition-all duration-300 focus-within:border-cyan-400/45">
        
        {/* Role Selector Tabs */}
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

        <h2 className="font-sora text-2xl font-bold text-white mb-1">Create Account</h2>
        <p className="text-xs text-[#99a2c2] mb-6">{config.subtitle}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[0.78rem] font-medium text-[#b7bede] mb-1.5">First Name</label>
              <input
                type="text"
                name="firstName"
                required
                value={form.firstName}
                onChange={handleChange}
                placeholder="Alex"
                className="w-full rounded-xl border border-white/12 bg-white/[0.05] px-3.5 py-2.5 text-sm text-white placeholder-[#6b7394] outline-none transition focus:border-[#22d3ee] focus:bg-[#22d3ee]/[0.06]"
              />
            </div>
            <div>
              <label className="block text-[0.78rem] font-medium text-[#b7bede] mb-1.5">Last Name</label>
              <input
                type="text"
                name="lastName"
                required
                value={form.lastName}
                onChange={handleChange}
                placeholder="Morgan"
                className="w-full rounded-xl border border-white/12 bg-white/[0.05] px-3.5 py-2.5 text-sm text-white placeholder-[#6b7394] outline-none transition focus:border-[#22d3ee] focus:bg-[#22d3ee]/[0.06]"
              />
            </div>
          </div>

          {config.showCompanyField && (
            <div>
              <label className="block text-[0.78rem] font-medium text-[#b7bede] mb-1.5">Company Name</label>
              <input
                type="text"
                name="companyName"
                required
                value={form.companyName}
                onChange={handleChange}
                placeholder="Acme Tech Inc."
                className="w-full rounded-xl border border-white/12 bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder-[#6b7394] outline-none transition focus:border-[#22d3ee] focus:bg-[#22d3ee]/[0.06]"
              />
            </div>
          )}

          <div>
            <label className="block text-[0.78rem] font-medium text-[#b7bede] mb-1.5">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@domain.com"
              className="w-full rounded-xl border border-white/12 bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder-[#6b7394] outline-none transition focus:border-[#22d3ee] focus:bg-[#22d3ee]/[0.06]"
            />
          </div>

          <div>
            <label className="block text-[0.78rem] font-medium text-[#b7bede] mb-1.5">Password</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                className="w-full rounded-xl border border-white/12 bg-white/[0.05] px-4 py-2.5 pr-11 text-sm text-white placeholder-[#6b7394] outline-none transition focus:border-[#22d3ee] focus:bg-[#22d3ee]/[0.06]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 text-base text-slate-400 hover:text-white transition opacity-80"
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[0.78rem] font-medium text-[#b7bede] mb-1.5">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              required
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              className="w-full rounded-xl border border-white/12 bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder-[#6b7394] outline-none transition focus:border-[#22d3ee] focus:bg-[#22d3ee]/[0.06]"
            />
          </div>

          <div className="mt-1">
            <label className="flex items-start gap-2.5 cursor-pointer text-[0.78rem] text-[#a8b0cc]">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={form.agreeTerms}
                onChange={handleChange}
                className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 accent-cyan-400"
              />
              <span>
                I agree to the <span className="text-cyan-400 hover:underline">Terms of Service</span> and <span className="text-cyan-400 hover:underline">Privacy Policy</span>.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#22d3ee] to-[#818cf8] py-3.5 text-sm font-semibold text-[#0b0f1e] shadow-[0_8px_20px_rgba(34,211,238,0.25)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(34,211,238,0.35)] disabled:opacity-60 cursor-pointer group"
          >
            <span>{loading ? 'Creating Account…' : 'Create Account'}</span>
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </button>
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
          <Link to={config.loginHref} className="font-semibold text-[#67e8f9] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
