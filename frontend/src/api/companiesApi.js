import axiosInstance from './axiosInstance'

export const getCompany = async (id) => {
  const response = await axiosInstance.get(`/companies/${id}/`)
  return response.data
}
