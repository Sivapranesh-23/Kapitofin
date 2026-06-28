import clsx from 'clsx'

/**
 * Format a number as USD currency.
 */
export function formatCurrency(value) {
  if (value == null) return '$0'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Format a percentage with 1 decimal.
 */
export function formatPercent(value) {
  if (value == null) return '0%'
  return `${Number(value).toFixed(1)}%`
}

/**
 * Format a date string or Instant.
 */
export function formatDate(value) {
  if (!value) return '—'
  try {
    const d = new Date(value)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return value
  }
}

/**
 * Format a timestamp to date + time.
 */
export function formatDateTime(value) {
  if (!value) return '—'
  try {
    const d = new Date(value)
    return d.toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return value
  }
}

/**
 * Role display label.
 */
export const roleLabels = {
  EMPLOYEE: 'Employee',
  BUDGET_ANALYST: 'Budget Analyst',
  DEPARTMENT_HEAD: 'Department Head',
  REGIONAL_FINANCE_MANAGER: 'Regional Finance Manager',
  FINANCE_DIRECTOR: 'Finance Director',
  SUPER_ADMIN: 'Super Admin',
}

/**
 * Budget status color classes.
 */
export function getStatusColor(status) {
  const map = {
    DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    SUBMITTED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    APPROVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    CLOSED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

/**
 * Get utilization bar color.
 */
export function getUtilColor(pct) {
  if (pct >= 90) return 'bg-red-500'
  if (pct >= 75) return 'bg-yellow-500'
  return 'bg-green-500'
}

/**
 * clsx wrapper.
 */
export function cn(...inputs) {
  return clsx(inputs)
}
