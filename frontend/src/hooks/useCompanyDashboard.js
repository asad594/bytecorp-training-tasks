import { useState, useEffect, useCallback } from 'react'
import * as companiesApi from '../api/companiesApi'
import * as jobsApi from '../api/jobsApi'
import * as applicationsApi from '../api/applicationsApi'

export default function useCompanyDashboard() {
  // TODO(react-query): Hand-rolled loading/error/fetch state is a candidate for TanStack Query migration.
  const [company, setCompany] = useState(null)
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const companyRes = await companiesApi.getMyCompany()
      const myCompany = companyRes.company

      if (myCompany && myCompany.company_id) {
        setCompany(myCompany)
        const [jobsRes, appsRes] = await Promise.all([
          jobsApi.getCompanyJobs(myCompany.company_id),
          applicationsApi.getCompanyApplications(),
        ])
        setJobs(jobsRes || [])
        setApplications(appsRes || [])
      } else {
        setCompany(null)
        setJobs([])
        setApplications([])
      }
    } catch (err) {
      console.error('Error loading company dashboard data:', err)
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          'Failed to load company dashboard data. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const createCompany = async (companyData) => {
    setActionLoading(true)
    try {
      const res = await companiesApi.createCompany(companyData)
      await fetchDashboardData()
      return { success: true, message: res.message }
    } catch (err) {
      const errMsg =
        err.response?.data?.registration_number?.[0] ||
        err.response?.data?.name?.[0] ||
        err.response?.data?.detail ||
        'Failed to register company.'
      return { success: false, error: errMsg }
    } finally {
      setActionLoading(false)
    }
  }

  const joinCompany = async (registrationNumber) => {
    setActionLoading(true)
    try {
      const res = await companiesApi.joinCompany(registrationNumber)
      await fetchDashboardData()
      return { success: true, message: res.message }
    } catch (err) {
      const errMsg =
        err.response?.data?.registration_number ||
        err.response?.data?.detail ||
        'Failed to join company.'
      return { success: false, error: errMsg }
    } finally {
      setActionLoading(false)
    }
  }

  const createJob = async (jobData) => {
    if (!company) return { success: false, error: 'No company associated.' }
    setActionLoading(true)
    try {
      const newJob = await jobsApi.createJob({
        ...jobData,
        company: company.company_id,
      })
      setJobs((prev) => [newJob, ...prev])
      return { success: true, job: newJob }
    } catch (err) {
      const errMsg =
        err.response?.data?.detail ||
        err.response?.data?.title?.[0] ||
        err.response?.data?.salary_max?.[0] ||
        'Failed to create job.'
      return { success: false, error: errMsg }
    } finally {
      setActionLoading(false)
    }
  }

  const updateJobStatus = async (jobId, newStatus) => {
    try {
      const updated = await jobsApi.updateJob(jobId, { status: newStatus })
      setJobs((prev) =>
        prev.map((j) => (j.job_id === jobId ? { ...j, status: newStatus } : j))
      )
      return { success: true, job: updated }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || 'Failed to update job status.',
      }
    }
  }

  const deleteJob = async (jobId) => {
    try {
      await jobsApi.deleteJob(jobId)
      setJobs((prev) => prev.filter((j) => j.job_id !== jobId))
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || 'Failed to delete job.',
      }
    }
  }

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const updated = await applicationsApi.updateApplicationStatus(
        applicationId,
        newStatus
      )
      setApplications((prev) =>
        prev.map((app) =>
          app.application_id === applicationId
            ? { ...app, status: newStatus }
            : app
        )
      )
      return { success: true, application: updated }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || 'Failed to update applicant status.',
      }
    }
  }

  // Calculated Stats
  const totalJobs = jobs.length
  const activeJobs = jobs.filter((j) => j.status === 'open').length
  const totalApplicants = applications.length
  const pendingApplicants = applications.filter((a) => a.status === 'pending').length

  return {
    company,
    jobs,
    applications,
    loading,
    error,
    actionLoading,
    stats: {
      totalJobs,
      activeJobs,
      totalApplicants,
      pendingApplicants,
    },
    refetch: fetchDashboardData,
    createCompany,
    joinCompany,
    createJob,
    updateJobStatus,
    deleteJob,
    updateApplicationStatus,
  }
}
