'use client'

import React from 'react'
import { ResourceTable } from '@/components/ResourceTable'

type Job = {
  job_id: number
  title: string
  company: number
  location: string | null
  employment_type: string
  status: string
}

export function JobsView() {
  return (
    <ResourceTable<Job>
      title="Jobs"
      endpoint="jobs"
      getId={(j) => j.job_id}
      columns={[
        { label: 'Title', render: (j) => j.title },
        { label: 'Company ID', render: (j) => j.company },
        { label: 'Location', render: (j) => j.location || '—' },
        { label: 'Type', render: (j) => j.employment_type },
        { label: 'Status', render: (j) => j.status },
      ]}
      actions={[
        {
          label: (j) => (j.status === 'closed' ? 'Reopen' : 'Close'),
          onClick: async (j) => {
            const res = await fetch(`/api/django-proxy/jobs/${j.job_id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: j.status === 'closed' ? 'open' : 'closed' }),
            })
            if (!res.ok) {
              console.error('Close/Reopen job failed:', res.status, await res.text())
            }
            return res.ok
          },
        },
        {
          label: () => 'Delete',
          confirm: 'Delete this job? This cannot be undone.',
          onClick: async (j) => {
            const res = await fetch(`/api/django-proxy/jobs/${j.job_id}`, { method: 'DELETE' })
            if (!res.ok) {
              console.error('Delete job failed:', res.status, await res.text())
            }
            return res.ok
          },
        },
      ]}
    />
  )
}
