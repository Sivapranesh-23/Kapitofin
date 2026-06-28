package com.budget.app.repository;

import com.budget.app.entity.Budget;
import com.budget.app.entity.enums.BudgetStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByDepartmentId(Long departmentId);

    List<Budget> findByFiscalYearId(Long fiscalYearId);

    List<Budget> findByStatus(BudgetStatus status);

    @Query("SELECT b FROM Budget b JOIN b.department d WHERE d.region.id = :regionId")
    List<Budget> findByRegionId(@Param("regionId") Long regionId);

    @Query("SELECT b FROM Budget b WHERE b.status = 'SUBMITTED'")
    List<Budget> findSubmittedBudgets();
}
