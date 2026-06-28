package com.budget.app.dto;

import com.budget.app.entity.enums.DecisionType;
import com.budget.app.entity.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalStepResponse {

    private Long id;
    private Integer level;
    private Role roleRequired;
    private Long approverId;
    private String approverName;
    private DecisionType decision;
    private String comments;
    private Instant decidedAt;
    private boolean pending;
}
