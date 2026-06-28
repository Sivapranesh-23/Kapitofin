import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeftRight, Check, X, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { transfersApi, budgetsApi } from '../../api/endpoints'
import { Card, Badge, Modal, EmptyState, TableSkeleton } from '../../components/ui'
import { formatCurrency, formatDate } from '../../lib/utils'

export default function Transfers() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ fromBudgetId: '', toBudgetId: '', amount: '', reason: '' })

  const { data: transfers = [], isLoading } = useQuery({
    queryKey: ['transfers'],
    queryFn: async () => (await transfersApi.getAll()).data,
  })

  const { data: budgets = [] } = useQuery({
    queryKey: ['budgets', 'approved'],
    queryFn: async () => (await budgetsApi.getAll({ status: 'APPROVED' })).data,
  })

  const createMutation = useMutation({
    mutationFn: transfersApi.request,
    onSuccess: () => {
      queryClient.invalidateQueries(['transfers'])
      toast.success('Transfer requested')
      setShowForm(false)
      setForm({ fromBudgetId: '', toBudgetId: '', amount: '', reason: '' })
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  })

  const approveMutation = useMutation({
    mutationFn: transfersApi.approve,
    onSuccess: () => { queryClient.invalidateQueries(['transfers']); queryClient.invalidateQueries(['budgets']); toast.success('Transfer approved') },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  })

  const rejectMutation = useMutation({
    mutationFn: transfersApi.reject,
    onSuccess: () => { queryClient.invalidateQueries(['transfers']); toast.success('Transfer rejected') },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  })

  const submitForm = (e) => {
    e.preventDefault()
    createMutation.mutate({
      fromBudgetId: Number(form.fromBudgetId),
      toBudgetId: Number(form.toBudgetId),
      amount: Number(form.amount),
      reason: form.reason,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Transfers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{transfers.length} transfers</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={18} /> Request Transfer
        </button>
      </div>

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <TableSkeleton />
        ) : transfers.length === 0 ? (
          <EmptyState icon={ArrowLeftRight} title="No transfers" description="Request a transfer to move funds between budgets." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="px-4 py-3">From</th>
                  <th className="px-4 py-3">To</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Requested By</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{t.fromBudgetTitle}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{t.toBudgetTitle}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(t.amount)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{t.reason}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{t.requestedByFullName}</td>
                    <td className="px-4 py-3">
                      <Badge status={t.status === 'APPROVED' ? 'APPROVED' : t.status === 'REJECTED' ? 'REJECTED' : 'SUBMITTED'}>
                        {t.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {t.status === 'PENDING' && (
                        <div className="flex gap-1">
                          <button onClick={() => approveMutation.mutate(t.id)} className="p-1.5 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20" title="Approve">
                            <Check size={16} />
                          </button>
                          <button onClick={() => rejectMutation.mutate(t.id)} className="p-1.5 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" title="Reject">
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Request Budget Transfer" size="md">
        <form onSubmit={submitForm} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Budget *</label>
            <select value={form.fromBudgetId} onChange={(e) => setForm({ ...form, fromBudgetId: e.target.value })} className="input-field" required>
              <option value="">Select...</option>
              {budgets.map((b) => <option key={b.id} value={b.id}>{b.title} ({formatCurrency(b.remainingAmount)} left)</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To Budget *</label>
            <select value={form.toBudgetId} onChange={(e) => setForm({ ...form, toBudgetId: e.target.value })} className="input-field" required>
              <option value="">Select...</option>
              {budgets.filter((b) => b.id !== Number(form.fromBudgetId)).map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input-field pl-7" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason *</label>
            <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={3} className="input-field" required />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="btn-primary">
              {createMutation.isPending ? 'Submitting...' : 'Request Transfer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
