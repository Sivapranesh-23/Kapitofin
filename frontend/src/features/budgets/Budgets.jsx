import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search, LayoutGrid, List, Wallet, Trash2, Send, Edit, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { budgetsApi, adminApi } from '../../api/endpoints'
import { Card, Badge, ProgressBar, Modal, EmptyState, TableSkeleton } from '../../components/ui'
import { formatCurrency, formatDate } from '../../lib/utils'
import { can } from '../../lib/permissions'
import useAuthStore from '../../store/authStore'
import BudgetForm from './BudgetForm'

export default function Budgets() {
  const [searchParams, setSearchParams] = useSearchParams()
  const statusFilter = searchParams.get('status') || ''
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['budgets', statusFilter],
    queryFn: async () => (await budgetsApi.getAll(statusFilter ? { status: statusFilter } : {})).data,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await adminApi.getCategories()).data,
  })

  const deleteMutation = useMutation({
    mutationFn: budgetsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['budgets'])
      toast.success('Budget deleted')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to delete'),
  })

  const submitMutation = useMutation({
    mutationFn: budgetsApi.submit,
    onSuccess: () => {
      queryClient.invalidateQueries(['budgets'])
      toast.success('Budget submitted for approval')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to submit'),
  })

  const filtered = budgets.filter((b) => {
    const matchesSearch = !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.departmentName?.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  const statusTabs = ['', 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CLOSED']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budgets</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} budgets found</p>
        </div>
        {can(user?.role, 'canCreateBudgets') && (
          <button
            onClick={() => { setEditingBudget(null); setShowForm(true) }}
            className="btn-primary"
          >
            <Plus size={18} /> New Budget
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {statusTabs.map((tab) => (
            <button
              key={tab || 'all'}
              onClick={() => {
                if (tab) setSearchParams({ status: tab })
                else setSearchParams({})
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === tab
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {tab ? tab.charAt(0) + tab.slice(1).toLowerCase() : 'All'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search budgets..."
              className="input-field pl-9 py-1.5 text-sm w-56"
            />
          </div>
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 ${viewMode === 'table' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <Card><TableSkeleton /></Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Wallet}
            title="No budgets found"
            description="Create your first budget to get started, or adjust your filters."
            action={can(user?.role, 'canCreateBudgets') ? () => { setEditingBudget(null); setShowForm(true) } : null}
            actionLabel="Create Budget"
          />
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card hover>
                <Link to={`/budgets/${b.id}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{b.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{b.departmentName} · FY{b.fiscalYear}</p>
                    </div>
                    <Badge status={b.status}>{b.status}</Badge>
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(b.totalAmount)}</span>
                    <span className="text-xs text-gray-500">total</span>
                  </div>
                  <ProgressBar value={Number(b.spentAmount)} max={Number(b.totalAmount)} />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span>Spent: {formatCurrency(b.spentAmount)}</span>
                    <span>Remaining: {formatCurrency(b.remainingAmount)}</span>
                  </div>
                </Link>
                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <Link to={`/budgets/${b.id}`} className="btn-secondary text-xs px-2 py-1.5">
                    <Eye size={14} /> View
                  </Link>
                  {can(user?.role, 'canEditBudgets') && b.status === 'DRAFT' && (
                    <button
                      onClick={() => { setEditingBudget(b); setShowForm(true) }}
                      className="btn-secondary text-xs px-2 py-1.5"
                    >
                      <Edit size={14} /> Edit
                    </button>
                  )}
                  {can(user?.role, 'canSubmitBudgets') && b.status === 'DRAFT' && (
                    <button
                      onClick={() => submitMutation.mutate(b.id)}
                      className="btn-primary text-xs px-2 py-1.5 ml-auto"
                    >
                      <Send size={14} /> Submit
                    </button>
                  )}
                  {can(user?.role, 'canDeleteBudgets') && b.status === 'DRAFT' && (
                    <button
                      onClick={() => { if (confirm(`Delete "${b.title}"?`)) deleteMutation.mutate(b.id) }}
                      className="btn-danger text-xs px-2 py-1.5"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Spent</th>
                  <th className="px-4 py-3">Utilization</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/budgets/${b.id}`} className="font-medium text-gray-900 dark:text-white hover:text-primary-600">
                        {b.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{b.departmentName}</td>
                    <td className="px-4 py-3"><Badge status={b.status}>{b.status}</Badge></td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(b.totalAmount)}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">{formatCurrency(b.spentAmount)}</td>
                    <td className="px-4 py-3 w-32">
                      <ProgressBar value={Number(b.spentAmount)} max={Number(b.totalAmount)} showLabel={false} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(b.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link to={`/budgets/${b.id}`} className="text-primary-600 hover:underline text-xs">View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingBudget ? 'Edit Budget' : 'Create New Budget'}
        size="lg"
      >
        <BudgetForm
          budget={editingBudget}
          categories={categories}
          onClose={() => setShowForm(false)}
        />
      </Modal>
    </div>
  )
}
