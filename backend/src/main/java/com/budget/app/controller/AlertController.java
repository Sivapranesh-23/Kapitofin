package com.budget.app.controller;

import com.budget.app.dto.AlertResponse;
import com.budget.app.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    public ResponseEntity<List<AlertResponse>> getAll() {
        return ResponseEntity.ok(alertService.getAllAlerts());
    }

    @GetMapping("/budget/{budgetId}")
    public ResponseEntity<List<AlertResponse>> getByBudget(@PathVariable Long budgetId) {
        return ResponseEntity.ok(alertService.getAlertsByBudget(budgetId));
    }
}
