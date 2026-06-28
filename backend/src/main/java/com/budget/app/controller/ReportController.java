package com.budget.app.controller;

import com.budget.app.dto.DashboardResponse;
import com.budget.app.dto.ReportResponse;
import com.budget.app.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard() {
        return ResponseEntity.ok(reportService.getDashboard());
    }

    @GetMapping("/department")
    public ResponseEntity<ReportResponse> getDepartmentReport() {
        return ResponseEntity.ok(reportService.getDepartmentReport());
    }
}
