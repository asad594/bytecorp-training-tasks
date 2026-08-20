import axiosInstance from './axiosInstance'
import { APPLICATION_ENDPOINTS } from './endpoints'

export const getMyApplications = async () => {
  const response = await axiosInstance.get(APPLICATION_ENDPOINTS.BASE)
  return response.data
}

export const getCompanyApplications = async (jobId = null) => {
  const url = APPLICATION_ENDPOINTS.COMPANY_LIST(jobId)
  const response = await axiosInstance.get(url)
  return response.data
}

export const applyForJob = async (jobId, coverLetter = '') => {
  const response = await axiosInstance.post(APPLICATION_ENDPOINTS.BASE, {
    job: jobId,
    cover_letter: coverLetter,
  })
  return response.data
}

export const updateApplicationStatus = async (applicationId, status) => {
  const response = await axiosInstance.patch(
    APPLICATION_ENDPOINTS.DETAIL(applicationId),
    { status }
  )
  return response.data
}

export const withdrawApplication = async (applicationId) => {
  const response = await axiosInstance.delete(APPLICATION_ENDPOINTS.DETAIL(applicationId))
  return response.data
}