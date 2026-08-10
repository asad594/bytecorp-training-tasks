import axiosInstance from './axiosInstance'

export const getJobs = async () => {
  const response = await axiosInstance.get('/jobs/')
  return response.data
}
