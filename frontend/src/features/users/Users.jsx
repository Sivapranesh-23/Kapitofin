import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { UserPlus, Trash2, Shield, ShieldOff, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '../../api/endpoints'
import { Card, Badge, Modal, EmptyState, TableSkeleton } from '../../components/ui'
import { formatDate, roleLabels } from '../../lib/utils'
import { can } from '../../lib/permissions'
import useAuthStore from '../../store/authStore'

const ROLES = ['EMPLOYEE', 'BUDGET_ANALYST', 'DEPARTMENT_HEAD', 'REGIONAL_FINANCE_MANAGER', 'FINANCE_DIRECTOR', 'SUPER_ADMIN']

const roleColors = {
  EMPLOYEE: 'default',
  BUDGET_ANALYST: 'info',
  DEPARTMENT_HEAD: 'success',
  REGIONAL_FINANCE_MANAGER: 'primary',
  FINANCE_DIRECTOR: 'warning',
  SUPER_ADMIN: 'danger',
}

export default function Users() {
  const currentUser = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => (await adminApi.getUsers()).data,
  })

  const deactivateMutation = useMutation({
    mutationFn: adminApi.deactivateUser,
    onSuccess: () => { queryClient.invalidateQueries(['adminUsers']); toast.success('User deactivated') },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  })

  if (!can(currentUser?.role, 'canManageUsers')) {
    return <Card><p className="text-center py-8 text-gray-500">You don't have permission to access this page.</p></Card>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{users.length} users</p>
        </div>
        <button onClick={() => { setEditingUser(null); setShowForm(true) }} className="btn-primary">
          <UserPlus size={18} /> Add User
        </button>
      </div>

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <TableSkeleton />
        ) : users.length === 0 ? (
          <EmptyState icon={Shield} title="No users found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Region</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {users.map((u) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{u.firstName?.[0]}{u.lastName?.[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1"><Mail size={11} /> {u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant={roleColors[u.role]}>{roleLabels[u.role]}</Badge></td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.departmentName || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.regionName || '—'}</td>
                    <td className="px-4 py-3">
                      {u.active ? <Badge status="APPROVED">Active</Badge> : <Badge status="CLOSED">Inactive</Badge>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setEditingUser(u); setShowForm(true) }}
                          className="p-1.5 rounded text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Edit"
                        >
                          <UserPlus size={14} />
                        </button>
                        {u.active && u.id !== currentUser.id && (
                          <button
                            onClick={() => { if (confirm(`Deactivate ${u.firstName} ${u.lastName}?`)) deactivateMutation.mutate(u.id) }}
                            className="p-1.5 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Deactivate"
                          >
                            <ShieldOff size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <UserFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        user={editingUser}
      />
    </div>
  )
}

function UserFormModal({ isOpen, onClose, user }) {
  const queryClient = useQueryClient()
  const { data: regions = [] } = useQuery({ queryKey: ['adminRegions'], queryFn: async () => (await adminApi.getRegions()).data, enabled: isOpen })
  const { data: departments = [] } = useQuery({ queryKey: ['adminDepartments'], queryFn: async () => (await adminApi.getDepartments()).data, enabled: isOpen })

  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '', jobTitle: '',
    role: 'EMPLOYEE', regionId: '', departmentId: '',
  })

  // Sync form when user prop changes
  useState(() => {
    if (user) {
      setForm({
        email: user.email, password: '', firstName: user.firstName, lastName: user.lastName,
        jobTitle: user.jobTitle || '', role: user.role,
        regionId: user.regionId || '', departmentId: user.departmentId || '',
      })
    }
  })

  const mutation = useMutation({
    mutationFn: (data) => user ? adminApi.updateUser(user.id, data) : adminApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers'])
      toast.success(user ? 'User updated' : 'User created')
      onClose()
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      regionId: form.regionId ? Number(form.regionId) : null,
      departmentId: form.departmentId ? Number(form.departmentId) : null,
      password: user && !form.password ? 'unchanged-keep-same' : form.password,
    }
    mutation.mutate(payload)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Edit User' : 'Add User'} size="md">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">First Name *</label>
            <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name *</label>
            <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input-field" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{user ? 'New Password (leave blank to keep)' : 'Password *'}</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" required={!user} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Job Title</label>
          <input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Role *</label>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field">
            {ROLES.map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Region</label>
            <select value={form.regionId} onChange={(e) => setForm({ ...form, regionId: e.target.value })} className="input-field">
              <option value="">None</option>
              {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} className="input-field">
              <option value="">None</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-3">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={mutation.isPending} className="btn-primary">
            {mutation.isPending ? 'Saving...' : user ? 'Update User' : 'Create User'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
