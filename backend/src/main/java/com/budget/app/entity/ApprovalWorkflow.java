package com.budget.app.entity;

import com.budget.app.entity.enums.WorkflowStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "approval_workflows")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalWorkflow extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "budget_id", unique = true)
    private Budget budget;

    @Column(name = "current_level", nullable = false)
    private Integer currentLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkflowStatus status;

    @OneToMany(mappedBy = "workflow", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @OrderBy("level ASC")
    private List<ApprovalStep> steps = new ArrayList<>();
}
