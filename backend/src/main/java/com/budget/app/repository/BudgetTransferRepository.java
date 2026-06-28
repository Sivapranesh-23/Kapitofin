package com.budget.app.repository;

import com.budget.app.entity.BudgetTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BudgetTransferRepository extends JpaRepository<BudgetTransfer, Long> {
    List<BudgetTransfer> findByRequestedById(Long requestedById);
}
