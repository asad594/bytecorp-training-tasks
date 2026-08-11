import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor to attach Bearer token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jobboard_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor to handle 401 Unauthorized
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('jobboard_token')
      localStorage.removeItem('jobboard_user')
      const requestUrl = error.config?.url || ''
      const isAuthEndpoint =
        requestUrl.includes('/accounts/login') ||
        requestUrl.includes('/accounts/auth/google') ||
        requestUrl.includes('/accounts/register')
      const isAuthPage =
        window.location.pathname.startsWith('/login') ||
        window.location.pathname.startsWith('/register')

      if (!isAuthEndpoint && !isAuthPage) {
        window.location.href = '/login/job_seeker'
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
