import axiosInstance from './axiosInstance'
import { JOB_ENDPOINTS } from './endpoints'

export const getJobs = async (companyId = null) => {
  const url = JOB_ENDPOINTS.BY_COMPANY(companyId)
  const response = await axiosInstance.get(url)
  return response.data
}

export const getJob = async (id) => {
  const response = await axiosInstance.get(JOB_ENDPOINTS.DETAIL(id))
  return response.data
}

export const getCompanyJobs = async (companyId) => {
  const response = await axiosInstance.get(JOB_ENDPOINTS.BY_COMPANY(companyId))
  return response.data
}

export const createJob = async (jobData) => {
  const response = await axiosInstance.post(JOB_ENDPOINTS.BASE, jobData)
  return response.data
}

export const updateJob = async (id, jobData) => {
  const response = await axiosInstance.patch(JOB_ENDPOINTS.DETAIL(id), jobData)
  return response.data
}

export const deleteJob = async (id) => {
  const response = await axiosInstance.delete(JOB_ENDPOINTS.DETAIL(id))
  return response.data
}