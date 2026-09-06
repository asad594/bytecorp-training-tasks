import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'applicationId',
      type: 'number',
      admin: {
        description:
          'Django JobApplication ID this resume belongs to. Set automatically when synced from the job board — leave blank for anything uploaded manually here.',
      },
    },
  ],
  upload: true,
}
