import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Building2, Layers, Calendar, Lock, Plus, FolderTree, Shield, DollarSign, History
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '../../api/endpoints'
import { Card, Badge, Modal, TableSkeleton } from '../../components/ui'
import { formatCurrency, formatDate, formatDateTime } from '../../lib/utils'
import { can } from '../../lib/permissions'
import useAuthStore from '../../store/authStore'

const TABS = [
  { id: 'regions', label: 'Regions', icon: Building2 },
  { id: 'departments', label: 'Departments', icon: FolderTree },
  { id: 'categories', label: 'Categories', icon: Layers },
  { id: 'fiscalYears', label: 'Fiscal Years', icon: Calendar },
  { id: 'allocations', label: 'Allocations', icon: DollarSign },
  { id: 'auditLogs', label: 'Audit Logs', icon: History },
]

export default function Admin() {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('regions')
  const [showModal, setShowModal] = useState(false)

  if (!can(user?.role, 'canManageOrg')) {
    return <Card><p className="text-center py-8 text-gray-500">You don't have permission to access this page.</p></Card>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage organizational structure and configuration</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-700">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'border-primary-600 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {activeTab === 'regions' && <RegionsTab />}
        {activeTab === 'departments' && <DepartmentsTab />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'fiscalYears' && <FiscalYearsTab />}
        {activeTab === 'allocations' && <AllocationsTab />}
        {activeTab === 'auditLogs' && <AuditLogsTab />}
      </motion.div>
    </div>
  )
}

/* ============ REGIONS ============ */
function RegionsTab() {
  const { data: regions = [], isLoading } = useQuery({
    queryKey: ['adminRegions'],
    queryFn: async () => (await adminApi.getRegions()).data,
  })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', code: '', description: '' })
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: adminApi.createRegion,
    onSuccess: () => { queryClient.invalidateQueries(['adminRegions']); toast.success('Region created'); setShowForm(false); setForm({ name: '', code: '', description: '' }) },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  })

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Regions ({regions.length})</h3>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm"><Plus size={16} /> Add Region</button>
      </div>
      {isLoading ? <TableSkeleton /> : (
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50"><tr className="text-left text-xs font-medium text-gray-500 uppercase">
            <th className="px-4 py-3">Name</th><th className="px-4 py-3">Code</th><th className="px-4 py-3">Description</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {regions.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white text-sm">{r.name}</td>
                <td className="px-4 py-3"><Badge variant="primary">{r.code}</Badge></td>
                <td className="px-4 py-3 text-sm text-gray-600">{r.description || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Region" size="sm">
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }} className="space-y-3">
          <div><label className="block text-sm font-medium mb-1">Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required /></div>
          <div><label className="block text-sm font-medium mb-1">Code *</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input-field" placeholder="AMER" required /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="input-field" /></div>
          <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button><button type="submit" disabled={mutation.isPending} className="btn-primary">{mutation.isPending ? 'Saving...' : 'Create'}</button></div>
        </form>
      </Modal>
    </Card>
  )
}

/* ============ DEPARTMENTS ============ */
function DepartmentsTab() {
  const { data: departments = [], isLoading } = useQuery({ queryKey: ['adminDepartments'], queryFn: async () => (await adminApi.getDepartments()).data })
  const { data: regions = [] } = useQuery({ queryKey: ['adminRegions'], queryFn: async () => (await adminApi.getRegions()).data })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', code: '', regionId: '', description: '' })
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: adminApi.createDepartment,
    onSuccess: () => { queryClient.invalidateQueries(['adminDepartments']); toast.success('Department created'); setShowForm(false); setForm({ name: '', code: '', regionId: '', description: '' }) },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  })

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Departments ({departments.length})</h3>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm"><Plus size={16} /> Add Department</button>
      </div>
      {isLoading ? <TableSkeleton /> : (
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50"><tr className="text-left text-xs font-medium text-gray-500 uppercase">
            <th className="px-4 py-3">Name</th><th className="px-4 py-3">Code</th><th className="px-4 py-3">Region</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {departments.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white text-sm">{d.name}</td>
                <td className="px-4 py-3"><Badge variant="primary">{d.code}</Badge></td>
                <td className="px-4 py-3 text-sm text-gray-600">{d.region?.name || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Department" size="sm">
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }} className="space-y-3">
          <div><label className="block text-sm font-medium mb-1">Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required /></div>
          <div><label className="block text-sm font-medium mb-1">Code *</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input-field" placeholder="ENG" required /></div>
          <div><label className="block text-sm font-medium mb-1">Region *</label><select value={form.regionId} onChange={(e) => setForm({ ...form, regionId: e.target.value })} className="input-field" required><option value="">Select...</option>{regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="input-field" /></div>
          <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button><button type="submit" disabled={mutation.isPending} className="btn-primary">{mutation.isPending ? 'Saving...' : 'Create'}</button></div>
        </form>
      </Modal>
    </Card>
  )
}

/* ============ CATEGORIES ============ */
function CategoriesTab() {
  const { data: categories = [], isLoading } = useQuery({ queryKey: ['adminCategories'], queryFn: async () => (await adminApi.getCategories()).data })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', colorHex: '#3B82F6' })
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: adminApi.createCategory,
    onSuccess: () => { queryClient.invalidateQueries(['adminCategories']); toast.success('Category created'); setShowForm(false); setForm({ name: '', description: '', colorHex: '#3B82F6' }) },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  })

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Categories ({categories.length})</h3>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm"><Plus size={16} /> Add Category</button>
      </div>
      {isLoading ? <TableSkeleton /> : (
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50"><tr className="text-left text-xs font-medium text-gray-500 uppercase">
            <th className="px-4 py-3">Color</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Description</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="px-4 py-3"><span className="inline-block w-5 h-5 rounded-full" style={{ background: c.colorHex || '#3B82F6' }} /></td>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white text-sm">{c.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{c.description || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Category" size="sm">
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }} className="space-y-3">
          <div><label className="block text-sm font-medium mb-1">Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="input-field" /></div>
          <div><label className="block text-sm font-medium mb-1">Color</label><input type="color" value={form.colorHex} onChange={(e) => setForm({ ...form, colorHex: e.target.value })} className="h-10 w-20 rounded cursor-pointer" /></div>
          <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button><button type="submit" disabled={mutation.isPending} className="btn-primary">{mutation.isPending ? 'Saving...' : 'Create'}</button></div>
        </form>
      </Modal>
    </Card>
  )
}

