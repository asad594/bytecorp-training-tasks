import axiosInstance from './axiosInstance'
import { AUTH_ENDPOINTS } from './endpoints'

export const login = async (role, { email, password }) => {
  const response = await axiosInstance.post(AUTH_ENDPOINTS.LOGIN(role), {
    email,
    password,
  })
  return response.data
}

export const register = async (role, userData) => {
  const response = await axiosInstance.post(AUTH_ENDPOINTS.REGISTER(role), userData)
  return response.data
}

export const forgotPassword = async (email) => {
  const response = await axiosInstance.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, {
    email,
  })
  return response.data
}

export const resetPassword = async ({ uid, token, new_password }) => {
  const response = await axiosInstance.post(AUTH_ENDPOINTS.RESET_PASSWORD, {
    uid,
    token,
    new_password,
  })
  return response.data
}

export const getProfile = async (token) => {
  const config = token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {}
  const response = await axiosInstance.get(AUTH_ENDPOINTS.PROFILE, config)
  return response.data
}

export const googleLogin = async (id_token) => {
  const response = await axiosInstance.post(AUTH_ENDPOINTS.AUTH_GOOGLE, {
    id_token,
  })
  return response.data
}

export const refreshAccessToken = async (refreshToken) => {
  const response = await axiosInstance.post(AUTH_ENDPOINTS.TOKEN_REFRESH, {
    refresh: refreshToken,
  })
  return response.data
}

export const logoutUser = async (refreshToken) => {
  if (!refreshToken) return null
  const response = await axiosInstance.post(AUTH_ENDPOINTS.LOGOUT, {
    refresh: refreshToken,
  })
  return response.data
}