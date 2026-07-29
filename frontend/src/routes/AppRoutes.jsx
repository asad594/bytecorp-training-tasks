import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from '../pages/LandingPage'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import ForgotPassword from '../pages/auth/ForgotPassword'
import ResetPassword from '../pages/auth/ResetPassword'
import NotFound from '../pages/NotFound'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<LandingPage />} />
      <Route path="/login" element={<Navigate to="/login/job_seeker" replace />} />
      <Route path="/login/:role" element={<Login />} />
      <Route path="/register" element={<Navigate to="/register/job_seeker" replace />} />
      <Route path="/register/:role" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
