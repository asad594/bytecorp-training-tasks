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

  return (
    <div>
      <div style={{ padding: 'var(--base)', paddingBottom: 0, display: 'flex', gap: 8 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New skill name"
          style={{ padding: 8 }}
        />
        <button className="btn btn--style-primary" type="button" onClick={addSkill}>
          Add skill
        </button>
      </div>
      {error && <p style={{ color: 'var(--theme-error-500)', padding: '0 var(--base)' }}>{error}</p>}
      <ResourceTable<Skill>
        key={refreshKey}
        title="Skills"
        endpoint="skills"
        getId={(s) => s.skill_id}
        columns={[{ label: 'Name', render: (s) => s.name }]}
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
    </div>
  )
}
