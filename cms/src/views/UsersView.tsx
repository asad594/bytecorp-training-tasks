'use client'

import React from 'react'
import { ResourceTable, Badge } from '@/components/ResourceTable'

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
      titleIcon="👤"
      endpoint="accounts/admin/users"
      getId={(u) => u.user_id}
      columns={[
        { label: 'Name', render: (u) => u.name, sortValue: (u) => u.name.toLowerCase() },
        { label: 'Email', render: (u) => u.email, sortValue: (u) => u.email.toLowerCase() },
        { label: 'Role', render: (u) => u.role, sortValue: (u) => u.role },
        {
          label: 'Status',
          render: (u) => <Badge text={u.is_banned ? 'Banned' : 'Active'} />,
          sortValue: (u) => (u.is_banned ? 1 : 0),
        },
      ]}
      editFields={[
        { name: 'name', label: 'Name', type: 'text', required: true, getValue: (u) => u.name },
        { name: 'email', label: 'Email', type: 'text', required: true, getValue: (u) => u.email },
        {
          name: 'role',
          label: 'Role',
          type: 'select',
          options: [
            { label: 'Job Seeker', value: 'job_seeker' },
            { label: 'Company Representative', value: 'company_rep' },
            { label: 'Admin', value: 'admin' },
          ],
          getValue: (u) => u.role,
        },
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
