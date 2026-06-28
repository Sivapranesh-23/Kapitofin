/**
 * Role hierarchy (higher number = more privilege).
 */
const ROLE_ORDER = {
  EMPLOYEE: 0,
  BUDGET_ANALYST: 1,
  DEPARTMENT_HEAD: 2,
  REGIONAL_FINANCE_MANAGER: 3,
  FINANCE_DIRECTOR: 4,
  SUPER_ADMIN: 5,
}

/**
 * Check if a user's role has at least the minimum required level.
 */
export function hasMinRole(userRole, minRole) {
  return (ROLE_ORDER[userRole] || 0) >= (ROLE_ORDER[minRole] || 0)
}

/**
 * Permission map for each role.
 */
const PERMISSIONS = {
  EMPLOYEE: {
    canViewBudgets: true,
    canCreateBudgets: false,
    canEditBudgets: false,
    canDeleteBudgets: false,
    canSubmitBudgets: false,
    canApprove: false,
    canRecordExpenses: true,
    canApproveExpenses: false,
    canViewReports: false,
    canTransfer: false,
    canManageUsers: false,
    canManageOrg: false,
    canViewAuditLog: false,
  },
  BUDGET_ANALYST: {
    canViewBudgets: true,
    canCreateBudgets: true,
    canEditBudgets: true,
    canDeleteBudgets: true,
    canSubmitBudgets: true,
    canApprove: false,
    canRecordExpenses: true,
    canApproveExpenses: false,
    canViewReports: true,
    canTransfer: false,
    canManageUsers: false,
    canManageOrg: false,
    canViewAuditLog: false,
  },
  DEPARTMENT_HEAD: {
    canViewBudgets: true,
    canCreateBudgets: true,
    canEditBudgets: true,
    canDeleteBudgets: true,
    canSubmitBudgets: true,
    canApprove: true,
    canRecordExpenses: true,
    canApproveExpenses: true,
    canViewReports: true,
    canTransfer: true,
    canManageUsers: false,
    canManageOrg: false,
    canViewAuditLog: false,
  },
  REGIONAL_FINANCE_MANAGER: {
    canViewBudgets: true,
    canCreateBudgets: true,
    canEditBudgets: true,
    canDeleteBudgets: true,
    canSubmitBudgets: true,
    canApprove: true,
    canRecordExpenses: true,
    canApproveExpenses: true,
    canViewReports: true,
    canTransfer: true,
    canManageUsers: false,
    canManageOrg: false,
    canViewAuditLog: false,
  },
  FINANCE_DIRECTOR: {
    canViewBudgets: true,
    canCreateBudgets: true,
    canEditBudgets: true,
    canDeleteBudgets: true,
    canSubmitBudgets: true,
    canApprove: true,
    canRecordExpenses: true,
    canApproveExpenses: true,
    canViewReports: true,
    canTransfer: true,
    canManageUsers: false,
    canManageOrg: true,
    canViewAuditLog: true,
  },
  SUPER_ADMIN: {
    canViewBudgets: true,
    canCreateBudgets: true,
    canEditBudgets: true,
    canDeleteBudgets: true,
    canSubmitBudgets: true,
    canApprove: true,
    canRecordExpenses: true,
    canApproveExpenses: true,
    canViewReports: true,
    canTransfer: true,
    canManageUsers: true,
    canManageOrg: true,
    canViewAuditLog: true,
  },
}

/**
 * Get permissions for a role.
 */
export function getPermissions(role) {
  return PERMISSIONS[role] || PERMISSIONS.EMPLOYEE
}

/**
 * Check if a user has a specific permission.
 */
export function can(userRole, permission) {
  return getPermissions(userRole)?.[permission] || false
}
