import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      afterNavLinks: ['/components/AfterNavLinks/index.js#AfterNavLinks'],
      views: {
        JobBoardJobs: {
          Component: '/views/JobsView.js#JobsView',
          path: '/job-board/jobs',
        },
        JobBoardCompanies: {
          Component: '/views/CompaniesView.js#CompaniesView',
          path: '/job-board/companies',
        },
        JobBoardUsers: {
          Component: '/views/UsersView.js#UsersView',
          path: '/job-board/users',
        },
        JobBoardSkills: {
          Component: '/views/SkillsView.js#SkillsView',
          path: '/job-board/skills',
        },
        JobBoardApplications: {
          Component: '/views/JobApplicationsView.js#JobApplicationsView',
          path: '/job-board/applications',
        },
      },
    },
  },
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
