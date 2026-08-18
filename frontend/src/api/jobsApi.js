import axiosInstance from './axiosInstance'

export const getJobs = async (companyId = null) => {
  const url = companyId ? `/jobs/?company=${companyId}` : '/jobs/'
  const response = await axiosInstance.get(url)
  return response.data
}

export const getJob = async (id) => {
  const response = await axiosInstance.get(`/jobs/${id}/`)
  return response.data
}

export const getCompanyJobs = async (companyId) => {
  const response = await axiosInstance.get(`/jobs/?company=${companyId}`)
  return response.data
}

export const createJob = async (jobData) => {
  const response = await axiosInstance.post('/jobs/', jobData)
  return response.data
}

export const updateJob = async (id, jobData) => {
  const response = await axiosInstance.patch(`/jobs/${id}/`, jobData)
  return response.data
}

export const deleteJob = async (id) => {
  const response = await axiosInstance.delete(`/jobs/${id}/`)
  return response.data
}
