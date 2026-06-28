package com.budget.app.dto;

import com.budget.app.entity.enums.WorkflowStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalWorkflowResponse {

    private Long id;
    private Long budgetId;
    private Integer currentLevel;
    private WorkflowStatus status;
    private List<ApprovalStepResponse> steps;
}
