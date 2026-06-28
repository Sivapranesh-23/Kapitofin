package com.budget.app.controller;

import com.budget.app.entity.Category;
import com.budget.app.entity.Department;
import com.budget.app.entity.FiscalYear;
import com.budget.app.entity.Region;
import com.budget.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Read-only reference data for populating dropdowns and selectors in the UI.
 * Available to all authenticated users.
 */
@RestController
@RequestMapping("/api/reference")
@RequiredArgsConstructor
public class ReferenceController {

    private final RegionRepository regionRepository;
    private final DepartmentRepository departmentRepository;
    private final CategoryRepository categoryRepository;
    private final FiscalYearRepository fiscalYearRepository;

    @GetMapping("/regions")
    public ResponseEntity<List<Region>> regions() {
        return ResponseEntity.ok(regionRepository.findAll());
    }

    @GetMapping("/departments")
    public ResponseEntity<List<Department>> departments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> categories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @GetMapping("/fiscal-years")
    public ResponseEntity<List<FiscalYear>> fiscalYears() {
        return ResponseEntity.ok(fiscalYearRepository.findAll());
    }
}
