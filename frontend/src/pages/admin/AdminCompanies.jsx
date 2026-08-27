import AdminDashboard from './AdminDashboard'

/**
 * Backward compatibility wrapper for /admin/companies.
 * Renders the unified AdminDashboard with the companies tab active.
 */
export default function AdminCompanies() {
  return <AdminDashboard defaultTab="companies" />
}
