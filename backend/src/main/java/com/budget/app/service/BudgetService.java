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
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final LineItemRepository lineItemRepository;
    private final FiscalYearRepository fiscalYearRepository;
    private final DepartmentRepository departmentRepository;
    private final CategoryRepository categoryRepository;
    private final AllocationRepository allocationRepository;
    private final ApprovalWorkflowRepository workflowRepository;
    private final ApprovalStepRepository stepRepository;
    private final UserRepository userRepository;
    private final AlertRepository alertRepository;
    private final SecurityUtils securityUtils;
    private final AuditLogService auditLogService;

    @Value("${app.approval.l2-threshold}")
    private BigDecimal l2Threshold;

    @Value("${app.approval.l3-threshold}")
    private BigDecimal l3Threshold;

    @Value("${app.approval.alert-threshold}")
    private double alertThreshold;

    /* ================= CREATE / UPDATE ================= */

    @Transactional
    public BudgetResponse createBudget(BudgetRequest request) {
        User creator = securityUtils.getCurrentUser();
        FiscalYear fy = fiscalYearRepository.findById(request.getFiscalYearId())
                .orElseThrow(() -> new ResourceNotFoundException("FiscalYear", request.getFiscalYearId()));
        if (fy.getStatus() == FiscalYearStatus.LOCKED) {
            throw new BusinessException("Cannot create budget for a locked fiscal year");
        }
        Department dept = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", request.getDepartmentId()));

        // Calculate total from line items
        BigDecimal totalAmount = request.getLineItems().stream()
                .map(BudgetRequest.LineItemRequest::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Validate against department allocation
        validateAgainstAllocation(fy.getId(), dept.getId(), totalAmount);

        Budget budget = Budget.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .fiscalYear(fy)
                .department(dept)
                .status(BudgetStatus.DRAFT)
                .totalAmount(totalAmount)
                .spentAmount(BigDecimal.ZERO)
                .committedAmount(BigDecimal.ZERO)
                .createdBy(creator)
                .build();

        budget = budgetRepository.save(budget);

        // Create line items
        for (BudgetRequest.LineItemRequest liReq : request.getLineItems()) {
            Category cat = categoryRepository.findById(liReq.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", liReq.getCategoryId()));
            LineItem li = LineItem.builder()
                    .name(liReq.getName())
                    .description(liReq.getDescription())
                    .budget(budget)
                    .category(cat)
                    .amount(liReq.getAmount())
                    .spentAmount(BigDecimal.ZERO)
                    .committedAmount(BigDecimal.ZERO)
                    .build();
            budget.getLineItems().add(li);
        }

        budget = budgetRepository.save(budget);
        auditLogService.log("CREATE_BUDGET", "Budget", budget.getId(), "Created budget: " + budget.getTitle());
        return toResponse(budget);
    }

    @Transactional
    public BudgetResponse updateBudget(Long budgetId, BudgetRequest request) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", budgetId));

        if (budget.getStatus() != BudgetStatus.DRAFT) {
            throw new BusinessException("Can only edit DRAFT budgets");
        }

        // Validate amounts against allocation
        BigDecimal totalAmount = request.getLineItems().stream()
                .map(BudgetRequest.LineItemRequest::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        validateAgainstAllocation(budget.getFiscalYear().getId(), budget.getDepartment().getId(), totalAmount);

        budget.setTitle(request.getTitle());
        budget.setDescription(request.getDescription());
        budget.setTotalAmount(totalAmount);

        // Remove old line items and create new
        budget.getLineItems().clear();

        for (BudgetRequest.LineItemRequest liReq : request.getLineItems()) {
            Category cat = categoryRepository.findById(liReq.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", liReq.getCategoryId()));
            LineItem li = LineItem.builder()
                    .name(liReq.getName())
                    .description(liReq.getDescription())
                    .budget(budget)
                    .category(cat)
                    .amount(liReq.getAmount())
                    .spentAmount(BigDecimal.ZERO)
                    .committedAmount(BigDecimal.ZERO)
                    .build();
            budget.getLineItems().add(li);
        }

        budget = budgetRepository.save(budget);
        auditLogService.log("UPDATE_BUDGET", "Budget", budget.getId(), "Updated budget: " + budget.getTitle());
        return toResponse(budget);
    }

    /* ================= SUBMIT ================= */

    @Transactional
    public BudgetResponse submitBudget(Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", budgetId));

        if (budget.getStatus() != BudgetStatus.DRAFT) {
            throw new BusinessException("Only DRAFT budgets can be submitted");
        }

        budget.setStatus(BudgetStatus.SUBMITTED);
        budgetRepository.save(budget);

        // Create approval workflow
        ApprovalWorkflow workflow = ApprovalWorkflow.builder()
                .budget(budget)
                .currentLevel(1)
                .status(WorkflowStatus.IN_PROGRESS)
                .build();

        // L1: Department Head — always
        addStep(workflow, 1, Role.DEPARTMENT_HEAD);

        // L2: Regional Finance Manager — if amount > l2Threshold
        if (budget.getTotalAmount().compareTo(l2Threshold) > 0) {
            addStep(workflow, 2, Role.REGIONAL_FINANCE_MANAGER);
        }

        // L3: Finance Director — if amount > l3Threshold
        if (budget.getTotalAmount().compareTo(l3Threshold) > 0) {
            addStep(workflow, 3, Role.FINANCE_DIRECTOR);
        }

        workflowRepository.save(workflow);
        budget.setWorkflow(workflow);
        budgetRepository.save(budget);

        auditLogService.log("SUBMIT_BUDGET", "Budget", budget.getId(),
                "Submitted budget: " + budget.getTitle() + " ($" + budget.getTotalAmount() + ")");
        return toResponse(budget);
    }

    private void addStep(ApprovalWorkflow workflow, int level, Role role) {
        ApprovalStep step = ApprovalStep.builder()
                .workflow(workflow)
                .level(level)
                .roleRequired(role)
                .build();
        workflow.getSteps().add(step);
    }

    /* ================= QUERIES ================= */

    public List<BudgetResponse> getAllBudgets() {
        return budgetRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public BudgetResponse getBudgetById(Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", budgetId));
        return toResponse(budget);
    }

    public List<BudgetResponse> getBudgetsByDepartment(Long departmentId) {
        return budgetRepository.findByDepartmentId(departmentId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<BudgetResponse> getBudgetsByRegion(Long regionId) {
        return budgetRepository.findByRegionId(regionId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<BudgetResponse> getBudgetsByFiscalYear(Long fiscalYearId) {
        return budgetRepository.findByFiscalYearId(fiscalYearId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<BudgetResponse> getBudgetsByStatus(String status) {
        return budgetRepository.findByStatus(BudgetStatus.valueOf(status)).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public void deleteBudget(Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", budgetId));
        if (budget.getStatus() != BudgetStatus.DRAFT) {
            throw new BusinessException("Can only delete DRAFT budgets");
        }
        auditLogService.log("DELETE_BUDGET", "Budget", budgetId, "Deleted budget: " + budget.getTitle());
        budgetRepository.delete(budget);
    }

    /* ================= HELPERS ================= */

    private void validateAgainstAllocation(Long fiscalYearId, Long departmentId, BigDecimal requestedTotal) {
        var alloc = allocationRepository.findByFiscalYearIdAndScopeAndRefId(
                fiscalYearId, AllocationScope.DEPARTMENT, departmentId);
        if (alloc.isEmpty()) {
            throw new BusinessException("No allocation found for this department in this fiscal year");
        }
        BigDecimal available = alloc.get().getAmount();
        // Check if requested + existing budgets for this dept/fy <= allocation
        BigDecimal existing = budgetRepository.findByDepartmentId(departmentId).stream()
                .filter(b -> b.getFiscalYear().getId().equals(fiscalYearId))
                .filter(b -> b.getStatus() != BudgetStatus.REJECTED && b.getStatus() != BudgetStatus.CLOSED)
                .map(Budget::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (existing.add(requestedTotal).compareTo(available) > 0) {
            throw new BusinessException("Total budget ($" + existing.add(requestedTotal) +
                    ") exceeds department allocation ($" + available + ")");
        }
    }

    private BudgetResponse toResponse(Budget b) {
        return BudgetResponse.builder()
                .id(b.getId())
                .title(b.getTitle())
                .description(b.getDescription())
                .fiscalYearId(b.getFiscalYear().getId())
                .fiscalYear(b.getFiscalYear().getYear())
                .departmentId(b.getDepartment().getId())
                .departmentName(b.getDepartment().getName())
                .regionName(b.getDepartment().getRegion() != null ? b.getDepartment().getRegion().getName() : null)
                .status(b.getStatus())
                .totalAmount(b.getTotalAmount())
                .spentAmount(b.getSpentAmount())
                .committedAmount(b.getCommittedAmount())
                .remainingAmount(b.remainingAmount())
                .utilizationPct(b.utilizationPct())
                .createdById(b.getCreatedBy().getId())
                .createdByFullName(b.getCreatedBy().fullName())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .lineItems(b.getLineItems().stream().map(this::toLineItemResponse).collect(Collectors.toList()))
                .build();
    }

    private LineItemResponse toLineItemResponse(LineItem li) {
        return LineItemResponse.builder()
                .id(li.getId())
                .name(li.getName())
                .description(li.getDescription())
                .budgetId(li.getBudget().getId())
                .categoryId(li.getCategory().getId())
                .categoryName(li.getCategory().getName())
                .categoryColorHex(li.getCategory().getColorHex())
                .amount(li.getAmount())
                .spentAmount(li.getSpentAmount())
                .committedAmount(li.getCommittedAmount())
                .remainingAmount(li.remainingAmount())
                .build();
    }
}
