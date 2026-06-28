package com.budget.app.service;

import com.budget.app.dto.*;
import com.budget.app.entity.*;
import com.budget.app.entity.enums.*;
import com.budget.app.exception.*;
import com.budget.app.repository.*;
import com.budget.app.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApprovalService {

    private final ApprovalWorkflowRepository workflowRepository;
    private final ApprovalStepRepository stepRepository;
    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;
    private final AuditLogService auditLogService;

    /* ================= WORKFLOW QUERIES ================= */

    public ApprovalWorkflowResponse getWorkflowByBudget(Long budgetId) {
        ApprovalWorkflow wf = workflowRepository.findByBudgetId(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("ApprovalWorkflow for budget", budgetId));
        return toResponse(wf);
    }

    public List<ApprovalWorkflowResponse> getPendingApprovals() {
        User currentUser = securityUtils.getCurrentUser();
        return workflowRepository.findAll().stream()
                .filter(w -> w.getStatus() == WorkflowStatus.IN_PROGRESS)
                .filter(w -> {
                    // Check if current user's role matches the current level
                    ApprovalStep currentStep = w.getSteps().stream()
                            .filter(s -> s.getLevel().equals(w.getCurrentLevel()))
                            .findFirst().orElse(null);
                    return currentStep != null && currentStep.getDecision() == null
                            && currentStep.getRoleRequired().ordinal() <= currentUser.getRole().ordinal();
                })
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /* ================= DECISION ================= */

    @Transactional
    public ApprovalWorkflowResponse makeDecision(Long stepId, DecisionRequest request) {
        User currentUser = securityUtils.getCurrentUser();

        ApprovalStep step = stepRepository.findById(stepId)
                .orElseThrow(() -> new ResourceNotFoundException("ApprovalStep", stepId));

        if (step.getDecision() != null) {
            throw new BusinessException("This step has already been decided");
        }

        if (step.getRoleRequired().ordinal() > currentUser.getRole().ordinal()) {
            throw new UnauthorizedException("You do not have the required role to approve at this level");
        }

        step.setDecision(request.getDecision());
        step.setComments(request.getComments());
        step.setApprover(currentUser);
        step.setDecidedAt(Instant.now());
        stepRepository.save(step);

        ApprovalWorkflow workflow = step.getWorkflow();
        Budget budget = workflow.getBudget();

        switch (request.getDecision()) {
            case APPROVE -> {
                // Move to next level or finalize
                if (step.getLevel() < workflow.getSteps().size()) {
                    workflow.setCurrentLevel(step.getLevel() + 1);
                    workflowRepository.save(workflow);
                    auditLogService.log("APPROVE_STEP", "ApprovalWorkflow", workflow.getId(),
                            "Level " + step.getLevel() + " approved by " + currentUser.fullName());
                } else {
                    // All levels approved
                    workflow.setStatus(WorkflowStatus.APPROVED);
                    workflowRepository.save(workflow);
                    budget.setStatus(BudgetStatus.APPROVED);
                    budgetRepository.save(budget);
                    auditLogService.log("APPROVE_BUDGET", "Budget", budget.getId(),
                            "Budget fully approved: " + budget.getTitle());
                }
            }
            case REJECT -> {
                workflow.setStatus(WorkflowStatus.REJECTED);
                workflowRepository.save(workflow);
                budget.setStatus(BudgetStatus.REJECTED);
                budgetRepository.save(budget);
                auditLogService.log("REJECT_BUDGET", "Budget", budget.getId(),
                        "Budget rejected at level " + step.getLevel() + ": " + request.getComments());
            }
            case REQUEST_INFO -> {
                workflow.setStatus(WorkflowStatus.INFO_REQUESTED);
                workflowRepository.save(workflow);
                budget.setStatus(BudgetStatus.DRAFT);
                budgetRepository.save(budget);
                auditLogService.log("REQUEST_INFO", "Budget", budget.getId(),
                        "More information requested at level " + step.getLevel() + ": " + request.getComments());
            }
        }

        return toResponse(workflowRepository.findById(workflow.getId()).orElse(workflow));
    }

    /* ================= HELPER ================= */

    private ApprovalWorkflowResponse toResponse(ApprovalWorkflow wf) {
        List<ApprovalStepResponse> stepResponses = wf.getSteps().stream()
                .map(s -> ApprovalStepResponse.builder()
                        .id(s.getId())
                        .level(s.getLevel())
                        .roleRequired(s.getRoleRequired())
                        .approverId(s.getApprover() != null ? s.getApprover().getId() : null)
                        .approverName(s.getApprover() != null ? s.getApprover().fullName() : null)
                        .decision(s.getDecision())
                        .comments(s.getComments())
                        .decidedAt(s.getDecidedAt())
                        .pending(s.isPending())
                        .build())
                .collect(Collectors.toList());

        return ApprovalWorkflowResponse.builder()
                .id(wf.getId())
                .budgetId(wf.getBudget().getId())
                .currentLevel(wf.getCurrentLevel())
                .status(wf.getStatus())
                .steps(stepResponses)
                .build();
    }
}
