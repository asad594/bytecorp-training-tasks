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

export const updateAdminUser = async (userId, data) => {
  const response = await axiosInstance.patch(ADMIN_ENDPOINTS.USER_DETAIL(userId), data)
  return response.data
}

export const deleteAdminUser = async (userId) => {
  await axiosInstance.delete(ADMIN_ENDPOINTS.USER_DETAIL(userId))
  return userId
}

export const setAdminUserBanStatus = async (userId, isBanned) => {
  const response = await axiosInstance.patch(ADMIN_ENDPOINTS.USER_BAN(userId), { is_banned: isBanned })
  return response.data
}
