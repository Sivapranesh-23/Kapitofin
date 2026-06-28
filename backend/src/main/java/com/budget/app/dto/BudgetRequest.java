package com.budget.app.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200)
    private String title;

    @Size(max = 2000)
    private String description;

    @NotNull(message = "Fiscal year ID is required")
    private Long fiscalYearId;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    @NotEmpty(message = "At least one line item is required")
    @Valid
    private List<LineItemRequest> lineItems;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LineItemRequest {

        @NotBlank(message = "Line item name is required")
        @Size(max = 200)
        private String name;

        @Size(max = 1000)
        private String description;

        @NotNull(message = "Category ID is required")
        private Long categoryId;

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be positive")
        private BigDecimal amount;
    }
}
