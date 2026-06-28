import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { expensesApi } from '../../api/endpoints'
import { formatCurrency } from '../../lib/utils'

export default function ExpenseForm({ budget, lineItem, onClose }) {
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState('')
  const [lineItemId, setLineItemId] = useState(lineItem?.id || '')
  const [description, setDescription] = useState('')
  const [vendor, setVendor] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0])

  const remaining = Number(budget?.remainingAmount || 0)
  const amountNum = Number(amount) || 0
  const overBudget = amountNum > remaining

  const mutation = useMutation({
    mutationFn: expensesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['budget', budget.id])
      queryClient.invalidateQueries(['expenses', budget.id])
      queryClient.invalidateQueries(['dashboard'])
      toast.success('Expense recorded successfully')
      onClose()
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to record expense'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (overBudget) {
      toast.error('Amount exceeds remaining budget')
      return
    }
    mutation.mutate({
      budgetId: budget.id,
      lineItemId: lineItemId ? Number(lineItemId) : null,
      amount: amountNum,
      description,
      vendor,
      invoiceNumber,
      expenseDate,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Budget context */}
      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 text-sm">
        <p className="font-medium text-gray-900 dark:text-white">{budget.title}</p>
        <div className="flex justify-between mt-1">
          <span className="text-gray-500">Remaining: <span className="font-semibold text-green-600">{formatCurrency(remaining)}</span></span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount *</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
          <input
            type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
            className="input-field pl-7" placeholder="0.00" required
          />
        </div>
        {overBudget && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <AlertTriangle size={12} /> Amount exceeds remaining budget of {formatCurrency(remaining)}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Line Item</label>
        <select value={lineItemId} onChange={(e) => setLineItemId(e.target.value)} className="input-field">
          <option value="">None (general)</option>
          {budget.lineItems?.map((li) => (
            <option key={li.id} value={li.id}>{li.name} ({formatCurrency(li.remainingAmount)} left)</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
        <input
          value={description} onChange={(e) => setDescription(e.target.value)}
          className="input-field" placeholder="e.g. AWS March Invoice" required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor</label>
          <input
            value={vendor} onChange={(e) => setVendor(e.target.value)}
            className="input-field" placeholder="Amazon Web Services"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invoice #</label>
          <input
            value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)}
            className="input-field" placeholder="INV-2024-001"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expense Date *</label>
        <input
          type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)}
          className="input-field" required
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={mutation.isPending || overBudget} className="btn-primary">
          {mutation.isPending ? 'Recording...' : 'Record Expense'}
        </button>
      </div>
    </form>
  )
}
