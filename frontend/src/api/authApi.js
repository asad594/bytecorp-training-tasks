import axiosInstance from './axiosInstance'

export const login = async (role, { email, password }) => {
  const response = await axiosInstance.post(`/accounts/login/${role}/`, {
    email,
    password,
  })
  return response.data
}

export const register = async (role, userData) => {
  const response = await axiosInstance.post(`/accounts/register/${role}/`, userData)
  return response.data
}

export const forgotPassword = async (email) => {
  const response = await axiosInstance.post('/accounts/password/forgot/', {
    email,
  })
  return response.data
}

export const resetPassword = async ({ uid, token, new_password }) => {
  const response = await axiosInstance.post('/accounts/password/reset/', {
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
  const response = await axiosInstance.get('/accounts/profile/', config)
  return response.data
}

export const googleLogin = async (id_token) => {
  const response = await axiosInstance.post('/accounts/auth/google/', {
    id_token,
  })
  return response.data
}
