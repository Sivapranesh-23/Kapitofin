import { Outlet, Navigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import useUIStore from '../../store/uiStore'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useEffect } from 'react'

export default function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const initDarkMode = useUIStore((s) => s.initDarkMode)
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)

  useEffect(() => { initDarkMode() }, [])

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div
        className="flex-1 flex flex-col transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '4rem' : '16rem' }}
      >
        <Topbar />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
