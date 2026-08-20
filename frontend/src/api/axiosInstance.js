import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1'

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

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

const handleAuthRedirect = () => {
  let userRole = 'job_seeker'
  try {
    const savedUser = localStorage.getItem('jobboard_user')
    if (savedUser) {
      const parsed = JSON.parse(savedUser)
      if (parsed?.role) userRole = parsed.role
    }
  } catch (e) {
    console.error('Failed to read user role before session expiry redirect:', e)
  }

  localStorage.removeItem('jobboard_token')
  localStorage.removeItem('jobboard_refresh')
  localStorage.removeItem('jobboard_user')

  const isAuthPage =
    window.location.pathname.startsWith('/login') ||
    window.location.pathname.startsWith('/register')

  if (!isAuthPage) {
    const targetRole = ['job_seeker', 'company_rep', 'admin'].includes(userRole)
      ? userRole
      : 'job_seeker'
    window.location.href = `/login/${targetRole}`
  }
}

// Response Interceptor to handle silent token refresh and 401 redirects
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error)
    }

    const requestUrl = originalRequest.url || ''
    const isAuthEndpoint =
      requestUrl.includes('/accounts/login') ||
      requestUrl.includes('/accounts/auth/google') ||
      requestUrl.includes('/accounts/register') ||
      requestUrl.includes('/accounts/token/refresh') ||
      requestUrl.includes('/accounts/password/')

    if (isAuthEndpoint || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return axiosInstance(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    const refreshToken = localStorage.getItem('jobboard_refresh')

    if (!refreshToken) {
      processQueue(error, null)
      handleAuthRedirect()
      isRefreshing = false
      return Promise.reject(error)
    }

    try {
      const refreshUrl = `${baseURL.replace(/\/+$/, '')}/accounts/token/refresh/`
      const response = await axios.post(refreshUrl, {
        refresh: refreshToken,
      })

      const { access, refresh: newRefresh } = response.data
      localStorage.setItem('jobboard_token', access)
      if (newRefresh) {
        localStorage.setItem('jobboard_refresh', newRefresh)
      }

      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access}`
      originalRequest.headers.Authorization = `Bearer ${access}`

      processQueue(null, access)
      return axiosInstance(originalRequest)
    } catch (refreshErr) {
      processQueue(refreshErr, null)
      handleAuthRedirect()
      return Promise.reject(refreshErr)
    } finally {
      isRefreshing = false
    }
  }
)

export default axiosInstance