package com.budget.app.dto;

import com.budget.app.entity.enums.BudgetStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetResponse {

    private Long id;
    private String title;
    private String description;
    private Long fiscalYearId;
    private Integer fiscalYear;
    private Long departmentId;
    private String departmentName;
    private String regionName;
    private BudgetStatus status;
    private BigDecimal totalAmount;
    private BigDecimal spentAmount;
    private BigDecimal committedAmount;
    private BigDecimal remainingAmount;
    private BigDecimal utilizationPct;
    private Long createdById;
    private String createdByFullName;
    private Instant createdAt;
    private Instant updatedAt;
    private List<LineItemResponse> lineItems;
}
