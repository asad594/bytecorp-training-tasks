export const queryKeys = {
  auth: {
    all: ['auth'],
    profile: () => ['auth', 'profile'],
  },
  jobs: {
    all: ['jobs'],
    lists: () => ['jobs', 'list'],
    list: (filters = {}) => ['jobs', 'list', filters],
    enrichedList: (filters = {}) => ['jobs', 'enriched-list', filters],
    details: () => ['jobs', 'detail'],
    detail: (id) => ['jobs', 'detail', id],
    detailEnriched: (id) => ['jobs', 'detail-enriched', id],
    companyJobs: (companyId) => ['jobs', 'company', companyId],
  },
  companies: {
    all: ['companies'],
    mine: () => ['companies', 'me'],
    details: () => ['companies', 'detail'],
    detail: (id) => ['companies', 'detail', id],
    dashboard: () => ['companies', 'dashboard'],
  },
  applications: {
    all: ['applications'],
    mine: () => ['applications', 'mine'],
    mineEnriched: () => ['applications', 'mine-enriched'],
    company: (jobId = null) => ['applications', 'company', { jobId }],
  },
  skills: {
    all: ['skills'],
    lists: () => ['skills', 'list'],
    detail: (id) => ['skills', 'detail', id],
  },
  admin: {
    all: ['admin'],
    stats: () => ['admin', 'stats'],
    users: (role = null) => ['admin', 'users', { role }],
  },
}

export default queryKeys

