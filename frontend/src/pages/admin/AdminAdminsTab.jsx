import { useState } from 'react'
import { Formik, Form } from 'formik'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Input from '../../components/common/Input'
import { useAdminUsersQuery, useCreateAdminMutation } from '../../queries/useAdminQueries'
import adminCreateSchema from '../../schemas/adminCreateSchema'

export default function AdminAdminsTab() {
  const { data: admins = [], isLoading, isError, error, refetch, isFetching } = useAdminUsersQuery('admin')
  const createAdminMutation = useCreateAdminMutation()

  const [successMessage, setSuccessMessage] = useState(null)
  const [formBackendError, setFormBackendError] = useState(null)

  const handleCreateAdmin = async (values, { resetForm }) => {
    setFormBackendError(null)
    setSuccessMessage(null)

    createAdminMutation.mutate(
      {
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      },
      {
        onSuccess: (data) => {
          setSuccessMessage(`Administrator account for "${data.name}" (${data.email}) created successfully!`)
          resetForm()
        },
        onError: (err) => {
          // Check for validation errors in response
          const resData = err.response?.data
          let errorMsg = 'Failed to create administrator account.'

          if (resData) {
            if (typeof resData === 'string') {
              errorMsg = resData
            } else if (resData.email) {
              errorMsg = Array.isArray(resData.email) ? resData.email[0] : resData.email
            } else if (resData.password) {
              errorMsg = Array.isArray(resData.password) ? resData.password.join(' ') : resData.password
            } else if (resData.name) {
              errorMsg = Array.isArray(resData.name) ? resData.name[0] : resData.name
            } else if (resData.detail) {
              errorMsg = resData.detail
            } else if (resData.message) {
              errorMsg = resData.message
            }
          }
          setFormBackendError(errorMsg)
        },
      }
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Header Banner */}
      <div className="rounded-2xl border border-white/14 bg-white/[0.06] p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 mb-3">
              <span>🛡️</span> Access & Security
            </div>
            <h1 className="font-sora text-2xl font-extrabold text-white sm:text-3xl">
              Administrator Management
            </h1>
            <p className="mt-1 text-xs text-text-secondary sm:text-sm">
              View active system administrators and provision new privileged admin accounts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={() => refetch()}
              isLoading={isFetching}
            >
              Refresh Admins
            </Button>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-200 flex items-center justify-between">
          <span>✓ {successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-300 hover:text-white font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Backend Error Banner */}
      {formBackendError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-center justify-between">
          <span>⚠️ {formBackendError}</span>
          <button
            onClick={() => setFormBackendError(null)}
            className="text-rose-300 hover:text-white font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Provision New Admin Form */}
        <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-lg backdrop-blur-xl h-fit">
          <div className="flex items-center gap-2.5 mb-2 border-b border-white/10 pb-4">
            <span className="text-xl">➕</span>
            <div>
              <h3 className="font-sora text-base font-bold text-white">
                Create Admin Account
              </h3>
              <p className="text-[11px] text-text-secondary">
                Grants full platform administration privileges.
              </p>
            </div>
          </div>

          <Formik
            initialValues={{ name: '', email: '', password: '' }}
            validationSchema={adminCreateSchema}
            onSubmit={handleCreateAdmin}
          >
            {({ values, errors, touched, handleChange, handleBlur }) => (
              <Form className="mt-4 flex flex-col gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name && errors.name}
                  required
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="e.g. alex.admin@jobboard.com"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && errors.email}
                  required
                />

                <Input
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="Min 8 chars, Aa1@..."
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password && errors.password}
                  required
                />

                <div className="mt-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 text-[11px] text-slate-400 space-y-1">
                  <p className="font-semibold text-indigo-300">Password Requirements:</p>
                  <p>• At least 8 characters</p>
                  <p>• Uppercase and lowercase letters</p>
                  <p>• At least one number and special symbol</p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={createAdminMutation.isPending}
                  className="w-full justify-center mt-2"
                >
                  Create Admin Account
                </Button>
              </Form>
            )}
          </Formik>
        </div>

        {/* Existing Admin Accounts List */}
        <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <div>
              <h3 className="font-sora text-base font-bold text-white">
                Active Administrators ({admins.length})
              </h3>
              <p className="text-[11px] text-text-secondary">
                Personnel authorized with administrative access
              </p>
            </div>
            <Badge variant="emerald" size="sm">
              {admins.length} Active
            </Badge>
          </div>

          {/* Loading */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-cyan-400 border-t-transparent mb-3" />
              <p className="text-xs text-slate-300">Loading administrators...</p>
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
              ⚠️ {error?.response?.data?.detail || error?.message || 'Failed to load admin list.'}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {admins.map((admin) => {
                const joinDate = admin.created_at
                  ? new Date(admin.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'N/A'

                return (
                  <div
                    key={admin.user_id}
                    className="group relative flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] p-4 transition hover:border-indigo-400/40 hover:bg-white/[0.06]"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-cyan-500 font-sora text-base font-bold text-brand-bg shadow-[0_0_12px_rgba(99,102,241,0.3)]">
                        {(admin.name || admin.email || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-sora text-sm font-bold text-white group-hover:text-cyan-300 transition">
                            {admin.name}
                          </h4>
                          <Badge variant="emerald" size="sm">Admin</Badge>
                        </div>
                        <p className="font-mono text-xs text-cyan-accent mt-0.5">
                          {admin.email}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[11px] text-text-secondary">
                        Provisioned: <span className="text-white">{joinDate}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">ID #{admin.user_id}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
