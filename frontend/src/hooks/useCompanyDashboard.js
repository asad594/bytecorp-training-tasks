import {
  useCompanyDashboardDataQuery,
  useCreateCompanyMutation,
  useJoinCompanyMutation,
} from '../queries/useCompaniesQueries'
import {
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
} from '../queries/useJobsQueries'
import { useUpdateApplicationStatusMutation } from '../queries/useApplicationsQueries'

export default function useCompanyDashboard() {
  const {
    data,
    isLoading,
    error: queryError,
    refetch,
  } = useCompanyDashboardDataQuery()

  const company = data?.company || null
  const jobs = data?.jobs || []
  const applications = data?.applications || []
  const loading = isLoading
  const error = queryError
    ? queryError.response?.data?.detail ||
      queryError.response?.data?.message ||
      'Failed to load company dashboard data. Please try again.'
    : null

  const createCompanyMutation = useCreateCompanyMutation()
  const joinCompanyMutation = useJoinCompanyMutation()
  const createJobMutation = useCreateJobMutation()
  const updateJobMutation = useUpdateJobMutation()
  const deleteJobMutation = useDeleteJobMutation()
  const updateApplicationStatusMutation = useUpdateApplicationStatusMutation()

  const actionLoading =
    createCompanyMutation.isPending ||
    joinCompanyMutation.isPending ||
    createJobMutation.isPending

  const createCompany = async (companyData) => {
    try {
      const res = await createCompanyMutation.mutateAsync(companyData)
      return { success: true, message: res.message }
    } catch (err) {
      const errMsg =
        err.response?.data?.registration_number?.[0] ||
        err.response?.data?.name?.[0] ||
        err.response?.data?.detail ||
        'Failed to register company.'
      return { success: false, error: errMsg }
    }
  }

  const joinCompany = async (registrationNumber) => {
    try {
      const res = await joinCompanyMutation.mutateAsync(registrationNumber)
      return { success: true, message: res.message }
    } catch (err) {
      const errMsg =
        err.response?.data?.registration_number ||
        err.response?.data?.detail ||
        'Failed to join company.'
      return { success: false, error: errMsg }
    }
  }

  const createJob = async (jobData) => {
    if (!company) return { success: false, error: 'No company associated.' }
    try {
      const newJob = await createJobMutation.mutateAsync({
        ...jobData,
        company: company.company_id,
      })
      return { success: true, job: newJob }
    } catch (err) {
      const errMsg =
        err.response?.data?.detail ||
        err.response?.data?.title?.[0] ||
        err.response?.data?.salary_max?.[0] ||
        'Failed to create job.'
      return { success: false, error: errMsg }
    }
  }

  const updateJobStatus = async (jobId, newStatus) => {
    try {
      const updated = await updateJobMutation.mutateAsync({
        id: jobId,
        data: { status: newStatus },
      })
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
      await deleteJobMutation.mutateAsync(jobId)
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
      const updated = await updateApplicationStatusMutation.mutateAsync({
        applicationId,
        status: newStatus,
      })
      return { success: true, application: updated }
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.detail || 'Failed to update applicant status.',
      }
    }
  }

  // Calculated Stats
  const totalJobs = jobs.length
  const activeJobs = jobs.filter((j) => j.status === 'open').length
  const totalApplicants = applications.length
  const pendingApplicants = applications.filter(
    (a) => a.status === 'pending'
  ).length

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
    refetch,
    createCompany,
    joinCompany,
    createJob,
    updateJobStatus,
    deleteJob,
    updateApplicationStatus,
  }
}
