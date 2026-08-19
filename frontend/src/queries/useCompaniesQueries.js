import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import queryKeys from './queryKeys'
import * as companiesApi from '../api/companiesApi'
import * as jobsApi from '../api/jobsApi'
import * as applicationsApi from '../api/applicationsApi'

// Query Hooks
export const useMyCompanyQuery = (options = {}) => {
  return useQuery({
    // Caller options first — hook-defined queryKey/queryFn below must always win
    ...options,
    queryKey: queryKeys.companies.mine(),
    queryFn: () => companiesApi.getMyCompany(),
  })
}

export const useCompanyQuery = (id, options = {}) => {
  return useQuery({
    // Caller options first — hook-defined queryKey/queryFn/enabled below must always win
    ...options,
    queryKey: queryKeys.companies.detail(id),
    queryFn: () => companiesApi.getCompany(id),
    enabled: Boolean(id),
  })
}

// Composite Query for Company Dashboard
export const useCompanyDashboardDataQuery = (options = {}) => {
  return useQuery({
    // Caller options first — hook-defined queryKey/queryFn below must always win
    ...options,
    queryKey: queryKeys.companies.dashboard(),
    queryFn: async () => {
      const companyRes = await companiesApi.getMyCompany()
      const myCompany = companyRes?.company

      if (myCompany && myCompany.company_id) {
        const [jobsRes, appsRes] = await Promise.all([
          jobsApi.getCompanyJobs(myCompany.company_id),
          applicationsApi.getCompanyApplications(),
        ])
        return {
          company: myCompany,
          jobs: jobsRes || [],
          applications: appsRes || [],
        }
      }

      return {
        company: null,
        jobs: [],
        applications: [],
      }
    },
  })
}

// Mutation Hooks
export const useCreateCompanyMutation = (options = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    // Caller options first — hook-defined mutationFn/onSuccess below must always win
    ...options,
    mutationFn: (companyData) => companiesApi.createCompany(companyData),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.dashboard() })
      options.onSuccess?.(data, variables, context)
    },
  })
}

export const useJoinCompanyMutation = (options = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    // Caller options first — hook-defined mutationFn/onSuccess below must always win
    ...options,
    mutationFn: (registrationNumber) => companiesApi.joinCompany(registrationNumber),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.dashboard() })
      options.onSuccess?.(data, variables, context)
    },
  })
}
