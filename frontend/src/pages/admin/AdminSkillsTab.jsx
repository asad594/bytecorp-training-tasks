import { useState } from 'react'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import {

  useSkillsQuery,
  useCreateSkillMutation,
  useUpdateSkillMutation,
  useDeleteSkillMutation,
} from '../../queries/useSkillsQueries'

export default function AdminSkillsTab() {
  const { data: skills = [], isLoading, isError, error, refetch, isFetching } = useSkillsQuery()
  const createSkillMutation = useCreateSkillMutation()
  const updateSkillMutation = useUpdateSkillMutation()
  const deleteSkillMutation = useDeleteSkillMutation()

  const [newSkillName, setNewSkillName] = useState('')
  const [editingSkillId, setEditingSkillId] = useState(null)
  const [editSkillName, setEditSkillName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingSkillId, setDeletingSkillId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [formError, setFormError] = useState(null)

  const handleCreateSkill = (e) => {
    e.preventDefault()
    setFormError(null)
    setSuccessMessage(null)

    const trimmed = newSkillName.trim()
    if (!trimmed) {
      setFormError('Skill name is required.')
      return
    }
    if (trimmed.length > 50) {
      setFormError('Skill name cannot exceed 50 characters.')
      return
    }

    createSkillMutation.mutate(
      { name: trimmed },
      {
        onSuccess: (data) => {
          setSuccessMessage(`Skill "${data.name}" was added successfully!`)
          setNewSkillName('')
        },
        onError: (err) => {
          const msg =
            err.response?.data?.name?.[0] ||
            err.response?.data?.detail ||
            err.response?.data?.message ||
            'Failed to add skill.'
          setFormError(msg)
        },
      }
    )
  }

  const startEditing = (skill) => {
    setEditingSkillId(skill.skill_id)
    setEditSkillName(skill.name)
    setFormError(null)
    setSuccessMessage(null)
  }

  const cancelEditing = () => {
    setEditingSkillId(null)
    setEditSkillName('')
  }

  const handleUpdateSkill = (skillId) => {
    setFormError(null)
    setSuccessMessage(null)

    const trimmed = editSkillName.trim()
    if (!trimmed) {
      setFormError('Skill name cannot be empty.')
      return
    }
    if (trimmed.length > 50) {
      setFormError('Skill name cannot exceed 50 characters.')
      return
    }

    updateSkillMutation.mutate(
      { id: skillId, skillData: { name: trimmed } },
      {
        onSuccess: (data) => {
          setSuccessMessage(`Skill renamed to "${data.name}" successfully!`)
          setEditingSkillId(null)
          setEditSkillName('')
        },
        onError: (err) => {
          const msg =
            err.response?.data?.name?.[0] ||
            err.response?.data?.detail ||
            err.response?.data?.message ||
            'Failed to rename skill.'
          setFormError(msg)
        },
      }
    )
  }

  const handleDeleteSkill = (skillId, skillName) => {
    setFormError(null)
    setSuccessMessage(null)
    setDeletingSkillId(skillId)

    deleteSkillMutation.mutate(skillId, {
      onSuccess: () => {
        setSuccessMessage(`Skill "${skillName}" was removed successfully!`)
        setConfirmDeleteId(null)
        setDeletingSkillId(null)
      },
      onError: (err) => {
        const msg =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          'Failed to delete skill.'
        setFormError(msg)
        setDeletingSkillId(null)
      },
    })
  }

  const filteredSkills = skills.filter((skill) =>
    skill.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Header Banner */}
      <div className="rounded-2xl border border-white/14 bg-white/[0.06] p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1 text-xs font-semibold text-cyan-300 mb-3">
              <span>⚡</span> Taxonomy & Skills
            </div>
            <h1 className="font-sora text-2xl font-extrabold text-white sm:text-3xl">
              Skills Library
            </h1>
            <p className="mt-1 text-xs text-text-secondary sm:text-sm">
              Manage platform-wide skill tags used by candidates in profiles and employers on job listings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={() => refetch()}
              isLoading={isFetching}
            >
              Refresh
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

      {/* Error Banner */}
      {(formError || isError) && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-center justify-between">
          <span>⚠️ {formError || error?.response?.data?.detail || error?.message || 'An error occurred.'}</span>
          <button
            onClick={() => setFormError(null)}
            className="text-rose-300 hover:text-white font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Add New Skill Card */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-lg backdrop-blur-xl">
        <h3 className="font-sora text-base font-bold text-white mb-3 flex items-center gap-2">
          <span>➕</span> Add New Skill Tag
        </h3>
        <form onSubmit={handleCreateSkill} className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            placeholder="e.g. TypeScript, GraphQL, Kubernetes..."
            maxLength={50}
            className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-500 transition focus:border-cyan-400/60 focus:outline-none"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={createSkillMutation.isPending}
            className="whitespace-nowrap w-full sm:w-auto"
          >
            Add Skill
          </Button>
        </form>
      </div>

      {/* Skills Search & List */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-lg backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <h3 className="font-sora text-base font-bold text-white">
              Standard Skills ({skills.length})
            </h3>
            {searchQuery && (
              <Badge variant="cyan" size="sm">
                {filteredSkills.length} matches
              </Badge>
            )}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter skills..."
              className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-xs text-white placeholder-slate-500 transition focus:border-cyan-400/60 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-cyan-400 border-t-transparent mb-3" />
            <p className="text-xs text-slate-300">Loading skills library...</p>
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="rounded-xl border border-white/6 bg-white/[0.02] p-10 text-center">
            <span className="text-3xl">⚡</span>
            <p className="mt-2 text-xs text-text-secondary">
              {searchQuery ? `No skills matching "${searchQuery}".` : 'No skills found in the database.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredSkills.map((skill) => {
              const isEditing = editingSkillId === skill.skill_id
              const isDeleting = deletingSkillId === skill.skill_id
              const isConfirming = confirmDeleteId === skill.skill_id

              if (isEditing) {
                return (
                  <div
                    key={skill.skill_id}
                    className="flex flex-col gap-2 rounded-xl border border-cyan-400/50 bg-cyan-500/10 p-3 shadow-md backdrop-blur-md animate-fade-in-up"
                  >
                    <input
                      type="text"
                      value={editSkillName}
                      onChange={(e) => setEditSkillName(e.target.value)}
                      maxLength={50}
                      autoFocus
                      className="w-full rounded-lg border border-cyan-400/40 bg-slate-900/80 px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={cancelEditing}
                        className="px-2.5 py-1 rounded-md text-[11px] text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateSkill(skill.skill_id)}
                        disabled={updateSkillMutation.isPending}
                        className="px-2.5 py-1 rounded-md text-[11px] font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition cursor-pointer disabled:opacity-50"
                      >
                        {updateSkillMutation.isPending ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                )
              }

              return (
                <div
                  key={skill.skill_id}
                  className="group relative flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] p-3 transition hover:border-cyan-400/30 hover:bg-white/[0.06]"
                >
                  <div className="flex items-center gap-2 overflow-hidden mr-2">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
                    <span className="font-semibold text-xs text-white truncate" title={skill.name}>
                      {skill.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition">
                    {isConfirming ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteSkill(skill.skill_id, skill.name)}
                          disabled={isDeleting}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white hover:bg-rose-600 transition cursor-pointer disabled:opacity-50"
                        >
                          {isDeleting ? '...' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-1.5 py-0.5 rounded text-[10px] text-slate-300 hover:text-white transition cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(skill)}
                          title="Rename skill"
                          className="p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/10 transition cursor-pointer text-xs"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(skill.skill_id)}
                          title="Delete skill"
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer text-xs"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
