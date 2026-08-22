import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import queryKeys from './queryKeys'
import * as jobsApi from '../api/jobsApi'
import * as companiesApi from '../api/companiesApi'
import { formatRelativeTime, formatSalary } from '../utils/formatters'

const LOGO_BG_PALETTE = [
  'from-cyan-400 to-blue-500',
  'from-indigo-400 to-purple-600',
  'from-emerald-400 to-teal-600',
  'from-amber-400 to-orange-500',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-teal-400',
  'from-indigo-500 to-cyan-500',
  'from-red-500 to-purple-600',
]

// Basic Query Hooks
export const useJobsQuery = (companyId = null, options = {}) => {
  return useQuery({
    // Caller options first — hook-defined queryKey/queryFn below must always win
    ...options,
    queryKey: queryKeys.jobs.list({ companyId }),
    queryFn: () => jobsApi.getJobs(companyId),
  })
}

export const useJobQuery = (id, options = {}) => {
  return useQuery({
    // Caller options first — hook-defined queryKey/queryFn/enabled below must always win
    ...options,
    queryKey: queryKeys.jobs.detail(id),
    queryFn: () => jobsApi.getJob(id),
    enabled: Boolean(id),
  })
}

export const useCompanyJobsQuery = (companyId, options = {}) => {
  return useQuery({
    // Caller options first — hook-defined queryKey/queryFn/enabled below must always win
    ...options,
    queryKey: queryKeys.jobs.companyJobs(companyId),
    queryFn: () => jobsApi.getCompanyJobs(companyId),
    enabled: Boolean(companyId),
  })
}

// Composite Query Hooks (Enriched Data)
export const useEnrichedJobsQuery = (options = {}) => {
  return useQuery({
    // Caller options first — hook-defined queryKey/queryFn below must always win
    ...options,
    queryKey: queryKeys.jobs.enrichedList(),
    queryFn: async () => {
      const rawJobs = await jobsApi.getJobs()
      const uniqueCompanyIds = [
        ...new Set((rawJobs || []).map((j) => j.company).filter(Boolean)),
      ]

      const companyMap = {}
      await Promise.all(
        uniqueCompanyIds.map(async (id) => {
          try {
            const companyData = await companiesApi.getCompany(id)
            companyMap[id] = companyData?.name || 'Company'
          } catch {
            companyMap[id] = 'Company'
          }
        })
      )

      return (rawJobs || []).map((job) => {
        const companyName = companyMap[job.company] || 'Company'
        const rawType = (job.employment_type || '').toLowerCase()

        let displayType = 'Full-time'
        if (rawType === 'part-time') displayType = 'Part-time'
        else if (rawType === 'contract') displayType = 'Contract'
        else if (rawType === 'full-time') displayType = 'Full-time'
        else if (job.employment_type) displayType = job.employment_type

        const logoBg =
          LOGO_BG_PALETTE[(job.job_id || 0) % LOGO_BG_PALETTE.length]
        const logoLetter = (companyName[0] || 'C').toUpperCase()

        return {
          id: job.job_id,
          title: job.title || 'Untitled Role',
          company: companyName,
          location: job.location || 'Remote',
          description: job.description || '',
          salary: formatSalary(job.salary_min, job.salary_max),
          posted: formatRelativeTime(job.created_at),
          type: displayType,
          rawType: rawType,
          tags: [
            displayType,
            job.location,
            ...(job.skills || []).map((s) => s.name),
          ].filter(Boolean),
          requirements: (job.skills || []).map((s) => s.name),
          logoLetter,
          logoBg,
        }
      })
    },
  })
}

export const useEnrichedJobDetailQuery = (id, options = {}) => {
  return useQuery({
    // Caller options first — hook-defined queryKey/queryFn/enabled below must always win
    ...options,
    queryKey: queryKeys.jobs.detailEnriched(id),
    queryFn: async () => {
      const jobData = await jobsApi.getJob(id)
      let compData = null
      if (jobData?.company) {
        try {
          compData = await companiesApi.getCompany(jobData.company)
        } catch {
          compData = { name: 'Company' }
        }
      }
      return {
        job: jobData,
        company: compData,
      }
    },
    enabled: Boolean(id),
  })
}

// Mutation Hooks
export const useCreateJobMutation = (options = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    // Caller options first — hook-defined mutationFn/onSuccess below must always win
    ...options,
    mutationFn: (jobData) => jobsApi.createJob(jobData),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.dashboard() })
      options.onSuccess?.(data, variables, context)
    },
  })
}

export const useUpdateJobMutation = (options = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    // Caller options first — hook-defined mutationFn/onSuccess below must always win
    ...options,
    mutationFn: ({ id, data }) => jobsApi.updateJob(id, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.dashboard() })
      options.onSuccess?.(data, variables, context)
    },
  })
}

export const useDeleteJobMutation = (options = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    // Caller options first — hook-defined mutationFn/onSuccess below must always win
    ...options,
    mutationFn: (id) => jobsApi.deleteJob(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.dashboard() })
      options.onSuccess?.(data, variables, context)
    },
  })
}
