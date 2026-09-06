import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    // Lets a user generate an API key (Users -> edit a user -> "Enable API
    // Key") that Django uses to authenticate its resume-sync calls to the
    // Media collection. Regular admin-panel login is unaffected.
    useAPIKey: true,
  },
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
  versions: false,
}
