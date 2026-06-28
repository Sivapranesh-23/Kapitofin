package com.budget.app.repository;

import com.budget.app.entity.Allocation;
import com.budget.app.entity.enums.AllocationScope;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AllocationRepository extends JpaRepository<Allocation, Long> {
    Optional<Allocation> findByFiscalYearIdAndScopeAndRefId(Long fiscalYearId, AllocationScope scope, Long refId);
}
