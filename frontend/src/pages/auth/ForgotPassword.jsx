import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../../components/common/AuthLayout'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
// Wired custom hook (useForm)
import useForm from '../../hooks/useForm'

export default function ForgotPassword() {
  // Keep success message as local state
  const [message, setMessage] = useState('')

  // Wired useForm custom hook for form values, errors, and submit handling
  const { form, errors, loading, handleChange, handleSubmit } = useForm(
    { email: '' },
    async () => {
      setMessage('')
      // Simulate API call to POST /accounts/password/forgot/
      await new Promise((resolve) => setTimeout(resolve, 800))
      setMessage('If an account with that email exists, a password reset link has been sent to your email.')
    }
  )

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

        {errors.general && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email Address"
            type="email"
            name="email"
            required
            value={form.email || ''}
            onChange={handleChange}
            error={errors.email}
            placeholder="you@company.com"
          />

          <Button
            type="submit"
            isLoading={loading}
            variant="primary"
            size="lg"
            className="mt-2 w-full btn-gradient-shimmer"
          >
            <span>Send Reset Link</span>
            <span className="font-bold">→</span>
          </Button>
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
