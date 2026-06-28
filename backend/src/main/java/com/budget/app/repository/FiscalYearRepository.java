package com.budget.app.repository;

import com.budget.app.entity.FiscalYear;
import com.budget.app.entity.enums.FiscalYearStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FiscalYearRepository extends JpaRepository<FiscalYear, Long> {
    Optional<FiscalYear> findByYear(Integer year);
    boolean existsByYear(Integer year);
}
