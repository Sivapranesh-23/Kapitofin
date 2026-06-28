package com.budget.app.entity;

import com.budget.app.entity.enums.FiscalYearStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "fiscal_years")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FiscalYear extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Integer year;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FiscalYearStatus status;

    @Column(name = "company_target", nullable = false)
    private BigDecimal companyTarget;

    @Column(name = "locked_at")
    private java.time.Instant lockedAt;
}
