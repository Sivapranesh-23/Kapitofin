import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { BarChart3, Download } from 'lucide-react'
import { reportsApi } from '../../api/endpoints'
import { Card, Badge, TableSkeleton } from '../../components/ui'
import { formatCurrency, formatPercent } from '../../lib/utils'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#6366F1']

export default function Reports() {
  const { data, isLoading } = useQuery({
    queryKey: ['departmentReport'],
    queryFn: async () => (await reportsApi.department()).data,
  })

  if (isLoading) return <Card><TableSkeleton /></Card>

  const departments = data?.departments || []

  const barData = departments.map((d) => ({
    name: d.departmentName,
    Allocated: Number(d.allocated),
    Spent: Number(d.spent),
    Remaining: Number(d.remaining),
  }))

  const totalAllocated = departments.reduce((s, d) => s + Number(d.allocated), 0)
  const totalSpent = departments.reduce((s, d) => s + Number(d.spent), 0)
  const overallUtil = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{data?.title}</p>
        </div>
        <button onClick={() => window.print()} className="btn-secondary">
          <Download size={16} /> Export
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Allocated', value: formatCurrency(totalAllocated), color: 'text-blue-600' },
          { label: 'Total Spent', value: formatCurrency(totalSpent), color: 'text-red-600' },
          { label: 'Overall Utilization', value: formatPercent(overallUtil), color: 'text-yellow-600' },
          { label: 'Variance', value: formatCurrency(totalAllocated - totalSpent), color: 'text-green-600' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <p className="text-sm text-gray-500 dark:text-gray-400">{kpi.label}</p>
              <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Allocated vs Spent vs Remaining</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Allocated" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Spent" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Remaining" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Spend Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={barData} cx="50%" cy="50%" outerRadius={90} dataKey="Spent" nameKey="name">
                  {barData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Variance table */}
      <Card className="overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Department Variance Report</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3 text-right">Allocated</th>
                <th className="px-4 py-3 text-right">Spent</th>
                <th className="px-4 py-3 text-right">Variance</th>
                <th className="px-4 py-3 text-right">Utilization</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {departments.map((d) => (
                <tr key={d.departmentId} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white text-sm">{d.departmentName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{d.regionName}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(d.allocated)}</td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(d.spent)}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-green-600">{formatCurrency(d.variance)}</td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600">{formatPercent(d.utilizationPct)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={d.status === 'Over Budget' ? 'danger' : d.status === 'Watch Closely' ? 'warning' : 'success'}>
                      {d.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
