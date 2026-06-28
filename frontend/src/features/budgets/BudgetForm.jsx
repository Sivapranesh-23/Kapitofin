import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { budgetsApi, adminApi } from '../../api/endpoints'
import { formatCurrency } from '../../lib/utils'

export default function BudgetForm({ budget, categories, onClose }) {
  const queryClient = useQueryClient()

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => (await adminApi.getDepartments()).data,
  })
  const { data: fiscalYears = [] } = useQuery({
    queryKey: ['fiscalYears'],
    queryFn: async () => (await adminApi.getFiscalYears()).data,
  })

  const [title, setTitle] = useState(budget?.title || '')
  const [description, setDescription] = useState(budget?.description || '')
  const [fiscalYearId, setFiscalYearId] = useState(budget?.fiscalYearId || fiscalYears[0]?.id || '')
  const [departmentId, setDepartmentId] = useState(budget?.departmentId || '')
  const [lineItems, setLineItems] = useState(
    budget?.lineItems?.map((li) => ({
      name: li.name, description: li.description, categoryId: li.categoryId, amount: li.amount,
    })) || [{ name: '', description: '', categoryId: '', amount: '' }]
  )
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!fiscalYearId && fiscalYears.length > 0) setFiscalYearId(fiscalYears[0].id)
  }, [fiscalYears])

  const total = lineItems.reduce((sum, li) => sum + (Number(li.amount) || 0), 0)

  const addLineItem = () => setLineItems([...lineItems, { name: '', description: '', categoryId: '', amount: '' }])
  const removeLineItem = (idx) => setLineItems(lineItems.filter((_, i) => i !== idx))
  const updateLineItem = (idx, field, value) =>
    setLineItems(lineItems.map((li, i) => (i === idx ? { ...li, [field]: value } : li)))

  const mutation = useMutation({
    mutationFn: (data) => budget ? budgetsApi.update(budget.id, data) : budgetsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['budgets'])
      toast.success(budget ? 'Budget updated' : 'Budget created')
      onClose()
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to save'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!title) newErrors.title = 'Title is required'
    if (!departmentId) newErrors.departmentId = 'Department is required'
    if (lineItems.length === 0) newErrors.lineItems = 'At least one line item is required'

    lineItems.forEach((li, i) => {
      if (!li.name) newErrors[`li_${i}_name`] = 'Required'
      if (!li.categoryId) newErrors[`li_${i}_category`] = 'Required'
      if (!li.amount || Number(li.amount) <= 0) newErrors[`li_${i}_amount`] = 'Required'
    })

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix the errors in the form')
      return
    }

    mutation.mutate({
      title, description, fiscalYearId: Number(fiscalYearId), departmentId: Number(departmentId),
      lineItems: lineItems.map((li) => ({
        name: li.name, description: li.description,
        categoryId: Number(li.categoryId), amount: Number(li.amount),
      })),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="e.g. 2024 Engineering IT Budget"
      />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fiscal Year *</label>
          <select value={fiscalYearId} onChange={(e) => setFiscalYearId(e.target.value)} className="input-field">
            <option value="">Select...</option>
            {fiscalYears.map((fy) => <option key={fy.id} value={fy.id}>FY {fy.year}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department *</label>
          <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="input-field">
            <option value="">Select...</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          {errors.departmentId && <p className="text-xs text-red-500 mt-1">{errors.departmentId}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="input-field"
            placeholder="Brief description of this budget..."
          />
        </div>
      </div>

      {/* Line items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Line Items *</label>
          <button type="button" onClick={addLineItem} className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            <Plus size={14} /> Add Item
          </button>
        </div>

        <div className="space-y-3">
          {lineItems.map((li, idx) => (
            <div key={idx} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Item {idx + 1}</span>
                {lineItems.length > 1 && (
                  <button type="button" onClick={() => removeLineItem(idx)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <input
                value={li.name}
                onChange={(e) => updateLineItem(idx, 'name', e.target.value)}
                className="input-field text-sm"
                placeholder="Line item name (e.g. Cloud Infrastructure)"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={li.categoryId}
                  onChange={(e) => updateLineItem(idx, 'categoryId', e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">Category...</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    value={li.amount}
                    onChange={(e) => updateLineItem(idx, 'amount', e.target.value)}
                    className="input-field text-sm pl-7"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
        <span className="text-sm font-medium text-primary-700 dark:text-primary-300">Total Budget Amount</span>
        <span className="text-2xl font-bold text-primary-700 dark:text-primary-300">{formatCurrency(total)}</span>
      </div>

      {/* Validation note */}
      <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <AlertCircle size={14} className="flex-shrink-0 mt-0.5 text-yellow-500" />
        <span>The total will be validated against the department's allocation on save. Amounts over $25K require regional approval; over $100K require director approval.</span>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={mutation.isPending} className="btn-primary">
          {mutation.isPending ? 'Saving...' : budget ? 'Update Budget' : 'Create Budget'}
        </button>
      </div>
    </form>
  )
}
