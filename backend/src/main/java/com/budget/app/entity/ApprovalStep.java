package com.budget.app.entity;

import com.budget.app.entity.enums.DecisionType;
import com.budget.app.entity.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "approval_steps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workflow_id")
    private ApprovalWorkflow workflow;

    @Column(nullable = false)
    private Integer level;

    @Enumerated(EnumType.STRING)
    @Column(name = "role_required", nullable = false)
    private Role roleRequired;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id")
    private User approver;

    @Enumerated(EnumType.STRING)
    private DecisionType decision;

    @Column(length = 2000)
    private String comments;

    @Column(name = "decided_at")
    private Instant decidedAt;

    /** True if this level is pending a decision. */
    @Transient
    public boolean isPending() {
        return decision == null;
    }
}
