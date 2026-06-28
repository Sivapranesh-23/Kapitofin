package com.budget.app.entity;

import com.budget.app.entity.enums.BudgetStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "budgets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Budget extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fiscal_year_id")
    private FiscalYear fiscalYear;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id")
    private Department department;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BudgetStatus status;

    /** Total planned amount = sum of line items. */
    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    /** Recomputed when expenses are recorded/approved. */
    @Column(name = "spent_amount", nullable = false)
    private BigDecimal spentAmount;

    @Column(name = "committed_amount", nullable = false)
    private BigDecimal committedAmount;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @OneToMany(mappedBy = "budget", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LineItem> lineItems = new ArrayList<>();

    @OneToOne(mappedBy = "budget", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private ApprovalWorkflow workflow;

    @Transient
    public BigDecimal remainingAmount() {
        return totalAmount.subtract(spentAmount).subtract(committedAmount);
    }

    @Transient
    public BigDecimal utilizationPct() {
        if (totalAmount == null || totalAmount.signum() == 0) {
            return BigDecimal.ZERO;
        }
        return spentAmount.divide(totalAmount, 4, java.math.RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }
}
