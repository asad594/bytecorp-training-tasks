'use client'

import React from 'react'
import { ResourceTable, Badge } from '@/components/ResourceTable'

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
      titleIcon="🏢"
      endpoint="companies"
      getId={(c) => c.company_id}
      columns={[
        { label: 'Name', render: (c) => c.name, sortValue: (c) => c.name.toLowerCase() },
        {
          label: 'Registration #',
          render: (c) => c.registration_number || '—',
          sortValue: (c) => (c.registration_number || '').toLowerCase(),
        },
        { label: 'Location', render: (c) => c.location || '—', sortValue: (c) => (c.location || '').toLowerCase() },
        {
          label: 'Verified',
          render: (c) => <Badge text={c.is_verified ? 'Verified' : 'Pending'} />,
          sortValue: (c) => (c.is_verified ? 1 : 0),
        },
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
