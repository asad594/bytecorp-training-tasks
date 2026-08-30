import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import queryKeys from './queryKeys'
import * as applicationsApi from '../api/applicationsApi'
import * as jobsApi from '../api/jobsApi'
import * as companiesApi from '../api/companiesApi'

// Query Hooks
export const useMyApplicationsQuery = (options = {}) => {
  return useQuery({
    // Caller options first — hook-defined queryKey/queryFn below must always win
    ...options,
    queryKey: queryKeys.applications.mine(),
    queryFn: () => applicationsApi.getMyApplications(),
  })
}

export const useCompanyApplicationsQuery = (jobId = null, options = {}) => {
  return useQuery({
    // Caller options first — hook-defined queryKey/queryFn below must always win
    ...options,
    queryKey: queryKeys.applications.company(jobId),
    queryFn: () => applicationsApi.getCompanyApplications(jobId),
  })
}

// Composite Query for Enriched Applications
export const useEnrichedMyApplicationsQuery = (options = {}) => {
  return useQuery({
    // Caller options first — hook-defined queryKey/queryFn below must always win
    ...options,
    queryKey: queryKeys.applications.mineEnriched(),
    queryFn: async () => {
      const rawApps = await applicationsApi.getMyApplications()
      if (!rawApps || rawApps.length === 0) {
        return []
      }

      const uniqueJobIds = [...new Set(rawApps.map((a) => a.job).filter(Boolean))]
      const jobsMap = {}
      const companyMap = {}

      await Promise.all(
        uniqueJobIds.map(async (jId) => {
          try {
            const jobData = await jobsApi.getJob(jId)
            jobsMap[jId] = jobData
            if (jobData?.company && !companyMap[jobData.company]) {
              try {
                const compData = await companiesApi.getCompany(jobData.company)
                companyMap[jobData.company] = compData?.name || 'Company'
              } catch {
                companyMap[jobData.company] = 'Company'
              }
            }
          } catch {
            jobsMap[jId] = { title: 'Applied Job', location: 'Remote' }
          }
        })
      )

      return rawApps.map((app) => {
        const job = jobsMap[app.job] || {}
        const companyName = companyMap[job.company] || 'Company'
        return {
          ...app,
          jobTitle: job.title || 'Applied Job',
          companyName,
          location: job.location || 'Remote',
          employmentType: job.employment_type || 'Full-time',
        }
      })
    },
  })
}

// Mutation Hooks
export const useApplyForJobMutation = (options = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    // Caller options first — hook-defined mutationFn/onSuccess below must always win
    ...options,
    mutationFn: ({ jobId, coverLetter = '', resume }) =>
      applicationsApi.applyForJob(jobId, coverLetter, resume),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.dashboard() })
      options.onSuccess?.(data, variables, context)
    },
  })
}

export const useUpdateApplicationStatusMutation = (options = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    // Caller options first — hook-defined mutationFn/onSuccess below must always win
    ...options,
    mutationFn: ({ applicationId, status }) =>
      applicationsApi.updateApplicationStatus(applicationId, status),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.dashboard() })
      options.onSuccess?.(data, variables, context)
    },
  })
}

export const useWithdrawApplicationMutation = (options = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    // Caller options first — hook-defined mutationFn/onSuccess below must always win
    ...options,
    mutationFn: (applicationId) =>
      applicationsApi.withdrawApplication(applicationId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.dashboard() })
      options.onSuccess?.(data, variables, context)
    },
  })
}
