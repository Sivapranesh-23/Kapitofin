package com.budget.app.dto;

import com.budget.app.entity.enums.ExpenseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponse {

    private Long id;
    private Long budgetId;
    private String budgetTitle;
    private Long lineItemId;
    private String lineItemName;
    private BigDecimal amount;
    private String description;
    private String vendor;
    private String invoiceNumber;
    private LocalDate expenseDate;
    private ExpenseStatus status;
    private Long createdById;
    private String createdByFullName;
    private Instant createdAt;
}
