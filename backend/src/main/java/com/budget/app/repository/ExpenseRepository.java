package com.budget.app.repository;

import com.budget.app.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByBudgetId(Long budgetId);
    List<Expense> findByLineItemId(Long lineItemId);
    List<Expense> findByCreatedById(Long createdById);

    @Query("SELECT e FROM Expense e JOIN e.budget b WHERE b.department.id = :departmentId")
    List<Expense> findByDepartmentId(@Param("departmentId") Long departmentId);
}
