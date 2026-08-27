import axiosInstance from './axiosInstance'
import { ADMIN_ENDPOINTS } from './endpoints'

export const getAdminStats = async () => {
  const response = await axiosInstance.get(ADMIN_ENDPOINTS.STATS)
  return response.data
}

export const getAdminUsers = async (role = null) => {
  const response = await axiosInstance.get(ADMIN_ENDPOINTS.USERS(role))
  return response.data
}
