import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Check, X, Receipt as ReceiptIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { expensesApi } from '../../api/endpoints'
import { Card, Badge, EmptyState, TableSkeleton } from '../../components/ui'
import { formatCurrency, formatDate } from '../../lib/utils'
import { can } from '../../lib/permissions'
import useAuthStore from '../../store/authStore'

export default function Expenses() {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['allExpenses'],
    queryFn: async () => (await expensesApi.getAll()).data,
  })

  const approveMutation = useMutation({
    mutationFn: expensesApi.approve,
    onSuccess: () => {
      queryClient.invalidateQueries(['allExpenses'])
      toast.success('Expense approved')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  })

  const rejectMutation = useMutation({
    mutationFn: expensesApi.reject,
    onSuccess: () => {
      queryClient.invalidateQueries(['allExpenses'])
      toast.success('Expense rejected')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  })

  const filtered = statusFilter ? expenses.filter((e) => e.status === statusFilter) : expenses

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} expenses</p>
        </div>
        <div className="flex gap-2">
          {['', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === s ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {s ? s.charAt(0) + s.slice(1).toLowerCase() : 'All'}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState icon={ReceiptIcon} title="No expenses found" description="Record expenses against approved budgets to see them here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Budget</th>
                  <th className="px-4 py-3">Line Item</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  {can(user?.role, 'canApproveExpenses') && <th className="px-4 py-3">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{e.description}</td>
                    <td className="px-4 py-3">
                      <Link to={`/budgets/${e.budgetId}`} className="text-sm text-primary-600 hover:underline">{e.budgetTitle}</Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{e.lineItemName || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{e.vendor || '—'}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(e.amount)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(e.expenseDate)}</td>
                    <td className="px-4 py-3">
                      <Badge status={e.status === 'APPROVED' ? 'APPROVED' : e.status === 'REJECTED' ? 'REJECTED' : 'SUBMITTED'}>
                        {e.status}
                      </Badge>
                    </td>
                    {can(user?.role, 'canApproveExpenses') && (
                      <td className="px-4 py-3">
                        {e.status === 'PENDING' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => approveMutation.mutate(e.id)}
                              className="p-1.5 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                              title="Approve"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => rejectMutation.mutate(e.id)}
                              className="p-1.5 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Reject"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
