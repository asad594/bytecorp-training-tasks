import axiosInstance from './axiosInstance'
import { COMPANY_ENDPOINTS } from './endpoints'

export const getMyCompany = async () => {
  const response = await axiosInstance.get(COMPANY_ENDPOINTS.MY_COMPANY)
  return response.data
}

export const getCompany = async (id) => {
  const response = await axiosInstance.get(COMPANY_ENDPOINTS.DETAIL(id))
  return response.data
}

export const createCompany = async (companyData) => {
  const response = await axiosInstance.post(COMPANY_ENDPOINTS.BASE, companyData)
  return response.data
}

export const joinCompany = async (registrationNumber) => {
  const response = await axiosInstance.post(COMPANY_ENDPOINTS.JOIN, {
    registration_number: registrationNumber,
  })
  return response.data
}

export const getPendingCompanies = async () => {
  const response = await axiosInstance.get(COMPANY_ENDPOINTS.PENDING)
  return response.data
}

export const verifyCompany = async (id, isVerified = true) => {
  const response = await axiosInstance.patch(COMPANY_ENDPOINTS.VERIFY(id), {
    is_verified: isVerified,
  })
  return response.data
}