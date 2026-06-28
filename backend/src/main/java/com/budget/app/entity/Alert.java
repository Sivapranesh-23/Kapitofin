package com.budget.app.entity;

import com.budget.app.entity.enums.AlertLevel;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "budget_id")
    private Budget budget;

    @Column(nullable = false, length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertLevel level;

    @Column(name = "triggered_at", nullable = false)
    private java.time.Instant triggeredAt;
}
