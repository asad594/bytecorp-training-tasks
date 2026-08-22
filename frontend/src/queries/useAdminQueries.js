import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import queryKeys from './queryKeys'
import * as adminApi from '../api/adminApi'
import * as authApi from '../api/authApi'

// Query Hooks
export const useAdminStatsQuery = (options = {}) => {
  return useQuery({
    // Caller options first — hook-defined queryKey/queryFn below must always win
    ...options,
    queryKey: queryKeys.admin.stats(),
    queryFn: () => adminApi.getAdminStats(),
  })
}

export const useAdminUsersQuery = (role = null, options = {}) => {
  return useQuery({
    // Caller options first — hook-defined queryKey/queryFn below must always win
    ...options,
    queryKey: queryKeys.admin.users(role),
    queryFn: () => adminApi.getAdminUsers(role),
  })
}

// Mutation Hooks
export const useCreateAdminMutation = (options = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    // Caller options first — hook-defined mutationFn/onSuccess below must always win
    ...options,
    mutationFn: (adminData) => authApi.createAdmin(adminData),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all })
      options.onSuccess?.(data, variables, context)
    },
  })
}
