import { Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from './components/layout/AuthLayout'
import AppLayout from './components/layout/AppLayout'
import Login from './features/auth/Login'
import Dashboard from './features/dashboard/Dashboard'
import Budgets from './features/budgets/Budgets'
import BudgetDetail from './features/budgets/BudgetDetail'
import Approvals from './features/approvals/Approvals'
import Expenses from './features/expenses/Expenses'
import Transfers from './features/transfers/Transfers'
import Reports from './features/reports/Reports'
import Alerts from './features/alerts/Alerts'
import Admin from './features/admin/Admin'
import Users from './features/users/Users'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/budgets/:id" element={<BudgetDetail />} />
        <Route path="/approvals" element={<Approvals />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/transfers" element={<Transfers />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/users" element={<Users />} />
      </Route>
    </Routes>
  )
}
