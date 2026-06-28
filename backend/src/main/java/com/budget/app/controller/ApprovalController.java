package com.budget.app.controller;

import com.budget.app.dto.ApprovalWorkflowResponse;
import com.budget.app.dto.DecisionRequest;
import com.budget.app.service.ApprovalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalService approvalService;

    @GetMapping("/approvals/pending")
    public ResponseEntity<List<ApprovalWorkflowResponse>> getPendingApprovals() {
        return ResponseEntity.ok(approvalService.getPendingApprovals());
    }

    @GetMapping("/budgets/{budgetId}/workflow")
    public ResponseEntity<ApprovalWorkflowResponse> getWorkflow(@PathVariable Long budgetId) {
        return ResponseEntity.ok(approvalService.getWorkflowByBudget(budgetId));
    }

    @PostMapping("/approvals/{stepId}/decide")
    public ResponseEntity<ApprovalWorkflowResponse> decide(
            @PathVariable Long stepId,
            @Valid @RequestBody DecisionRequest request) {
        return ResponseEntity.ok(approvalService.makeDecision(stepId, request));
    }
}
