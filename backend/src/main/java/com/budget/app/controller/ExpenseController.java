package com.budget.app.controller;

import com.budget.app.dto.ExpenseRequest;
import com.budget.app.dto.ExpenseResponse;
import com.budget.app.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getAll(
            @RequestParam(required = false) Long budgetId,
            @RequestParam(required = false) Long departmentId) {

        List<ExpenseResponse> result;
        if (budgetId != null) {
            result = expenseService.getExpensesByBudget(budgetId);
        } else if (departmentId != null) {
            result = expenseService.getExpensesByDepartment(departmentId);
        } else {
            result = expenseService.getMyExpenses();
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(expenseService.getExpensesByBudget(null).stream()
                .filter(e -> e.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new com.budget.app.exception.ResourceNotFoundException("Expense", id)));
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> create(@Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(expenseService.createExpense(request));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ExpenseResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(expenseService.approveExpense(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ExpenseResponse> reject(@PathVariable Long id) {
        return ResponseEntity.ok(expenseService.rejectExpense(id));
    }
}
