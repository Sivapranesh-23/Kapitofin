package com.budget.app.entity.enums;

/**
 * User roles, ordered from lowest to highest privilege. The ordinal matters
 * because higher-privilege roles inherit lower-privilege capabilities.
 */
public enum Role {
    EMPLOYEE,
    BUDGET_ANALYST,
    DEPARTMENT_HEAD,
    REGIONAL_FINANCE_MANAGER,
    FINANCE_DIRECTOR,
    SUPER_ADMIN;

    /** True if {@code this} role has at least the privileges of {@code other}. */
    public boolean isAtLeast(Role other) {
        return this.ordinal() >= other.ordinal();
    }
}
