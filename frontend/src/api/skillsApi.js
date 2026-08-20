import axiosInstance from './axiosInstance'
import { SKILL_ENDPOINTS } from './endpoints'

export const getSkills = async () => {
  const response = await axiosInstance.get(SKILL_ENDPOINTS.BASE)
  return response.data
}

export const getSkill = async (id) => {
  const response = await axiosInstance.get(SKILL_ENDPOINTS.DETAIL(id))
  return response.data
}

export const createSkill = async (skillData) => {
  const response = await axiosInstance.post(SKILL_ENDPOINTS.BASE, skillData)
  return response.data
}

export const updateSkill = async (id, skillData) => {
  const response = await axiosInstance.patch(SKILL_ENDPOINTS.DETAIL(id), skillData)
  return response.data
}

export const deleteSkill = async (id) => {
  const response = await axiosInstance.delete(SKILL_ENDPOINTS.DETAIL(id))
  return response.data
}