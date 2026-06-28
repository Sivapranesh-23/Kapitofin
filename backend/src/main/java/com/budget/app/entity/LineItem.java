package com.budget.app.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "line_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LineItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "budget_id")
    private Budget budget;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "spent_amount", nullable = false)
    private BigDecimal spentAmount;

    @Column(name = "committed_amount", nullable = false)
    private BigDecimal committedAmount;

    @Transient
    public BigDecimal remainingAmount() {
        return amount.subtract(spentAmount).subtract(committedAmount);
    }
}
