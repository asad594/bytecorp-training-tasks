'use client'

import React, { useState } from 'react'
import { ResourceTable } from '@/components/ResourceTable'

type Skill = {
  skill_id: number
  name: string
}

export function SkillsView() {
  const [name, setName] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const addSkill = async () => {
    if (!name.trim()) return
    setError(null)
    const res = await fetch('/api/django-proxy/skills', {
      method: 'POST',
      body: JSON.stringify({ name: name.trim() }),
    })
    if (res.ok) {
      setName('')
      setRefreshKey((k) => k + 1)
    } else {
      setError(`Failed to add (${res.status})`)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') addSkill()
  }

  return (
    <ResourceTable<Skill>
      key={refreshKey}
      title="Skills"
      titleIcon="🏷️"
      endpoint="skills"
      getId={(s) => s.skill_id}
      toolbarExtra={
        <div className="skills-add">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="New skill name"
            className="skills-add__input"
          />
          <button className="btn btn--style-primary" type="button" onClick={addSkill}>
            Add skill
          </button>
          {error && <span className="skills-add__error">{error}</span>}
          <style>{`
            .skills-add {
              display: flex;
              align-items: center;
              gap: 8px;
              flex-wrap: wrap;
            }
            .skills-add__input {
              padding: 7px 10px;
              border-radius: 6px;
              border: 1px solid var(--theme-elevation-150);
              background: var(--theme-input-bg, var(--theme-elevation-0));
              color: inherit;
              font-size: 13px;
              min-width: 160px;
            }
            .skills-add__input:focus {
              outline: none;
              border-color: var(--theme-success-500, #4f46e5);
            }
            .skills-add__error {
              color: var(--theme-error-500);
              font-size: 12.5px;
            }
          `}</style>
        </div>
      }
      columns={[{ label: 'Name', render: (s) => s.name, sortValue: (s) => s.name.toLowerCase() }]}
      actions={[
        {
          label: () => 'Delete',
          confirm: 'Delete this skill?',
          onClick: async (s) => {
            const res = await fetch(`/api/django-proxy/skills/${s.skill_id}`, {
              method: 'DELETE',
            })
            return res.ok
          },
        },
      ]}
    />
  )
}
