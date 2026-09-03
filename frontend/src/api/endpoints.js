/**
 * Central registry of all API endpoints used in the frontend.
 * Matches backend `config/endpoints.py` route fragments.
 */

export const AUTH_ENDPOINTS = {
  LOGIN: (role) => `/accounts/login/${role}/`,
  REGISTER: (role) => `/accounts/register/${role}/`,
  FORGOT_PASSWORD: '/accounts/password/forgot/',
  RESET_PASSWORD: '/accounts/password/reset/',
  PROFILE: '/accounts/profile/',
  AUTH_GOOGLE: '/accounts/auth/google/',
  LOGOUT: '/accounts/logout/',
  TOKEN_REFRESH: '/accounts/token/refresh/',
  ADMIN_CREATE: '/accounts/admin/create/',
}

export const COMPANY_ENDPOINTS = {
  BASE: '/companies/',
  MY_COMPANY: '/companies/me/',
  JOIN: '/companies/join/',
  PENDING: '/companies/pending/',
  VERIFY: (id) => `/companies/${id}/verify/`,
  DETAIL: (id) => `/companies/${id}/`,
}


export const JOB_ENDPOINTS = {
  BASE: '/jobs/',
  DETAIL: (id) => `/jobs/${id}/`,
  BY_COMPANY: (companyId) => (companyId ? `/jobs/?company=${companyId}` : '/jobs/'),
}

export const APPLICATION_ENDPOINTS = {
  BASE: '/job-applications/',
  COMPANY_LIST: (jobId = null) =>
    jobId ? `/job-applications/company/?job_id=${jobId}` : '/job-applications/company/',
  DETAIL: (id) => `/job-applications/${id}/`,
}

export const SKILL_ENDPOINTS = {
  BASE: '/skills/',
  DETAIL: (id) => `/skills/${id}/`,
}

export const ADMIN_ENDPOINTS = {
  STATS: '/accounts/admin/stats/',
  USERS: (role) => (role ? `/accounts/admin/users/?role=${role}` : '/accounts/admin/users/'),
  USER_DETAIL: (userId) => `/accounts/admin/users/${userId}/`,
  USER_BAN: (userId) => `/accounts/admin/users/${userId}/ban/`,
}


export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  COMPANIES: COMPANY_ENDPOINTS,
  JOBS: JOB_ENDPOINTS,
  APPLICATIONS: APPLICATION_ENDPOINTS,
  SKILLS: SKILL_ENDPOINTS,
  ADMIN: ADMIN_ENDPOINTS,
}

export default API_ENDPOINTS

