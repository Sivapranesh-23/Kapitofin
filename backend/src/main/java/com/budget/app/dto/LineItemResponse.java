package com.budget.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LineItemResponse {

    private Long id;
    private String name;
    private String description;
    private Long budgetId;
    private Long categoryId;
    private String categoryName;
    private String categoryColorHex;
    private BigDecimal amount;
    private BigDecimal spentAmount;
    private BigDecimal committedAmount;
    private BigDecimal remainingAmount;
}
