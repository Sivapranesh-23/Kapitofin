import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Wallet, ClipboardCheck, Receipt, ArrowLeftRight,
  BarChart3, Settings, Users, Building2, Shield, ChevronLeft, ChevronRight,
  AlertTriangle
} from 'lucide-react'
import useUIStore from '../../store/uiStore'
import useAuthStore from '../../store/authStore'
import { can } from '../../lib/permissions'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, minRole: 'EMPLOYEE' },
  { path: '/budgets', label: 'Budgets', icon: Wallet, minRole: 'EMPLOYEE' },
  { path: '/approvals', label: 'Approvals', icon: ClipboardCheck, minRole: 'DEPARTMENT_HEAD' },
  { path: '/expenses', label: 'Expenses', icon: Receipt, minRole: 'EMPLOYEE' },
  { path: '/transfers', label: 'Transfers', icon: ArrowLeftRight, minRole: 'DEPARTMENT_HEAD' },
  { path: '/reports', label: 'Reports', icon: BarChart3, minRole: 'BUDGET_ANALYST' },
  { path: '/alerts', label: 'Alerts', icon: AlertTriangle, minRole: 'EMPLOYEE' },
  { path: '/admin', label: 'Admin Panel', icon: Settings, minRole: 'FINANCE_DIRECTOR' },
  { path: '/users', label: 'Users', icon: Users, minRole: 'SUPER_ADMIN' },
]

export default function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const user = useAuthStore((s) => s.user)

  const visibleItems = navItems.filter((item) => can(user?.role, 'canViewBudgets') || can(user?.role, 'canManageUsers'))

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        z-30 transition-all duration-300 flex flex-col ${collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
          <Shield size={18} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-gray-900 dark:text-white text-sm whitespace-nowrap">
            Kapitofin
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {visibleItems
          .filter((item) => {
            // Show items the user's role permits
            if (item.minRole === 'EMPLOYEE') return true
            if (item.minRole === 'FINANCE_DIRECTOR') return can(user?.role, 'canManageOrg')
            if (item.minRole === 'SUPER_ADMIN') return can(user?.role, 'canManageUsers')
            return true
          })
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : 'text-gray-600 dark:text-gray-400'}`
              }
            >
              <item.icon size={20} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center h-12 border-t border-gray-200 dark:border-gray-700
          hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  )
}
