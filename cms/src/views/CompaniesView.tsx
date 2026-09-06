'use client'

import React from 'react'
import { ResourceTable } from '@/components/ResourceTable'

type Company = {
  company_id: number
  name: string
  registration_number: string | null
  location: string | null
  is_verified: boolean
}

export function CompaniesView() {
  return (
    <ResourceTable<Company>
      title="Companies"
      endpoint="companies"
      getId={(c) => c.company_id}
      columns={[
        { label: 'Name', render: (c) => c.name },
        { label: 'Registration #', render: (c) => c.registration_number || '—' },
        { label: 'Location', render: (c) => c.location || '—' },
        { label: 'Verified', render: (c) => (c.is_verified ? 'Yes' : 'Pending') },
      ]}
      actions={[
        {
          label: (c) => (c.is_verified ? 'Unverify' : 'Verify'),
          onClick: async (c) => {
            const res = await fetch(`/api/django-proxy/companies/${c.company_id}/verify`, {
              method: 'PATCH',
              body: JSON.stringify({ is_verified: !c.is_verified }),
            })
            return res.ok
          },
        },
      ]}
    />
  )
}
