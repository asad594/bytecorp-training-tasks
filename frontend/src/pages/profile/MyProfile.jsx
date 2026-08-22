  import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import { BriefcaseIcon } from '@/assets/icons'
import colors from '@/styles/colors'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import SkillPicker from '../../components/common/SkillPicker'
import useAuth from '../../hooks/useAuth'
import * as authApi from '../../api/authApi'
import profileSchema from '../../schemas/profileSchema'
import { parseApiError } from '../../utils/apiError'

export default function MyProfile() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState(null)
  const [generalError, setGeneralError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      bio: profileData?.bio || '',
      years_of_experience: profileData?.years_of_experience ?? 0,
      skill_ids: (profileData?.skills || []).map((s) => s.skill_id),
    },
    validationSchema: profileSchema,
    onSubmit: async (values, { setErrors, setSubmitting }) => {
      setGeneralError('')
      setSuccessMessage('')
      try {
        const payload = {
          bio: values.bio,
          years_of_experience: Number(values.years_of_experience) || 0,
          skill_ids: values.skill_ids || [],
        }
        const updated = await authApi.updateProfile(payload)
        setProfileData(updated)
        setSuccessMessage('Your profile has been updated successfully!')
      } catch (err) {
        const { general, fieldErrors } = parseApiError(err)
        if (general) {
          setGeneralError(general)
        }
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors)
        }
      } finally {
        setSubmitting(false)
      }
    },
  })

  useEffect(() => {
    let isMounted = true
    async function loadProfile() {
      setLoading(true)
      try {
        const data = await authApi.getProfile()
        if (isMounted) {
          setProfileData(data)
        }
      } catch (err) {
        if (isMounted) {
          const { general } = parseApiError(err)
          setGeneralError(general || 'Failed to load profile details.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadProfile()
    return () => {
      isMounted = false
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const userDisplayName = profileData?.name || user?.name || user?.email?.split('@')[0] || 'Seeker'

  return (
    <div className="relative min-h-screen bg-brand-bg text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-900 overflow-hidden">
      {/* Background Animated Glow Orbs */}
      <div className="pointer-events-none fixed -top-40 -left-40 h-[550px] w-[550px] rounded-full bg-cyan-500/15 blur-[130px] animate-pulse-glow" />
      <div
        className="pointer-events-none fixed top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-[140px] animate-pulse-glow"
        style={{ animationDelay: '3s' }}
      />

      {/* Sticky Header Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-brand-bg/85 backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-sora text-xl font-extrabold text-white group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-[0_0_18px_rgba(34,211,238,0.5)] transition duration-300 group-hover:scale-110">
              <BriefcaseIcon width="20" height="20" stroke={colors.background.main} strokeWidth="2.5" />
            </div>
            <span className="bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
              JobBoard
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              to="/jobs"
              className="text-sm font-medium text-slate-300 transition hover:text-cyan-400 hover:scale-105"
            >
              Jobs
            </Link>
            <Link
              to="/applications"
              className="text-sm font-medium text-slate-300 transition hover:text-cyan-400 hover:scale-105"
            >
              My Applications
            </Link>
            <Link
              to="/profile"
              className="text-sm font-semibold text-cyan-400 transition border-b-2 border-cyan-400 pb-0.5"
            >
              Profile
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-md">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 text-[0.7rem] font-bold text-brand-bg">
                {(user?.name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-slate-200">
                {userDisplayName}
              </span>
            </div>

            <Button variant="ghost" size="md" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-3xl px-4 pt-8 pb-16 sm:px-8">
        <div className="mb-8 border-b border-white/10 pb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1 text-xs font-semibold text-cyan-300 mb-3">
            <span>👤</span> Candidate Profile
          </div>
          <h1 className="font-sora text-3xl font-extrabold text-white">
            My Profile
          </h1>
          <p className="text-xs text-text-desc mt-1">
            Update your professional bio, experience level, and core skills to help employers match with you.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mt-16 flex flex-col items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent mb-4" />
            <p className="font-sora text-sm text-slate-300">Loading your profile...</p>
          </div>
        )}

        {!loading && (
          <div className="rounded-3xl border border-white/14 bg-white/[0.06] p-6 sm:p-9 shadow-2xl backdrop-blur-2xl animate-fade-in-up">
            {/* Account Info Read-Only Banner */}
            <div className="mb-6 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 font-sora text-xl font-bold text-brand-bg shadow-md">
                {(profileData?.name || user?.name || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="font-sora text-base font-bold text-white">
                  {profileData?.name || user?.name || 'Candidate'}
                </h3>
                <p className="text-xs text-text-secondary">
                  {profileData?.email || user?.email} · <span className="capitalize">{profileData?.role || user?.role || 'Job Seeker'}</span>
                </p>
              </div>
            </div>

            {/* Error Banner */}
            {generalError && (
              <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 animate-fade-in-up">
                {generalError}
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300 animate-fade-in-up">
                {successMessage}
              </div>
            )}

            {/* Profile Edit Form */}
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
              <Input
                label="Years of Experience"
                type="number"
                name="years_of_experience"
                min="0"
                max="60"
                value={formik.values.years_of_experience}
                onChange={(e) => {
                  if (successMessage) setSuccessMessage('')
                  formik.handleChange(e)
                }}
                onBlur={formik.handleBlur}
                error={formik.touched.years_of_experience && formik.errors.years_of_experience}
                placeholder="e.g. 5"
              />

              <SkillPicker
                label="Skills & Technologies"
                value={formik.values.skill_ids}
                onChange={(newSkillIds) => {
                  if (successMessage) setSuccessMessage('')
                  formik.setFieldValue('skill_ids', newSkillIds)
                }}
              />

              <div>
                <label className="block text-xs font-semibold text-text-desc mb-1.5">
                  Professional Bio
                </label>
                <textarea
                  rows={5}
                  name="bio"
                  value={formik.values.bio}
                  onChange={(e) => {
                    if (successMessage) setSuccessMessage('')
                    formik.handleChange(e)
                  }}
                  onBlur={formik.handleBlur}
                  placeholder="Tell employers about your background, key strengths, and career highlights..."
                  className="w-full rounded-xl border border-white/12 bg-white/[0.04] p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/50 transition-all duration-200"
                />
                {formik.touched.bio && formik.errors.bio && (
                  <p className="mt-1 text-[0.75rem] text-red-400 font-medium">
                    {formik.errors.bio}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-5">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={formik.isSubmitting}
                  className="btn-gradient-shimmer"
                >
                  Save Profile Changes →
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
