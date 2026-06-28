import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, Bell, Info } from 'lucide-react'
import { adminApi } from '../../api/endpoints'
import { Card, EmptyState, CardSkeleton } from '../../components/ui'
import { formatDateTime } from '../../lib/utils'

export default function Alerts() {
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => (await adminApi.getAlerts()).data,
  })

  const levelStyles = {
    CRITICAL: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-l-red-500', icon: 'text-red-500', label: 'Critical' },
    WARNING: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-l-yellow-500', icon: 'text-yellow-500', label: 'Warning' },
    INFO: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-l-blue-500', icon: 'text-blue-500', label: 'Info' },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alerts</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Budget utilization warnings and critical notifications
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : alerts.length === 0 ? (
        <Card>
          <EmptyState
            icon={Bell}
            title="No alerts"
            description="All budgets are within healthy utilization ranges. You'll be notified here when budgets approach their limits."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, i) => {
            const style = levelStyles[alert.level] || levelStyles.INFO
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className={`border-l-4 ${style.border} ${style.bg} !p-4`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className={`flex-shrink-0 mt-0.5 ${style.icon}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          {style.label}
                        </span>
                        <span className="text-xs text-gray-400">{formatDateTime(alert.triggeredAt)}</span>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white">{alert.message}</p>
                      <Link to={`/budgets/${alert.budgetId}`} className="text-xs text-primary-600 hover:underline mt-1 inline-block">
                        {alert.budgetTitle} →
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
