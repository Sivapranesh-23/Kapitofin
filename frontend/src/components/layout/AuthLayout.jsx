import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Outlet />
    </div>
  )
}
