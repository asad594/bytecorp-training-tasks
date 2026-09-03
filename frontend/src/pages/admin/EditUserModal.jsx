import { useState } from 'react'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { useUpdateAdminUserMutation } from '../../queries/useAdminQueries'

export default function EditUserModal({ user, onClose }) {
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    bio: user.bio || '',
    years_of_experience: user.years_of_experience ?? 0,
  })
  const [formError, setFormError] = useState('')

  const { mutate: updateUser, isPending } = useUpdateAdminUserMutation({
    onSuccess: () => onClose(),
    onError: (err) => {
      const data = err?.response?.data
      const message =
        (data && (data.email?.[0] || data.name?.[0] || data.detail)) ||
        err?.message ||
        'Failed to update user.'
      setFormError(message)
    },
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormError('')
    updateUser({
      userId: user.user_id,
      data: {
        name: form.name.trim(),
        email: form.email.trim(),
        bio: form.bio.trim(),
        years_of_experience: user.role === 'job_seeker' ? Number(form.years_of_experience) || 0 : undefined,
      },
    })
  }

  return (
    <Modal isOpen onClose={onClose} title="Edit User" subtitle={`ID #${user.user_id}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {formError && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            ⚠️ {formError}
          </div>
        )}

        <Input
          label="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <Input
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        {user.role === 'job_seeker' && (
          <Input
            label="Years of Experience"
            type="number"
            name="years_of_experience"
            min="0"
            value={form.years_of_experience}
            onChange={handleChange}
          />
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-desc">Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:border-cyan-400/60"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" size="md" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  )
}