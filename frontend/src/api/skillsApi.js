import axiosInstance from './axiosInstance'

export const getSkills = async () => {
  const response = await axiosInstance.get('/skills/')
  return response.data
}

export const getSkill = async (id) => {
  const response = await axiosInstance.get(`/skills/${id}/`)
  return response.data
}

export const createSkill = async (skillData) => {
  const response = await axiosInstance.post('/skills/', skillData)
  return response.data
}

export const updateSkill = async (id, skillData) => {
  const response = await axiosInstance.patch(`/skills/${id}/`, skillData)
  return response.data
}

export const deleteSkill = async (id) => {
  const response = await axiosInstance.delete(`/skills/${id}/`)
  return response.data
}
