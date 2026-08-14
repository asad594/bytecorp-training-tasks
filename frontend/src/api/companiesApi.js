import axiosInstance from './axiosInstance'

export const getMyCompany = async () => {
  const response = await axiosInstance.get('/companies/me/')
  return response.data
}

export const getCompany = async (id) => {
  const response = await axiosInstance.get(`/companies/${id}/`)
  return response.data
}

export const createCompany = async (companyData) => {
  const response = await axiosInstance.post('/companies/', companyData)
  return response.data
}

export const joinCompany = async (registrationNumber) => {
  const response = await axiosInstance.post('/companies/join/', {
    registration_number: registrationNumber,
  })
  return response.data
}
