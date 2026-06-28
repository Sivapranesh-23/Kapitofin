package com.budget.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DecisionRequest {

    @NotNull(message = "Decision type is required")
    private com.budget.app.entity.enums.DecisionType decision;

    @NotBlank(message = "Comments are required")
    private String comments;
}
