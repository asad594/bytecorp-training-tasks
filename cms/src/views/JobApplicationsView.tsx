'use client'

import React from 'react'
import { ResourceTable } from '@/components/ResourceTable'

type JobApplication = {
  application_id: number
  applicant_name: string | null
  applicant_email: string | null
  job_title: string | null
  status: string
  resume: string | null
  created_at: string
}

export function JobApplicationsView() {
  return (
    <ResourceTable<JobApplication>
      title="Job Applications"
      endpoint="job-applications"
      getId={(a) => a.application_id}
      columns={[
        { label: 'Applicant', render: (a) => a.applicant_name || '—' },
        { label: 'Email', render: (a) => a.applicant_email || '—' },
        { label: 'Job', render: (a) => a.job_title || '—' },
        { label: 'Status', render: (a) => a.status },
        {
          label: 'Resume',
          render: (a) =>
            a.resume ? (
              <a href={a.resume} target="_blank" rel="noopener noreferrer">
                View
              </a>
            ) : (
              '—'
            ),
        },
        {
          label: 'Applied',
          render: (a) => (a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'),
        },
      ]}
      actions={[
        {
          label: () => 'Delete',
          confirm: 'Delete this application? This cannot be undone.',
          onClick: async (a) => {
            const res = await fetch(`/api/django-proxy/job-applications/${a.application_id}`, {
              method: 'DELETE',
            })
            if (!res.ok) {
              console.error('Delete application failed:', res.status, await res.text())
            }
            return res.ok
          },
        },
      ]}
    />
  )
}
