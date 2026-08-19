import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import queryKeys from './queryKeys'
import * as authApi from '../api/authApi'

// Query Hooks
export const useProfileQuery = (token, options = {}) => {
  return useQuery({
    // Caller options first — hook-defined queryKey/queryFn/enabled below must always win
    ...options,
    queryKey: queryKeys.auth.profile(),
    queryFn: () => authApi.getProfile(token),
    enabled: Boolean(token),
  })
}

// Mutation Hooks
export const useLoginMutation = (options = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    // Caller options first — hook-defined mutationFn/onSuccess below must always win
    ...options,
    mutationFn: ({ role, credentials }) => authApi.login(role, credentials),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all })
      options.onSuccess?.(data, variables, context)
    },
  })
}

export const useRegisterMutation = (options = {}) => {
  return useMutation({
    // Caller options first — hook-defined mutationFn below must always win
    ...options,
    mutationFn: ({ role, userData }) => authApi.register(role, userData),
  })
}

export const useForgotPasswordMutation = (options = {}) => {
  return useMutation({
    // Caller options first — hook-defined mutationFn below must always win
    ...options,
    mutationFn: (email) => authApi.forgotPassword(email),
  })
}

export const useResetPasswordMutation = (options = {}) => {
  return useMutation({
    // Caller options first — hook-defined mutationFn below must always win
    ...options,
    mutationFn: ({ uid, token, new_password }) =>
      authApi.resetPassword({ uid, token, new_password }),
  })
}

export const useGoogleLoginMutation = (options = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    // Caller options first — hook-defined mutationFn/onSuccess below must always win
    ...options,
    mutationFn: (id_token) => authApi.googleLogin(id_token),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all })
      options.onSuccess?.(data, variables, context)
    },
  })
}
