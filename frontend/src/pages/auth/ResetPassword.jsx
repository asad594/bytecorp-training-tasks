import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import AuthLayout from '../../components/common/AuthLayout'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import * as authApi from '../../api/authApi'
import resetPasswordSchema from '../../schemas/resetPasswordSchema'
import { parseApiError } from '../../utils/apiError'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const uid = searchParams.get('uid') || ''
  const token = searchParams.get('token') || ''

  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [generalError, setGeneralError] = useState('')

  const initialValues = {
    newPassword: '',
    confirmPassword: '',
  }

  const formik = useFormik({
    initialValues,
    validationSchema: resetPasswordSchema,
    onSubmit: async (values, { setErrors }) => {
      setGeneralError('')

      if (!uid || !token) {
        setGeneralError('Invalid password reset link. Please request a new link.')
        return
      }

      try {
        await authApi.resetPassword({
          uid,
          token,
          new_password: values.newPassword,
        })
        setSuccess(true)
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
      badgeLabel="JobBoard"
      heading={['Set your new', 'account password']}
      subheading="Please enter your new password below. Make sure it is at least 8 characters long with numbers and special characters."
      showFloatingCards={false}
    >
      <div className="rounded-[20px] border border-white/14 bg-white/[0.06] p-7 sm:p-9 shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[22px] transition-all duration-300 focus-within:border-cyan-400/50 animate-fade-in-up">
        
        <h2 className="font-sora text-2xl font-bold text-white mb-1">Reset Password</h2>
        <p className="text-xs text-text-sub mb-6">Create a new secure password for your account.</p>

        {success ? (
          <div className="text-center py-4">
            <span className="text-4xl">🎉</span>
            <h3 className="mt-3 font-sora text-lg font-bold text-white">Password Reset Successful!</h3>
            <p className="mt-2 text-xs text-slate-300 mb-6">
              Your password has been updated. You can now log in with your new password.
            </p>
            <Button
              onClick={() => navigate('/login/job_seeker')}
              variant="primary"
              size="lg"
              className="w-full btn-gradient-shimmer"
            >
              Go to Sign In →
            </Button>
          </div>
        ) : (
          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
            {(generalError || formik.errors.general) && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 animate-pulse">
                {generalError || formik.errors.general}
              </div>
            )}

            <div className="relative">
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                required
                value={formik.values.newPassword || ''}
                onChange={(e) => {
                  if (generalError) setGeneralError('')
                  formik.handleChange(e)
                }}
                onBlur={formik.handleBlur}
                error={formik.touched.newPassword && formik.errors.newPassword}
                placeholder="Minimum 8 characters"
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

            <Input
              label="Confirm New Password"
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
              placeholder="Re-enter your new password"
            />

            <Button
              type="submit"
              isLoading={formik.isSubmitting}
              variant="primary"
              size="lg"
              className="mt-2 w-full btn-gradient-shimmer"
            >
              <span>Update Password</span>
              <span className="font-bold">→</span>
            </Button>
          </form>
        )}

        {!success && (
          <p className="mt-6 text-center text-xs text-text-sub">
            Remember your password?{' '}
            <Link to="/login/job_seeker" className="font-semibold text-cyan-accent hover:underline transition hover:text-cyan-300">
              Back to Sign in
            </Link>
          </p>
        )}
      </div>
    </AuthLayout>
  )
}
