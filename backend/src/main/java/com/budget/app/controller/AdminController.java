package com.budget.app.controller;

import com.budget.app.dto.*;
import com.budget.app.entity.*;
import com.budget.app.service.AdminService;
import com.budget.app.service.AlertService;
import com.budget.app.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final AlertService alertService;
    private final com.budget.app.repository.AuditLogRepository auditLogRepository;

    /* ================= USERS ================= */

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PostMapping("/users")
    public ResponseEntity<UserResponse> createUser(@RequestBody UserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createUser(request));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @RequestBody UserRequest request) {
        return ResponseEntity.ok(adminService.updateUser(id, request));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deactivateUser(@PathVariable Long id) {
        adminService.deactivateUser(id);
        return ResponseEntity.noContent().build();
    }

    /* ================= REGIONS ================= */

    @GetMapping("/regions")
    public ResponseEntity<List<Region>> getRegions() {
        return ResponseEntity.ok(adminService.getAllRegions());
    }

    @PostMapping("/regions")
    public ResponseEntity<Region> createRegion(@RequestBody Map<String, String> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                adminService.createRegion(
                        body.get("name"), body.get("code"), body.get("description")));
    }

    /* ================= DEPARTMENTS ================= */

    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getDepartments() {
        return ResponseEntity.ok(adminService.getAllDepartments());
    }

    @PostMapping("/departments")
    public ResponseEntity<Department> createDepartment(@RequestBody Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                adminService.createDepartment(
                        (String) body.get("name"),
                        (String) body.get("code"),
                        Long.valueOf(body.get("regionId").toString()),
                        (String) body.get("description")));
    }

    /* ================= CATEGORIES ================= */

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(adminService.getAllCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@RequestBody Map<String, String> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                adminService.createCategory(
                        body.get("name"), body.get("description"), body.get("colorHex")));
    }

    /* ================= FISCAL YEARS ================= */

    @GetMapping("/fiscal-years")
    public ResponseEntity<List<FiscalYear>> getFiscalYears() {
        return ResponseEntity.ok(adminService.getAllFiscalYears());
    }

    @PostMapping("/fiscal-years")
    public ResponseEntity<FiscalYear> createFiscalYear(@RequestBody Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                adminService.createFiscalYear(
                        Integer.valueOf(body.get("year").toString()),
                        new BigDecimal(body.get("companyTarget").toString())));
    }

    @PostMapping("/fiscal-years/{id}/lock")
    public ResponseEntity<FiscalYear> lockFiscalYear(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.lockFiscalYear(id));
    }

    /* ================= ALLOCATIONS ================= */

    @GetMapping("/allocations")
    public ResponseEntity<List<com.budget.app.entity.Allocation>> getAllocations() {
        return ResponseEntity.ok(adminService.getAllAllocations());
    }

    @PostMapping("/allocations")
    public ResponseEntity<com.budget.app.entity.Allocation> createAllocation(@RequestBody Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                adminService.createAllocation(
                        Long.valueOf(body.get("fiscalYearId").toString()),
                        com.budget.app.entity.enums.AllocationScope.valueOf(body.get("scope").toString()),
                        Long.valueOf(body.get("refId").toString()),
                        new BigDecimal(body.get("amount").toString())));
    }

    /* ================= ALERTS ================= */

    @GetMapping("/alerts")
    public ResponseEntity<List<AlertResponse>> getAlerts() {
        return ResponseEntity.ok(alertService.getAllAlerts());
    }

    /* ================= AUDIT LOGS ================= */

    @GetMapping("/audit-logs")
    public ResponseEntity<Page<com.budget.app.entity.AuditLog>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(
                auditLogRepository.findAllByOrderByTimestampDesc(PageRequest.of(page, size)));
    }
}
