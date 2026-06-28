package com.budget.app.repository;

import com.budget.app.entity.ApprovalWorkflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApprovalWorkflowRepository extends JpaRepository<ApprovalWorkflow, Long> {
    Optional<ApprovalWorkflow> findByBudgetId(Long budgetId);
}
