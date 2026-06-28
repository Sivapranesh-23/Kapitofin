package com.budget.app.service;

import com.budget.app.dto.*;
import com.budget.app.entity.*;
import com.budget.app.entity.enums.*;
import com.budget.app.repository.*;
import com.budget.app.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;
    private final AlertRepository alertRepository;
    private final ApprovalWorkflowRepository workflowRepository;
    private final DepartmentRepository departmentRepository;
    private final SecurityUtils securityUtils;

    public DashboardResponse getDashboard() {
        User user = securityUtils.getCurrentUser();
        List<Budget> budgets = filterBudgetsByRole(user);

        BigDecimal totalBudget = BigDecimal.ZERO;
        BigDecimal totalSpent = BigDecimal.ZERO;
        BigDecimal totalCommitted = BigDecimal.ZERO;
        int pendingApprovals = 0;
        int draftCount = 0;
        int approvedCount = 0;

        for (Budget b : budgets) {
            totalBudget = totalBudget.add(b.getTotalAmount());
            totalSpent = totalSpent.add(b.getSpentAmount());
            totalCommitted = totalCommitted.add(b.getCommittedAmount());
            if (b.getStatus() == BudgetStatus.SUBMITTED) pendingApprovals++;
            if (b.getStatus() == BudgetStatus.DRAFT) draftCount++;
            if (b.getStatus() == BudgetStatus.APPROVED) approvedCount++;
        }

        BigDecimal totalRemaining = totalBudget.subtract(totalSpent).subtract(totalCommitted);
        BigDecimal overallUtil = totalBudget.signum() > 0
                ? totalSpent.divide(totalBudget, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        // Department breakdown
        Map<Long, List<Budget>> byDept = budgets.stream()
                .collect(Collectors.groupingBy(b -> b.getDepartment().getId()));

        List<DashboardResponse.BudgetOverviewDto> deptOverviews = byDept.entrySet().stream()
                .map(entry -> {
                    List<Budget> deptBudgets = entry.getValue();
                    BigDecimal deptTotal = deptBudgets.stream().map(Budget::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal deptSpent = deptBudgets.stream().map(Budget::getSpentAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal deptRemaining = deptTotal.subtract(deptSpent);
                    BigDecimal deptUtil = deptTotal.signum() > 0
                            ? deptSpent.divide(deptTotal, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                            : BigDecimal.ZERO;
                    return DashboardResponse.BudgetOverviewDto.builder()
                            .departmentId(entry.getKey())
                            .departmentName(deptBudgets.get(0).getDepartment().getName())
                            .totalBudget(deptTotal)
                            .spent(deptSpent)
                            .remaining(deptRemaining)
                            .utilizationPct(deptUtil)
                            .build();
                })
                .collect(Collectors.toList());

        // Recent alerts
        List<DashboardResponse.AlertDto> recentAlerts = alertRepository.findAllByOrderByTriggeredAtDesc().stream()
                .limit(10)
                .map(a -> DashboardResponse.AlertDto.builder()
                        .id(a.getId())
                        .budgetId(a.getBudget().getId())
                        .budgetTitle(a.getBudget().getTitle())
                        .message(a.getMessage())
                        .level(a.getLevel().name())
                        .triggeredAt(a.getTriggeredAt())
                        .build())
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .totalBudget(totalBudget)
                .totalSpent(totalSpent)
                .totalCommitted(totalCommitted)
                .totalRemaining(totalRemaining)
                .overallUtilizationPct(overallUtil)
                .departmentBudgets(deptOverviews)
                .recentAlerts(recentAlerts)
                .pendingApprovals(pendingApprovals)
                .draftBudgets(draftCount)
                .approvedBudgets(approvedCount)
                .build();
    }

    public ReportResponse getDepartmentReport() {
        List<Department> departments = departmentRepository.findAll();

        List<ReportResponse.DepartmentReportDto> dtos = departments.stream()
                .map(dept -> {
                    List<Budget> budgets = budgetRepository.findByDepartmentId(dept.getId());
                    BigDecimal allocated = budgets.stream().map(Budget::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal spent = budgets.stream().map(Budget::getSpentAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal committed = budgets.stream().map(Budget::getCommittedAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal remaining = allocated.subtract(spent).subtract(committed);
                    BigDecimal variance = allocated.subtract(spent);
                    BigDecimal util = allocated.signum() > 0
                            ? spent.divide(allocated, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                            : BigDecimal.ZERO;
                    String status = util.compareTo(BigDecimal.valueOf(90)) > 0 ? "Over Budget"
                            : util.compareTo(BigDecimal.valueOf(75)) > 0 ? "Watch Closely" : "On Track";

                    return ReportResponse.DepartmentReportDto.builder()
                            .departmentId(dept.getId())
                            .departmentName(dept.getName())
                            .regionName(dept.getRegion() != null ? dept.getRegion().getName() : "N/A")
                            .allocated(allocated)
                            .spent(spent)
                            .committed(committed)
                            .remaining(remaining)
                            .variance(variance)
                            .utilizationPct(util)
                            .status(status)
                            .build();
                })
                .collect(Collectors.toList());

        return ReportResponse.builder()
                .title("Department Budget Report")
                .departments(dtos)
                .build();
    }

    private List<Budget> filterBudgetsByRole(User user) {
        switch (user.getRole()) {
            case SUPER_ADMIN:
            case FINANCE_DIRECTOR:
                return budgetRepository.findAll();
            case REGIONAL_FINANCE_MANAGER:
                return user.getRegion() != null
                        ? budgetRepository.findByRegionId(user.getRegion().getId())
                        : budgetRepository.findAll();
            case DEPARTMENT_HEAD:
            case BUDGET_ANALYST:
                return user.getDepartment() != null
                        ? budgetRepository.findByDepartmentId(user.getDepartment().getId())
                        : budgetRepository.findAll();
            case EMPLOYEE:
            default:
                return user.getDepartment() != null
                        ? budgetRepository.findByDepartmentId(user.getDepartment().getId())
                        : List.of();
        }
    }
}
