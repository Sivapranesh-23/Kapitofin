package com.budget.app.repository;

import com.budget.app.entity.ApprovalStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApprovalStepRepository extends JpaRepository<ApprovalStep, Long> {
    List<ApprovalStep> findByWorkflowIdOrderByLevel(Long workflowId);
    Optional<ApprovalStep> findByWorkflowIdAndLevel(Long workflowId, Integer level);
}
