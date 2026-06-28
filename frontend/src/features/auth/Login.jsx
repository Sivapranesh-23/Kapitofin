import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Mail, Lock, LogIn, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { authApi } from '../../api/endpoints'
import useAuthStore from '../../store/authStore'
import { roleLabels } from '../../lib/utils'

const demoAccounts = [
  { email: 'jane.employee@budget.com', label: 'Employee', color: 'bg-gray-500' },
  { email: 'john.analyst@budget.com', label: 'Budget Analyst', color: 'bg-blue-500' },
  { email: 'mike.head@budget.com', label: 'Department Head', color: 'bg-green-500' },
  { email: 'sarah.regional@budget.com', label: 'Regional Finance', color: 'bg-purple-500' },
  { email: 'cathy.director@budget.com', label: 'Finance Director', color: 'bg-orange-500' },
  { email: 'admin@budget.com', label: 'Super Admin', color: 'bg-red-500' },
]

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [email, setEmail] = useState('john.analyst@budget.com')
  const [password, setPassword] = useState('password')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e, emailOverride, passwordOverride) => {
    e?.preventDefault()
    const loginEmail = emailOverride || email
    const loginPassword = passwordOverride || password

    setLoading(true)
    try {
      const { data } = await authApi.login(loginEmail, loginPassword)
      login(data.token, data.user)
      toast.success(`Welcome back, ${data.user.firstName}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = (demoEmail) => {
    handleLogin(null, demoEmail, 'password')
  }

  return (
    <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 p-6">
      {/* Left — Branding */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden md:flex flex-col justify-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center mb-6">
          <Shield size={32} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Kapitofin
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Plan, draft, approve, and monitor budgets across your entire organization — with
          multi-level approval workflows and real-time spend tracking.
        </p>

        <div className="space-y-3">
          {[
            'Multi-level approval workflows',
            'Real-time budget utilization tracking',
            'Role-based access control',
            'Comprehensive reports & audit logs',
          ].map((feat, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
              {feat}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Right — Login form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Sign In</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Enter your credentials or pick a demo role below.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                placeholder="you@budget.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn size={18} /> Sign In
              </span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Quick demo login (password: password)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                onClick={() => quickLogin(acc.email)}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                  hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left group"
              >
                <span className={`w-2 h-2 rounded-full ${acc.color} flex-shrink-0`} />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{acc.label}</span>
                <ArrowRight size={12} className="text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
