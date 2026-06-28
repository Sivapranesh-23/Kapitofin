import { useNavigate, useLocation } from 'react-router-dom'
import { Bell, Sun, Moon, LogOut, User, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import useAuthStore from '../../store/authStore'
import useUIStore from '../../store/uiStore'
import { roleLabels } from '../../lib/utils'

export default function Topbar() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const darkMode = useUIStore((s) => s.darkMode)
  const toggleDarkMode = useUIStore((s) => s.toggleDarkMode)
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Breadcrumb from path
  const crumbs = location.pathname.split('/').filter(Boolean).map((s) => s.charAt(0).toUpperCase() + s.slice(1))

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400">Home</span>
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="text-gray-400">/</span>
            <span className={i === crumbs.length - 1 ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}>
              {c}
            </span>
          </span>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <Bell size={20} className="text-gray-500 dark:text-gray-400" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800" />
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-500" />}
        </button>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                {roleLabels[user?.role] || user?.role}
              </p>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 animate-fade-in">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.email}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.departmentName} {user?.regionName ? `· ${user.regionName}` : ''}
                </p>
              </div>
              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                <User size={16} /> Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
