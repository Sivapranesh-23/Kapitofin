package com.budget.app.dto;

import com.budget.app.entity.enums.AlertLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertResponse {

    private Long id;
    private Long budgetId;
    private String budgetTitle;
    private String message;
    private AlertLevel level;
    private Instant triggeredAt;
}
