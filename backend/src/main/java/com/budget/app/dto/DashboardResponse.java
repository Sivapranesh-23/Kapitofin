package com.budget.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    private BigDecimal totalBudget;
    private BigDecimal totalSpent;
    private BigDecimal totalCommitted;
    private BigDecimal totalRemaining;
    private BigDecimal overallUtilizationPct;
    private List<BudgetOverviewDto> departmentBudgets;
    private List<AlertDto> recentAlerts;
    private int pendingApprovals;
    private int draftBudgets;
    private int approvedBudgets;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BudgetOverviewDto {
        private Long departmentId;
        private String departmentName;
        private BigDecimal totalBudget;
        private BigDecimal spent;
        private BigDecimal remaining;
        private BigDecimal utilizationPct;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlertDto {
        private Long id;
        private Long budgetId;
        private String budgetTitle;
        private String message;
        private String level;
        private java.time.Instant triggeredAt;
    }
}
