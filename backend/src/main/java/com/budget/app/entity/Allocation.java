package com.budget.app.entity;

import com.budget.app.entity.enums.AllocationScope;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(
    name = "allocations",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_allocation_scope",
        columnNames = {"fiscal_year_id", "scope", "ref_id"}
    )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Allocation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fiscal_year_id")
    private FiscalYear fiscalYear;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AllocationScope scope;

    /** Region id or department id depending on {@link #scope}. */
    @Column(name = "ref_id", nullable = false)
    private Long refId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Transient
    public String label() {
        return scope + " #" + refId;
    }
}
