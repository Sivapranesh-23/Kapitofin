package com.budget.app.dto;

import com.budget.app.entity.enums.TransferStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransferResponse {

    private Long id;
    private Long fromBudgetId;
    private String fromBudgetTitle;
    private Long toBudgetId;
    private String toBudgetTitle;
    private BigDecimal amount;
    private TransferStatus status;
    private Long requestedById;
    private String requestedByFullName;
    private String reason;
    private Instant createdAt;
}
