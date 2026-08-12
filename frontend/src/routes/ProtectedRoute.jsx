import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function ProtectedRoute({ allowedRoles = [], children }) {
  // Wired useAuth custom hook for authentication & role checking
  const { isAuthenticated, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-bg text-cyan-400 font-bold">
        Loading...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login/job_seeker" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />
  }

  return children ? children : <Outlet />
}
