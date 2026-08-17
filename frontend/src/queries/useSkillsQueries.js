import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import queryKeys from './queryKeys'
import * as skillsApi from '../api/skillsApi'

// Query Hooks
export const useSkillsQuery = (options = {}) => {
  return useQuery({
    // Caller options first — hook-defined queryKey/queryFn below must always win
    ...options,
    queryKey: queryKeys.skills.lists(),
    queryFn: () => skillsApi.getSkills(),
  })
}

export const useSkillQuery = (id, options = {}) => {
  return useQuery({
    // Caller options first — hook-defined queryKey/queryFn/enabled below must always win
    ...options,
    queryKey: queryKeys.skills.detail(id),
    queryFn: () => skillsApi.getSkill(id),
    enabled: Boolean(id),
  })
}

// Mutation Hooks
export const useCreateSkillMutation = (options = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    // Caller options first — hook-defined mutationFn/onSuccess below must always win
    ...options,
    mutationFn: (skillData) => skillsApi.createSkill(skillData),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skills.all })
      options.onSuccess?.(data, variables, context)
    },
  })
}

export const useUpdateSkillMutation = (options = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    // Caller options first — hook-defined mutationFn/onSuccess below must always win
    ...options,
    mutationFn: ({ id, skillData }) => skillsApi.updateSkill(id, skillData),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skills.all })
      options.onSuccess?.(data, variables, context)
    },
  })
}

export const useDeleteSkillMutation = (options = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    // Caller options first — hook-defined mutationFn/onSuccess below must always win
    ...options,
    mutationFn: (id) => skillsApi.deleteSkill(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skills.all })
      options.onSuccess?.(data, variables, context)
    },
  })
}
