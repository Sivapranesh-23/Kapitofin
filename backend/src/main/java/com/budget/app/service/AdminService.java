package com.budget.app.service;

import com.budget.app.dto.*;
import com.budget.app.entity.*;
import com.budget.app.entity.enums.*;
import com.budget.app.exception.*;
import com.budget.app.repository.*;
import com.budget.app.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final RegionRepository regionRepository;
    private final DepartmentRepository departmentRepository;
    private final CategoryRepository categoryRepository;
    private final FiscalYearRepository fiscalYearRepository;
    private final AllocationRepository allocationRepository;
    private final BudgetRepository budgetRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtils securityUtils;
    private final AuditLogService auditLogService;

    /* ================= USER MANAGEMENT ================= */

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::toUserResponse).collect(Collectors.toList());
    }

    @Transactional
    public UserResponse createUser(UserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already in use: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .jobTitle(request.getJobTitle())
                .role(request.getRole())
                .active(true)
                .build();

        if (request.getRegionId() != null) {
            regionRepository.findById(request.getRegionId())
                    .ifPresent(user::setRegion);
        }
        if (request.getDepartmentId() != null) {
            departmentRepository.findById(request.getDepartmentId())
                    .ifPresent(user::setDepartment);
        }

        user = userRepository.save(user);
        auditLogService.log("CREATE_USER", "User", user.getId(), "Created user: " + user.getEmail());
        return toUserResponse(user);
    }

    @Transactional
    public UserResponse updateUser(Long userId, UserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setJobTitle(request.getJobTitle());
        user.setRole(request.getRole());

        if (request.getRegionId() != null) {
            regionRepository.findById(request.getRegionId()).ifPresent(user::setRegion);
        }
        if (request.getDepartmentId() != null) {
            departmentRepository.findById(request.getDepartmentId()).ifPresent(user::setDepartment);
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        user = userRepository.save(user);
        auditLogService.log("UPDATE_USER", "User", userId, "Updated user: " + user.getEmail());
        return toUserResponse(user);
    }

    @Transactional
    public void deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setActive(false);
        userRepository.save(user);
        auditLogService.log("DEACTIVATE_USER", "User", userId, "Deactivated user: " + user.getEmail());
    }

    /* ================= REGION MANAGEMENT ================= */

    public List<Region> getAllRegions() {
        return regionRepository.findAll();
    }

    @Transactional
    public Region createRegion(String name, String code, String description) {
        if (regionRepository.existsByCode(code)) {
            throw new BusinessException("Region code already in use: " + code);
        }
        Region region = Region.builder().name(name).code(code).description(description).build();
        region = regionRepository.save(region);
        auditLogService.log("CREATE_REGION", "Region", region.getId(), "Created region: " + name);
        return region;
    }

    /* ================= DEPARTMENT MANAGEMENT ================= */

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    @Transactional
    public Department createDepartment(String name, String code, Long regionId, String description) {
        if (departmentRepository.existsByCode(code)) {
            throw new BusinessException("Department code already in use: " + code);
        }
        Region region = regionRepository.findById(regionId)
                .orElseThrow(() -> new ResourceNotFoundException("Region", regionId));
        Department dept = Department.builder()
                .name(name).code(code).region(region).description(description).build();
        dept = departmentRepository.save(dept);
        auditLogService.log("CREATE_DEPARTMENT", "Department", dept.getId(), "Created department: " + name);
        return dept;
    }

    /* ================= CATEGORY MANAGEMENT ================= */

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Transactional
    public Category createCategory(String name, String description, String colorHex) {
        if (categoryRepository.existsByName(name)) {
            throw new BusinessException("Category already exists: " + name);
        }
        Category cat = Category.builder().name(name).description(description).colorHex(colorHex).build();
        cat = categoryRepository.save(cat);
        auditLogService.log("CREATE_CATEGORY", "Category", cat.getId(), "Created category: " + name);
        return cat;
    }

    /* ================= FISCAL YEAR MANAGEMENT ================= */

    public List<FiscalYear> getAllFiscalYears() {
        return fiscalYearRepository.findAll();
    }

    @Transactional
    public FiscalYear createFiscalYear(Integer year, java.math.BigDecimal companyTarget) {
        if (fiscalYearRepository.existsByYear(year)) {
            throw new BusinessException("Fiscal year already exists: " + year);
        }
        FiscalYear fy = FiscalYear.builder()
                .year(year)
                .status(FiscalYearStatus.OPEN)
                .companyTarget(companyTarget)
                .build();
        fy = fiscalYearRepository.save(fy);
        auditLogService.log("CREATE_FISCAL_YEAR", "FiscalYear", fy.getId(), "Created fiscal year: " + year);
        return fy;
    }

    @Transactional
    public FiscalYear lockFiscalYear(Long fiscalYearId) {
        FiscalYear fy = fiscalYearRepository.findById(fiscalYearId)
                .orElseThrow(() -> new ResourceNotFoundException("FiscalYear", fiscalYearId));
        fy.setStatus(FiscalYearStatus.LOCKED);
        fy.setLockedAt(java.time.Instant.now());
        fy = fiscalYearRepository.save(fy);

        // Close all open budgets in this fiscal year
        budgetRepository.findByFiscalYearId(fiscalYearId).stream()
                .filter(b -> b.getStatus() != BudgetStatus.CLOSED)
                .forEach(b -> { b.setStatus(BudgetStatus.CLOSED); budgetRepository.save(b); });

        auditLogService.log("LOCK_FISCAL_YEAR", "FiscalYear", fiscalYearId, "Locked fiscal year: " + fy.getYear());
        return fy;
    }

    /* ================= ALLOCATION MANAGEMENT ================= */

    public List<Allocation> getAllAllocations() {
        return allocationRepository.findAll();
    }

    @Transactional
    public Allocation createAllocation(Long fiscalYearId, AllocationScope scope, Long refId, java.math.BigDecimal amount) {
        FiscalYear fy = fiscalYearRepository.findById(fiscalYearId)
                .orElseThrow(() -> new ResourceNotFoundException("FiscalYear", fiscalYearId));
        Allocation alloc = Allocation.builder()
                .fiscalYear(fy).scope(scope).refId(refId).amount(amount).build();
        alloc = allocationRepository.save(alloc);
        auditLogService.log("CREATE_ALLOCATION", "Allocation", alloc.getId(),
                "Created allocation: " + scope + " #" + refId + " = $" + amount);
        return alloc;
    }

    /* ================= HELPER ================= */

    private UserResponse toUserResponse(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .email(u.getEmail())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .jobTitle(u.getJobTitle())
                .role(u.getRole())
                .regionId(u.getRegion() != null ? u.getRegion().getId() : null)
                .regionName(u.getRegion() != null ? u.getRegion().getName() : null)
                .departmentId(u.getDepartment() != null ? u.getDepartment().getId() : null)
                .departmentName(u.getDepartment() != null ? u.getDepartment().getName() : null)
                .active(u.getActive())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
