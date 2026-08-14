import axiosInstance from './axiosInstance'

export const getMyApplications = async () => {
  const response = await axiosInstance.get('/job-applications/')
  return response.data
}

export const getCompanyApplications = async (jobId = null) => {
  const url = jobId
    ? `/job-applications/company/?job_id=${jobId}`
    : '/job-applications/company/'
  const response = await axiosInstance.get(url)
  return response.data
}

export const applyForJob = async (jobId, coverLetter = '') => {
  const response = await axiosInstance.post('/job-applications/', {
    job: jobId,
    cover_letter: coverLetter,
  })
  return response.data
}

export const updateApplicationStatus = async (applicationId, status) => {
  const response = await axiosInstance.patch(
    `/job-applications/${applicationId}/`,
    { status }
  )
  return response.data
}

export const withdrawApplication = async (applicationId) => {
  const response = await axiosInstance.delete(`/job-applications/${applicationId}/`)
  return response.data
}