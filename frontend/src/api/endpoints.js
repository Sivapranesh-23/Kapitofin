import api from './client'

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
}

export const budgetsApi = {
  getAll: (params = {}) => api.get('/budgets', { params }),
  getById: (id) => api.get(`/budgets/${id}`),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
  submit: (id) => api.post(`/budgets/${id}/submit`),
}

export const approvalsApi = {
  getPending: () => api.get('/approvals/pending'),
  getWorkflow: (budgetId) => api.get(`/budgets/${budgetId}/workflow`),
  decide: (stepId, decision) => api.post(`/approvals/${stepId}/decide`, decision),
}

export const expensesApi = {
  getAll: (params = {}) => api.get('/expenses', { params }),
  create: (data) => api.post('/expenses', data),
  approve: (id) => api.post(`/expenses/${id}/approve`),
  reject: (id) => api.post(`/expenses/${id}/reject`),
}

export const transfersApi = {
  getAll: () => api.get('/transfers'),
  request: (data) => api.post('/transfers', data),
  approve: (id) => api.post(`/transfers/${id}/approve`),
  reject: (id) => api.post(`/transfers/${id}/reject`),
}

export const reportsApi = {
  dashboard: () => api.get('/reports/dashboard'),
  department: () => api.get('/reports/department'),
}

export const adminApi = {
  getUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deactivateUser: (id) => api.delete(`/admin/users/${id}`),
  getRegions: () => api.get('/admin/regions'),
  createRegion: (data) => api.post('/admin/regions', data),
  getDepartments: () => api.get('/admin/departments'),
  createDepartment: (data) => api.post('/admin/departments', data),
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  getFiscalYears: () => api.get('/admin/fiscal-years'),
  createFiscalYear: (data) => api.post('/admin/fiscal-years', data),
  lockFiscalYear: (id) => api.post(`/admin/fiscal-years/${id}/lock`),
  getAllocations: () => api.get('/admin/allocations'),
  createAllocation: (data) => api.post('/admin/allocations', data),
  getAlerts: () => api.get('/admin/alerts'),
  getAuditLogs: (params = {}) => api.get('/admin/audit-logs', { params }),
}
