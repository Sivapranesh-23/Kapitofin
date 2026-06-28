package com.budget.app.controller;

import com.budget.app.dto.BudgetRequest;
import com.budget.app.dto.BudgetResponse;
import com.budget.app.entity.enums.BudgetStatus;
import com.budget.app.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getAll(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long regionId,
            @RequestParam(required = false) Long fiscalYearId,
            @RequestParam(required = false) String status) {

        List<BudgetResponse> result;
        if (departmentId != null) {
            result = budgetService.getBudgetsByDepartment(departmentId);
        } else if (regionId != null) {
            result = budgetService.getBudgetsByRegion(regionId);
        } else if (fiscalYearId != null) {
            result = budgetService.getBudgetsByFiscalYear(fiscalYearId);
        } else if (status != null) {
            result = budgetService.getBudgetsByStatus(status);
        } else {
            result = budgetService.getAllBudgets();
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BudgetResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(budgetService.getBudgetById(id));
    }

    @PostMapping
    public ResponseEntity<BudgetResponse> create(@Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(budgetService.createBudget(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetResponse> update(@PathVariable Long id,
                                                  @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(budgetService.updateBudget(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<BudgetResponse> submit(@PathVariable Long id) {
        return ResponseEntity.ok(budgetService.submitBudget(id));
    }
}
