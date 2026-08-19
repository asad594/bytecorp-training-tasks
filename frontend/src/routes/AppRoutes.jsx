import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from '../pages/LandingPage'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import ForgotPassword from '../pages/auth/ForgotPassword'
import ResetPassword from '../pages/auth/ResetPassword'
import NotFound from '../pages/NotFound'
import ProtectedRoute from './ProtectedRoute'

// Page Imports for Protected Routes
import CompanyDashboard from '../pages/company/CompanyDashboard'
import AdminCompanies from '../pages/admin/AdminCompanies'
import JobsList from '../pages/jobs/JobsList'
import JobDetail from '../pages/jobs/JobDetail'
import MyApplications from '../pages/applications/MyApplications'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<LandingPage />} />
      <Route path="/login" element={<Navigate to="/login/job_seeker" replace />} />
      <Route path="/login/:role" element={<Login />} />
      <Route path="/register" element={<Navigate to="/register/job_seeker" replace />} />
      <Route path="/register/:role" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Routes Wired with ProtectedRoute */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['company_rep']}>
            <CompanyDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/companies"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminCompanies />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={<Navigate to="/admin/companies" replace />}
      />

      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <JobsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs/:id"
        element={
          <ProtectedRoute>
            <JobDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications"
        element={
          <ProtectedRoute allowedRoles={['job_seeker']}>
            <MyApplications />
          </ProtectedRoute>
        }
      />

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}