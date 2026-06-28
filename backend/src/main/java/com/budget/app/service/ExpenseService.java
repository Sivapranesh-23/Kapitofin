package com.budget.app.service;

import com.budget.app.dto.*;
import com.budget.app.entity.*;
import com.budget.app.entity.enums.*;
import com.budget.app.exception.*;
import com.budget.app.repository.*;
import com.budget.app.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private final LineItemRepository lineItemRepository;
    private final AlertRepository alertRepository;
    private final SecurityUtils securityUtils;
    private final AuditLogService auditLogService;

    @Value("${app.approval.alert-threshold}")
    private double alertThreshold;

    @Transactional
    public ExpenseResponse createExpense(ExpenseRequest request) {
        User creator = securityUtils.getCurrentUser();
        Budget budget = budgetRepository.findById(request.getBudgetId())
                .orElseThrow(() -> new ResourceNotFoundException("Budget", request.getBudgetId()));

        if (budget.getStatus() != BudgetStatus.APPROVED) {
            throw new BusinessException("Can only record expenses against APPROVED budgets");
        }

        LineItem lineItem = null;
        if (request.getLineItemId() != null) {
            lineItem = lineItemRepository.findById(request.getLineItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("LineItem", request.getLineItemId()));
            if (!lineItem.getBudget().getId().equals(budget.getId())) {
                throw new BusinessException("Line item does not belong to this budget");
            }
            // Check remaining on line item
            BigDecimal lineRemaining = lineItem.remainingAmount();
            if (request.getAmount().compareTo(lineRemaining) > 0) {
                throw new BusinessException("Expense amount ($" + request.getAmount() +
                        ") exceeds line item remaining budget ($" + lineRemaining + ")");
            }
        }

        // Check remaining on budget
        BigDecimal budgetRemaining = budget.remainingAmount();
        if (request.getAmount().compareTo(budgetRemaining) > 0) {
            throw new BusinessException("Expense amount ($" + request.getAmount() +
                    ") exceeds budget remaining ($" + budgetRemaining + ")");
        }

        Expense expense = Expense.builder()
                .budget(budget)
                .lineItem(lineItem)
                .amount(request.getAmount())
                .description(request.getDescription())
                .vendor(request.getVendor())
                .invoiceNumber(request.getInvoiceNumber())
                .expenseDate(request.getExpenseDate())
                .status(ExpenseStatus.PENDING)
                .createdBy(creator)
                .build();

        expense = expenseRepository.save(expense);

        // Update budget spent amount
        budget.setSpentAmount(budget.getSpentAmount().add(request.getAmount()));
        budgetRepository.save(budget);

        // Update line item spent amount
        if (lineItem != null) {
            lineItem.setSpentAmount(lineItem.getSpentAmount().add(request.getAmount()));
            lineItemRepository.save(lineItem);
        }

        // Check alert threshold
        BigDecimal util = budget.utilizationPct();
        if (util.doubleValue() >= (alertThreshold * 100)) {
            String level = util.doubleValue() >= 100 ? "CRITICAL" : "WARNING";
            Alert alert = Alert.builder()
                    .budget(budget)
                    .message("Budget '" + budget.getTitle() + "' is at " +
                            util.setScale(1, BigDecimal.ROUND_HALF_UP) + "% utilization (" + level + ")")
                    .level("CRITICAL".equals(level) ? AlertLevel.CRITICAL : AlertLevel.WARNING)
                    .triggeredAt(java.time.Instant.now())
                    .build();
            alertRepository.save(alert);
        }

        auditLogService.log("CREATE_EXPENSE", "Expense", expense.getId(),
                "Recorded $" + request.getAmount() + " expense against budget: " + budget.getTitle());

        return toResponse(expense);
    }

    @Transactional
    public ExpenseResponse approveExpense(Long expenseId) {
        User user = securityUtils.getCurrentUser();
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", expenseId));

        if (expense.getStatus() != ExpenseStatus.PENDING) {
            throw new BusinessException("Expense is not in PENDING status");
        }

        expense.setStatus(ExpenseStatus.APPROVED);
        expense = expenseRepository.save(expense);

        auditLogService.log("APPROVE_EXPENSE", "Expense", expenseId,
                "Expense approved by " + user.fullName());
        return toResponse(expense);
    }

    @Transactional
    public ExpenseResponse rejectExpense(Long expenseId) {
        User user = securityUtils.getCurrentUser();
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", expenseId));

        if (expense.getStatus() != ExpenseStatus.PENDING) {
            throw new BusinessException("Expense is not in PENDING status");
        }

        expense.setStatus(ExpenseStatus.REJECTED);

        // Reverse the spent amount on budget and line item
        Budget budget = expense.getBudget();
        budget.setSpentAmount(budget.getSpentAmount().subtract(expense.getAmount()));
        budgetRepository.save(budget);

        if (expense.getLineItem() != null) {
            LineItem li = expense.getLineItem();
            li.setSpentAmount(li.getSpentAmount().subtract(expense.getAmount()));
            lineItemRepository.save(li);
        }

        expense = expenseRepository.save(expense);

        auditLogService.log("REJECT_EXPENSE", "Expense", expenseId,
                "Expense rejected by " + user.fullName() + " — amount reversed");
        return toResponse(expense);
    }

    public List<ExpenseResponse> getExpensesByBudget(Long budgetId) {
        return expenseRepository.findByBudgetId(budgetId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<ExpenseResponse> getExpensesByDepartment(Long departmentId) {
        return expenseRepository.findByDepartmentId(departmentId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<ExpenseResponse> getMyExpenses() {
        User user = securityUtils.getCurrentUser();
        return expenseRepository.findByCreatedById(user.getId()).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    private ExpenseResponse toResponse(Expense e) {
        return ExpenseResponse.builder()
                .id(e.getId())
                .budgetId(e.getBudget().getId())
                .budgetTitle(e.getBudget().getTitle())
                .lineItemId(e.getLineItem() != null ? e.getLineItem().getId() : null)
                .lineItemName(e.getLineItem() != null ? e.getLineItem().getName() : null)
                .amount(e.getAmount())
                .description(e.getDescription())
                .vendor(e.getVendor())
                .invoiceNumber(e.getInvoiceNumber())
                .expenseDate(e.getExpenseDate())
                .status(e.getStatus())
                .createdById(e.getCreatedBy().getId())
                .createdByFullName(e.getCreatedBy().fullName())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
