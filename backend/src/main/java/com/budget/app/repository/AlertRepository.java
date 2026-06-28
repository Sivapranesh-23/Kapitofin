package com.budget.app.repository;

import com.budget.app.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByBudgetId(Long budgetId);
    List<Alert> findAllByOrderByTriggeredAtDesc();
}
