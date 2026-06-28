import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, X, MessageSquare, ArrowRight, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { approvalsApi } from '../../api/endpoints'
import { Card, Badge, Modal, EmptyState, CardSkeleton } from '../../components/ui'
import { formatCurrency, formatDate } from '../../lib/utils'
import { roleLabels } from '../../lib/utils'

export default function Approvals() {
  const queryClient = useQueryClient()
  const [decisionModal, setDecisionModal] = useState(null) // { step, workflow, action }
  const [comments, setComments] = useState('')

  const { data: pending = [], isLoading } = useQuery({
    queryKey: ['pendingApprovals'],
    queryFn: async () => (await approvalsApi.getPending()).data,
  })

  const decideMutation = useMutation({
    mutationFn: ({ stepId, decision }) => approvalsApi.decide(stepId, { decision, comments }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingApprovals'])
      queryClient.invalidateQueries(['dashboard'])
      queryClient.invalidateQueries(['budgets'])
      toast.success('Decision recorded')
      setDecisionModal(null)
      setComments('')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to record decision'),
  })

  const openDecision = (workflow, action) => {
    const currentStep = workflow.steps?.find((s) => s.level === workflow.currentLevel && s.pending)
    if (!currentStep) {
      toast.error('No actionable step found')
      return
    }
    setDecisionModal({ step: currentStep, workflow, action })
    setComments('')
  }

  const confirmDecision = () => {
    if (!comments.trim()) {
      toast.error('Please add a comment')
      return
    }
    decideMutation.mutate({ stepId: decisionModal.step.id, decision: decisionModal.action })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Approvals</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Budgets awaiting your review and decision
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : pending.length === 0 ? (
        <Card>
          <EmptyState
            icon={Check}
            title="No pending approvals"
            description="You're all caught up! Budgets awaiting your approval will appear here."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {pending.map((wf, i) => {
            const currentStep = wf.steps?.find((s) => s.level === wf.currentLevel && s.pending)
            return (
              <motion.div
                key={wf.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card>
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="info">Level {wf.currentLevel}</Badge>
                        <span className="text-xs text-gray-500">
                          {roleLabels[currentStep?.roleRequired] || currentStep?.roleRequired}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        <Link to={`/budgets/${wf.budgetId}`} className="hover:text-primary-600">
                          Budget #{wf.budgetId}
                        </Link>
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {wf.steps.length} approval level(s) · Currently at level {wf.currentLevel} of {wf.steps.length}
                      </p>

                      {/* Progress dots */}
                      <div className="flex items-center gap-2 mt-3">
                        {wf.steps.map((s) => (
                          <div key={s.id} className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${
                              s.decision === 'APPROVE' ? 'bg-green-500' :
                              s.pending && s.level === wf.currentLevel ? 'bg-blue-500 animate-pulse' :
                              s.pending ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-400'
                            }`} />
                            {s.level < wf.steps.length && <div className="w-6 h-px bg-gray-200 dark:bg-gray-700" />}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => openDecision(wf, 'APPROVE')}
                        className="btn-success text-sm"
                      >
                        <Check size={16} /> Approve
                      </button>
                      <button
                        onClick={() => openDecision(wf, 'REQUEST_INFO')}
                        className="btn-secondary text-sm"
                      >
                        <MessageSquare size={16} /> Request Info
                      </button>
                      <button
                        onClick={() => openDecision(wf, 'REJECT')}
                        className="btn-danger text-sm"
                      >
                        <X size={16} /> Reject
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <Link to={`/budgets/${wf.budgetId}`} className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                      View full details <ArrowRight size={12} />
                    </Link>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Decision modal */}
      <Modal
        isOpen={!!decisionModal}
        onClose={() => setDecisionModal(null)}
        title={`${decisionModal?.action === 'APPROVE' ? 'Approve' : decisionModal?.action === 'REJECT' ? 'Reject' : 'Request Info'} — Budget #${decisionModal?.workflow?.budgetId}`}
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
            <p className="text-sm">
              You are about to <strong>{decisionModal?.action?.toLowerCase()}</strong> this budget at
              Level {decisionModal?.workflow?.currentLevel} ({roleLabels[decisionModal?.step?.roleRequired]}).
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comments *</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className="input-field"
              placeholder={
                decisionModal?.action === 'APPROVE' ? 'Approved. Budget looks good.' :
                decisionModal?.action === 'REJECT' ? 'Reason for rejection...' :
                'What information do you need?'
              }
            />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setDecisionModal(null)} className="btn-secondary">Cancel</button>
            <button
              onClick={confirmDecision}
              disabled={decideMutation.isPending}
              className={`btn-primary ${
                decisionModal?.action === 'REJECT' ? '!bg-red-600 hover:!bg-red-700' :
                decisionModal?.action === 'APPROVE' ? '!bg-green-600 hover:!bg-green-700' : ''
              }`}
            >
              {decideMutation.isPending ? 'Submitting...' : 'Confirm'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
