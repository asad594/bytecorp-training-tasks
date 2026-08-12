import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-dark text-white">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-slate-400">Page not found.</p>
      <Link to="/login/job_seeker" className="mt-4 text-cyan-400 hover:underline">
        Go to sign in
      </Link>
    </div>
  )
}