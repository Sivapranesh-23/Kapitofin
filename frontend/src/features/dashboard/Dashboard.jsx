import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend
} from 'recharts'
import {
  Wallet, TrendingDown, Clock, CheckCircle2, ArrowUpRight, ArrowDownRight,
  AlertTriangle, FileText, DollarSign
} from 'lucide-react'
import { reportsApi } from '../../api/endpoints'
import { Card, CardSkeleton } from '../../components/ui'
import { formatCurrency, formatPercent } from '../../lib/utils'
import { Link } from 'react-router-dom'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#6366F1']

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await reportsApi.dashboard()).data,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  const d = data
  const utilization = Number(d.overallUtilizationPct || 0)
  const donutData = [
    { name: 'Spent', value: Number(d.totalSpent || 0) },
    { name: 'Committed', value: Number(d.totalCommitted || 0) },
    { name: 'Remaining', value: Number(d.totalRemaining || 0) },
  ]

  const deptData = (d.departmentBudgets || []).map((dep) => ({
    name: dep.departmentName,
    Budget: Number(dep.totalBudget),
    Spent: Number(dep.spent),
  }))

  const kpis = [
    {
      label: 'Total Budget', value: formatCurrency(d.totalBudget), icon: Wallet,
      color: 'blue', trend: '+12.5%', trendUp: true,
    },
    {
      label: 'Total Spent', value: formatCurrency(d.totalSpent), icon: TrendingDown,
      color: 'red', trend: `${formatPercent(utilization)} used`, trendUp: false,
    },
    {
      label: 'Committed', value: formatCurrency(d.totalCommitted), icon: Clock,
      color: 'yellow', trend: 'pending', trendUp: null,
    },
    {
      label: 'Remaining', value: formatCurrency(d.totalRemaining), icon: CheckCircle2,
      color: 'green', trend: `${100 - utilization.toFixed(1)}% left`, trendUp: true,
    },
  ]

  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Overview of your budget portfolio</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="relative overflow-hidden">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[kpi.color]}`}>
                  <kpi.icon size={20} />
                </div>
                {kpi.trend && (
                  <span className={`flex items-center gap-1 text-xs font-medium ${
                    kpi.trendUp === true ? 'text-green-600' : kpi.trendUp === false ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {kpi.trendUp === true && <ArrowUpRight size={12} />}
                    {kpi.trendUp === false && <ArrowDownRight size={12} />}
                    {kpi.trend}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{kpi.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Donut: utilization */}
        <Card>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Budget Utilization</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {donutData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {donutData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                </span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Bar: budget vs spent by department */}
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Budget vs Spent by Department</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Budget" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Spent" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom row: status counts + alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status counts */}
        <Card>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Budget Status</h3>
          <div className="space-y-3">
            <Link to="/budgets?status=DRAFT" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <span className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <FileText size={16} className="text-gray-500" />
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Drafts</span>
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{d.draftBudgets}</span>
            </Link>
            <Link to="/approvals" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <span className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Clock size={16} className="text-blue-500" />
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pending Approvals</span>
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{d.pendingApprovals}</span>
            </Link>
            <Link to="/budgets?status=APPROVED" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <span className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-green-500" />
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Approved</span>
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{d.approvedBudgets}</span>
            </Link>
          </div>
        </Card>

        {/* Recent alerts */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Alerts</h3>
            <Link to="/alerts" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          {d.recentAlerts?.length === 0 ? (
            <div className="text-center py-6 text-sm text-gray-400">No active alerts 🎉</div>
          ) : (
            <div className="space-y-2">
              {d.recentAlerts?.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                  <AlertTriangle
                    size={18}
                    className={`flex-shrink-0 mt-0.5 ${
                      alert.level === 'CRITICAL' ? 'text-red-500' : alert.level === 'WARNING' ? 'text-yellow-500' : 'text-blue-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">{alert.message}</p>
                    <Link to={`/budgets/${alert.budgetId}`} className="text-xs text-primary-600 hover:underline">
                      {alert.budgetTitle}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
