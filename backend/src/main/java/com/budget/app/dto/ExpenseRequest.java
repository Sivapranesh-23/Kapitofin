package com.budget.app.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseRequest {

    @NotNull(message = "Budget ID is required")
    private Long budgetId;

    private Long lineItemId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be positive")
    private BigDecimal amount;

    @Size(max = 1000)
    private String description;

    private String vendor;

    private String invoiceNumber;

    @NotNull(message = "Expense date is required")
    private LocalDate expenseDate;
}
