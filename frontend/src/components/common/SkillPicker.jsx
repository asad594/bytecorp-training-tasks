import { useState, useRef, useEffect } from 'react'
import Badge from './Badge'
import { useSkillsQuery } from '../../queries/useSkillsQueries'

export default function SkillPicker({
  value = [],
  onChange,
  label = 'Skills',
  containerClassName = '',
  placeholder = 'Type to search skills...',
  disabled = false,
}) {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  const { data: skills = [], isLoading } = useSkillsQuery()

  // Ensure value is always an array of numbers
  const selectedIds = Array.isArray(value) ? value : []

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter skills based on search term
  const availableSkills = skills.filter((skill) => {
    const matchesSearch = (skill.name || '')
      .toLowerCase()
      .includes(search.toLowerCase().trim())
    return matchesSearch
  })

  const selectedSkills = skills.filter((skill) =>
    selectedIds.includes(skill.skill_id)
  )

  const handleSelectSkill = (skillId) => {
    if (!selectedIds.includes(skillId)) {
      const next = [...selectedIds, skillId]
      onChange?.(next)
    }
    setSearch('')
    inputRef.current?.focus()
  }

  const handleRemoveSkill = (skillId, e) => {
    e?.stopPropagation()
    const next = selectedIds.filter((id) => id !== skillId)
    onChange?.(next)
  }

  return (
    <div
      ref={dropdownRef}
      className={`relative flex flex-col gap-1.5 w-full ${containerClassName}`}
    >
      {label && (
        <label className="text-xs font-semibold text-text-desc flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[0.7rem] text-slate-500 font-normal">
            {selectedIds.length} selected
          </span>
        </label>
      )}

      {/* Selected skill badges */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1">
          {selectedSkills.map((skill) => (
            <Badge
              key={skill.skill_id}
              variant="cyan"
              size="sm"
              className="group/badge pl-2.5 pr-1.5 py-0.5 inline-flex items-center gap-1.5 transition duration-150"
            >
              <span>{skill.name}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => handleRemoveSkill(skill.skill_id, e)}
                  className="rounded-full p-0.5 text-cyan-300 hover:bg-cyan-500/20 hover:text-white transition cursor-pointer"
                  title={`Remove ${skill.name}`}
                  aria-label={`Remove ${skill.name}`}
                >
                  <span className="text-xs leading-none font-bold">×</span>
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Search Input Box */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={search}
          disabled={disabled}
          onChange={(e) => {
            setSearch(e.target.value)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedSkills.length > 0 ? 'Add more skills...' : placeholder}
          className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/50 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Dropdown menu */}
      {isOpen && !disabled && (
        <div className="absolute top-[100%] left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-white/14 bg-brand-card p-1.5 shadow-2xl backdrop-blur-2xl animate-fade-in-up">
          {isLoading ? (
            <div className="p-3 text-center text-xs text-slate-400">
              Loading skills...
            </div>
          ) : availableSkills.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-400">
              {search ? `No skills matching "${search}"` : 'No skills available'}
            </div>
          ) : (
            availableSkills.map((skill) => {
              const isSelected = selectedIds.includes(skill.skill_id)
              return (
                <button
                  key={skill.skill_id}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      handleRemoveSkill(skill.skill_id)
                    } else {
                      handleSelectSkill(skill.skill_id)
                    }
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{skill.name}</span>
                  {isSelected ? (
                    <span className="text-cyan-400 font-bold">✓</span>
                  ) : (
                    <span className="text-slate-500 text-[0.7rem]">+ Add</span>
                  )}
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
