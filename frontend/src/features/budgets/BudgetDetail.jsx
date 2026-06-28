import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Wallet, TrendingDown, Clock, CheckCircle2, Send, Plus,
  ClipboardList, FileText, History, Tag, Check, X
} from 'lucide-react'
import toast from 'react-hot-toast'
import { budgetsApi, approvalsApi, expensesApi } from '../../api/endpoints'
import { Card, Badge, ProgressBar, Modal, EmptyState } from '../../components/ui'
import { formatCurrency, formatDate, formatDateTime, formatPercent } from '../../lib/utils'
import { can } from '../../lib/permissions'
import useAuthStore from '../../store/authStore'
import ExpenseForm from './ExpenseForm'

const TABS = [
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'lineItems', label: 'Line Items', icon: Tag },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'timeline', label: 'Approval Timeline', icon: ClipboardList },
]

function Receipt(props) { return <Tag {...props} /> }

export default function BudgetDetail() {
  const { id } = useParams()
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')
  const [showExpenseForm, setShowExpenseForm] = useState(false)

  const { data: budget, isLoading } = useQuery({
    queryKey: ['budget', id],
    queryFn: async () => (await budgetsApi.getById(id)).data,
  })

  const { data: workflow } = useQuery({
    queryKey: ['workflow', id],
    queryFn: async () => (await approvalsApi.getWorkflow(id)).data,
    enabled: budget?.status === 'SUBMITTED' || budget?.status === 'APPROVED' || budget?.status === 'REJECTED',
  })

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', id],
    queryFn: async () => (await expensesApi.getAll({ budgetId: id })).data,
    enabled: !!id,
  })

  const submitMutation = useMutation({
    mutationFn: () => budgetsApi.submit(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['budget', id])
      toast.success('Budget submitted for approval')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to submit'),
  })

  if (isLoading) {
    return <div className="space-y-4"><div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" /></div>
  }

  if (!budget) {
    return <Card><EmptyState title="Budget not found" /></Card>
  }

  const util = Number(budget.utilizationPct || 0)

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link to="/budgets" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600">
        <ArrowLeft size={16} /> Back to Budgets
      </Link>

      {/* Header card */}
      <Card>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <Badge status={budget.status}>{budget.status}</Badge>
              <span className="text-xs text-gray-500">FY{budget.fiscalYear}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{budget.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {budget.departmentName} · {budget.regionName} · Created by {budget.createdByFullName} on {formatDate(budget.createdAt)}
            </p>
            {budget.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 max-w-2xl">{budget.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            {can(user?.role, 'canSubmitBudgets') && budget.status === 'DRAFT' && (
              <button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending} className="btn-primary">
                <Send size={16} /> {submitMutation.isPending ? 'Submitting...' : 'Submit for Approval'}
              </button>
            )}
            {can(user?.role, 'canRecordExpenses') && budget.status === 'APPROVED' && (
              <button onClick={() => setShowExpenseForm(true)} className="btn-primary">
                <Plus size={16} /> Record Expense
              </button>
            )}
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 mb-1">
              <Wallet size={14} /> Total Budget
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(budget.totalAmount)}</p>
          </div>
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 mb-1">
              <TrendingDown size={14} /> Spent
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(budget.spentAmount)}</p>
          </div>
          <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
            <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400 mb-1">
              <Clock size={14} /> Committed
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(budget.committedAmount)}</p>
          </div>
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 mb-1">
              <CheckCircle2 size={14} /> Remaining
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(budget.remainingAmount)}</p>
          </div>
        </div>

        {/* Utilization bar */}
        <div className="mt-4">
          <ProgressBar value={Number(budget.spentAmount)} max={Number(budget.totalAmount)} />
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {activeTab === 'overview' && (
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Line Items Summary</h3>
            <div className="space-y-3">
              {budget.lineItems?.map((li) => (
                <div key={li.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full" style={{ background: li.categoryColorHex || '#3B82F6' }} />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{li.name}</p>
                      <p className="text-xs text-gray-500">{li.categoryName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(li.amount)}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(li.spentAmount)} spent</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'lineItems' && (
          <Card className="overflow-hidden p-0">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Allocated</th>
                  <th className="px-4 py-3 text-right">Spent</th>
                  <th className="px-4 py-3 text-right">Remaining</th>
                  <th className="px-4 py-3">Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {budget.lineItems?.map((li) => (
                  <tr key={li.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{li.name}</p>
                      {li.description && <p className="text-xs text-gray-500">{li.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: li.categoryColorHex || '#3B82F6' }} />
                        {li.categoryName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(li.amount)}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(li.spentAmount)}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(li.remainingAmount)}</td>
                    <td className="px-4 py-3 w-32">
                      <ProgressBar value={Number(li.spentAmount)} max={Number(li.amount)} showLabel={false} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {activeTab === 'expenses' && (
          <Card className="overflow-hidden p-0">
            {expenses.length === 0 ? (
              <EmptyState icon={Receipt} title="No expenses recorded" description="Record an expense against this budget to see it here." />
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Line Item</th>
                    <th className="px-4 py-3">Vendor</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{e.description}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{e.lineItemName || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{e.vendor || '—'}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(e.amount)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(e.expenseDate)}</td>
                      <td className="px-4 py-3">
                        <Badge status={e.status === 'APPROVED' ? 'APPROVED' : e.status === 'REJECTED' ? 'REJECTED' : 'SUBMITTED'}>
                          {e.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        )}

        {activeTab === 'timeline' && (
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Approval Workflow</h3>
            {!workflow ? (
              <EmptyState icon={ClipboardList} title="No workflow yet" description="Submit this budget to start the approval workflow." />
            ) : (
              <div className="relative">
                {workflow.steps?.map((step, idx) => {
                  const isDone = step.decision === 'APPROVE'
                  const isRejected = step.decision === 'REJECT'
                  const isCurrent = step.pending && step.level === workflow.currentLevel
                  const isFuture = step.pending && step.level > workflow.currentLevel

                  return (
                    <div key={step.id} className="flex gap-4 pb-8 last:pb-0 relative">
                      {/* Connector line */}
                      {idx < workflow.steps.length - 1 && (
                        <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                      )}
                      {/* Node */}
                      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isDone ? 'bg-green-500' : isRejected ? 'bg-red-500' : isCurrent ? 'bg-blue-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'
                      }`}>
                        {isDone ? <Check size={16} className="text-white" /> :
                         isRejected ? <X size={16} className="text-white" /> :
                         <span className="text-white text-xs font-bold">{step.level}</span>}
                      </div>
                      {/* Content */}
                      <div className="flex-1 -mt-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            Level {step.level}: {step.roleRequired.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                          </p>
                          {isCurrent && <Badge variant="info">Awaiting decision</Badge>}
                          {isFuture && <Badge variant="default">Upcoming</Badge>}
                          {isDone && <Badge status="APPROVED">Approved</Badge>}
                          {isRejected && <Badge status="REJECTED">Rejected</Badge>}
                          {step.decision === 'REQUEST_INFO' && <Badge variant="warning">Info Requested</Badge>}
                        </div>
                        {step.approverName && (
                          <p className="text-xs text-gray-500">by {step.approverName} · {formatDateTime(step.decidedAt)}</p>
                        )}
                        {step.comments && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">"{step.comments}"</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        )}
      </motion.div>

      {/* Expense modal */}
      <Modal isOpen={showExpenseForm} onClose={() => setShowExpenseForm(false)} title="Record Expense" size="md">
        <ExpenseForm budget={budget} onClose={() => setShowExpenseForm(false)} />
      </Modal>
    </div>
  )
}