/* ============ FISCAL YEARS ============ */
function FiscalYearsTab() {
  const { data: fys = [], isLoading } = useQuery({ queryKey: ['adminFiscalYears'], queryFn: async () => (await adminApi.getFiscalYears()).data })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ year: new Date().getFullYear() + 1, companyTarget: '' })
  const queryClient = useQueryClient()
  const createMut = useMutation({
    mutationFn: adminApi.createFiscalYear,
    onSuccess: () => { queryClient.invalidateQueries(['adminFiscalYears']); toast.success('Fiscal year created'); setShowForm(false) },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  })
  const lockMut = useMutation({
    mutationFn: adminApi.lockFiscalYear,
    onSuccess: () => { queryClient.invalidateQueries(['adminFiscalYears']); queryClient.invalidateQueries(['budgets']); toast.success('Fiscal year locked') },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  })

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Fiscal Years ({fys.length})</h3>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm"><Plus size={16} /> Add Fiscal Year</button>
      </div>
      {isLoading ? <TableSkeleton /> : (
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50"><tr className="text-left text-xs font-medium text-gray-500 uppercase">
            <th className="px-4 py-3">Year</th><th className="px-4 py-3 text-right">Company Target</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {fys.map((fy) => (
              <tr key={fy.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white text-sm">FY {fy.year}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">{formatCurrency(fy.companyTarget)}</td>
                <td className="px-4 py-3"><Badge status={fy.status === 'OPEN' ? 'APPROVED' : 'CLOSED'}>{fy.status}</Badge></td>
                <td className="px-4 py-3">
                  {fy.status === 'OPEN' && (
                    <button onClick={() => { if (confirm(`Lock FY ${fy.year}? This will close all open budgets.`)) lockMut.mutate(fy.id) }} className="text-xs text-red-600 hover:underline flex items-center gap-1">
                      <Lock size={12} /> Lock
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Fiscal Year" size="sm">
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate({ year: Number(form.year), companyTarget: form.companyTarget }) }} className="space-y-3">
          <div><label className="block text-sm font-medium mb-1">Year *</label><input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="input-field" required /></div>
          <div><label className="block text-sm font-medium mb-1">Company Target ($) *</label><input type="number" value={form.companyTarget} onChange={(e) => setForm({ ...form, companyTarget: e.target.value })} className="input-field" placeholder="5000000" required /></div>
          <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button><button type="submit" disabled={createMut.isPending} className="btn-primary">{createMut.isPending ? 'Saving...' : 'Create'}</button></div>
        </form>
      </Modal>
    </Card>
  )
}

/* ============ ALLOCATIONS ============ */
function AllocationsTab() {
  const { data: allocs = [], isLoading } = useQuery({ queryKey: ['adminAllocations'], queryFn: async () => (await adminApi.getAllocations()).data })
  return (
    <Card className="overflow-hidden p-0">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Allocations ({allocs.length})</h3>
      </div>
      {isLoading ? <TableSkeleton /> : (
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50"><tr className="text-left text-xs font-medium text-gray-500 uppercase">
            <th className="px-4 py-3">Fiscal Year</th><th className="px-4 py-3">Scope</th><th className="px-4 py-3">Ref ID</th><th className="px-4 py-3 text-right">Amount</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {allocs.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">FY {a.fiscalYear?.year}</td>
                <td className="px-4 py-3"><Badge variant="primary">{a.scope}</Badge></td>
                <td className="px-4 py-3 text-sm text-gray-600">#{a.refId}</td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(a.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  )
}

/* ============ AUDIT LOGS ============ */
function AuditLogsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['adminAuditLogs'],
    queryFn: async () => (await adminApi.getAuditLogs({ page: 0, size: 50 })).data,
  })
  const logs = data?.content || []

  return (
    <Card className="overflow-hidden p-0">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Audit Logs ({data?.totalElements || 0})</h3>
      </div>
      {isLoading ? <TableSkeleton /> : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50"><tr className="text-left text-xs font-medium text-gray-500 uppercase">
              <th className="px-4 py-3">Timestamp</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Entity</th><th className="px-4 py-3">Details</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDateTime(log.timestamp)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}</td>
                  <td className="px-4 py-3"><Badge variant="info">{log.action}</Badge></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{log.entityType}{log.entityId ? ` #${log.entityId}` : ''}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-md truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
