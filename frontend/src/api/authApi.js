import axiosInstance from './axiosInstance'

export const login = async (role, { email, password }) => {
  const response = await axiosInstance.post(`/accounts/login/${role}/`, {
    email,
    password,
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
