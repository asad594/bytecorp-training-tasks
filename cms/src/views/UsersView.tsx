'use client'

import React from 'react'
import { ResourceTable } from '@/components/ResourceTable'

type JobBoardUser = {
  user_id: number
  name: string
  email: string
  role: string
  is_banned: boolean
}

export function UsersView() {
  return (
    <ResourceTable<JobBoardUser>
      title="Users"
      endpoint="accounts/admin/users"
      getId={(u) => u.user_id}
      columns={[
        { label: 'Name', render: (u) => u.name },
        { label: 'Email', render: (u) => u.email },
        { label: 'Role', render: (u) => u.role },
        { label: 'Status', render: (u) => (u.is_banned ? 'Banned' : 'Active') },
      ]}
      actions={[
        {
          label: (u) => (u.is_banned ? 'Unban' : 'Ban'),
          confirm: 'Are you sure?',
          onClick: async (u) => {
            const res = await fetch(`/api/django-proxy/accounts/admin/users/${u.user_id}/ban`, {
              method: 'PATCH',
              body: JSON.stringify({ is_banned: !u.is_banned }),
            })
            return res.ok
          },
        },
      ]}
    />
  )
}
