package com.budget.app.bootstrap;

import com.budget.app.entity.*;
import com.budget.app.entity.enums.*;
import com.budget.app.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final RegionRepository regionRepository;
    private final DepartmentRepository departmentRepository;
    private final CategoryRepository categoryRepository;
    private final FiscalYearRepository fiscalYearRepository;
    private final AllocationRepository allocationRepository;
    private final UserRepository userRepository;
    private final BudgetRepository budgetRepository;
    private final LineItemRepository lineItemRepository;
    private final ExpenseRepository expenseRepository;
    private final ApprovalWorkflowRepository workflowRepository;
    private final ApprovalStepRepository stepRepository;
    private final AlertRepository alertRepository;
    private final AuditLogRepository auditLogRepository;
    private final BudgetTransferRepository transferRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed-data}")
    private boolean seedData;

    @Bean
    @Transactional
    public CommandLineRunner seedDatabase() {
        return args -> {
            if (!seedData) {
                log.info("Seed data disabled (app.seed-data=false)");
                return;
            }

            boolean shouldSeed = budgetRepository.count() < 8 || userRepository.count() < 6 || expenseRepository.count() < 15;
            if (!shouldSeed) {
                log.info("Database already contains sample data (budgets={}, users={}, expenses={}), skipping extra seeding.",
                        budgetRepository.count(), userRepository.count(), expenseRepository.count());
                return;
            }

            log.info("=== Seeding demo data ===");

            Region americas = getOrCreateRegion("Americas", "AMER", "North & South America");
            Region emea = getOrCreateRegion("EMEA", "EMEA", "Europe, Middle East & Africa");
            Region apac = getOrCreateRegion("Asia Pacific", "APAC", "Asia Pacific region");
            Region latam = getOrCreateRegion("Latin America", "LATAM", "Latin America region");

            Department engineering = getOrCreateDepartment("Engineering", "ENG", americas, "Software Engineering");
            Department marketing = getOrCreateDepartment("Marketing", "MKT", emea, "Marketing & Growth");
            Department operations = getOrCreateDepartment("Operations", "OPS", apac, "Operations & Infrastructure");
            Department finance = getOrCreateDepartment("Finance", "FIN", americas, "Finance & Accounting");
            Department hr = getOrCreateDepartment("Human Resources", "HR", emea, "People operations");
            Department sales = getOrCreateDepartment("Sales", "SAL", latam, "Revenue and customer growth");
            Department product = getOrCreateDepartment("Product", "PRD", americas, "Product management");

            Category cloud = getOrCreateCategory("Cloud Infrastructure", "AWS, GCP, Azure services", "#3B82F6");
            Category devTools = getOrCreateCategory("Developer Tools", "IDEs, CI/CD, version control", "#10B981");
            Category testing = getOrCreateCategory("Testing Tools", "QA tools, test automation", "#F59E0B");
            Category security = getOrCreateCategory("Security Tools", "Security scanning, monitoring", "#EF4444");
            Category training = getOrCreateCategory("Training & Development", "Courses, certifications, conferences", "#8B5CF6");
            Category marketingTools = getOrCreateCategory("Marketing Tools", "Ads, analytics, CRM", "#EC4899");
            Category infrastructure = getOrCreateCategory("Hardware & Infrastructure", "Servers, networking, physical infra", "#6366F1");
            Category travel = getOrCreateCategory("Travel & Expenses", "Business travel, meals", "#14B8A6");
            Category office = getOrCreateCategory("Office Supplies", "Desks, printers, stationery", "#0EA5E9");
            Category saas = getOrCreateCategory("SaaS Licensing", "Subscription software tools", "#F43F5E");

            FiscalYear fy2024 = getOrCreateFiscalYear(2024, FiscalYearStatus.OPEN, new BigDecimal("5000000"));
            FiscalYear fy2025 = getOrCreateFiscalYear(2025, FiscalYearStatus.OPEN, new BigDecimal("6500000"));

            createAllocationIfMissing(fy2024, AllocationScope.REGION, americas.getId(), new BigDecimal("2500000"));
            createAllocationIfMissing(fy2024, AllocationScope.REGION, emea.getId(), new BigDecimal("1500000"));
            createAllocationIfMissing(fy2024, AllocationScope.REGION, apac.getId(), new BigDecimal("1000000"));
            createAllocationIfMissing(fy2024, AllocationScope.REGION, latam.getId(), new BigDecimal("700000"));
            createAllocationIfMissing(fy2024, AllocationScope.DEPARTMENT, engineering.getId(), new BigDecimal("1200000"));
            createAllocationIfMissing(fy2024, AllocationScope.DEPARTMENT, marketing.getId(), new BigDecimal("800000"));
            createAllocationIfMissing(fy2024, AllocationScope.DEPARTMENT, operations.getId(), new BigDecimal("600000"));
            createAllocationIfMissing(fy2024, AllocationScope.DEPARTMENT, finance.getId(), new BigDecimal("400000"));
            createAllocationIfMissing(fy2024, AllocationScope.DEPARTMENT, hr.getId(), new BigDecimal("300000"));
            createAllocationIfMissing(fy2024, AllocationScope.DEPARTMENT, sales.getId(), new BigDecimal("500000"));
            createAllocationIfMissing(fy2024, AllocationScope.DEPARTMENT, product.getId(), new BigDecimal("450000"));

            List<User> users = new ArrayList<>();
            users.add(createUser("john.analyst@budget.com", "John", "Analyst", "Budget Analyst", Role.BUDGET_ANALYST, americas, engineering));
            users.add(createUser("jane.employee@budget.com", "Jane", "Employee", "Software Engineer", Role.EMPLOYEE, americas, engineering));
            users.add(createUser("mike.head@budget.com", "Mike", "Head", "Engineering Director", Role.DEPARTMENT_HEAD, americas, engineering));
            users.add(createUser("sarah.regional@budget.com", "Sarah", "Regional", "Regional Finance Manager", Role.REGIONAL_FINANCE_MANAGER, emea, marketing));
            users.add(createUser("cathy.director@budget.com", "Cathy", "Director", "Finance Director", Role.FINANCE_DIRECTOR, americas, finance));
            users.add(createUser("admin@budget.com", "Super", "Admin", "System Administrator", Role.SUPER_ADMIN, americas, engineering));
            users.add(createUser("tom.analyst@budget.com", "Tom", "Analyst", "Marketing Analyst", Role.BUDGET_ANALYST, emea, marketing));

            String[] firstNames = {"Alicia", "Brian", "Clara", "Derek", "Elena", "Felix", "Grace", "Hannah", "Isaac", "Jade", "Kevin", "Lina", "Mason", "Nina", "Owen", "Paula", "Quinn", "Rita", "Sam", "Tina"};
            String[] lastNames = {"Adams", "Brown", "Carter", "Davis", "Evans", "Foster", "Garcia", "Hughes", "Irwin", "Jones", "King", "Lopez", "Miller", "Nguyen", "Owens", "Parker", "Quinn", "Reed", "Stone", "Turner"};
            String[] titles = {"Operations Lead", "Finance Analyst", "Product Manager", "HR Specialist", "Sales Executive", "Customer Success Lead", "Accountant", "Data Analyst"};
            Role[] roles = {Role.EMPLOYEE, Role.BUDGET_ANALYST, Role.DEPARTMENT_HEAD, Role.REGIONAL_FINANCE_MANAGER, Role.FINANCE_DIRECTOR};
            Department[] departments = {engineering, marketing, operations, finance, hr, sales, product};
            Region[] regions = {americas, emea, apac, latam};

            for (int i = 0; i < 20; i++) {
                Department dept = departments[i % departments.length];
                Region region = regions[i % regions.length];
                Role role = roles[i % roles.length];
                String email = String.format("user%02d@budget.test", i + 1);
                users.add(createUser(email, firstNames[i % firstNames.length], lastNames[i % lastNames.length], titles[i % titles.length], role, region, dept));
            }

            List<Budget> budgets = new ArrayList<>();
            budgets.add(createSeedBudget("2024 Engineering IT Budget", "Annual IT infrastructure and tooling budget", fy2024, engineering, users.get(0), BudgetStatus.APPROVED, new BigDecimal("850000"), new BigDecimal("612000"), new BigDecimal("100000")));
            budgets.add(createSeedBudget("2024 Marketing Digital Budget", "Digital marketing tools and campaigns", fy2024, marketing, users.get(6), BudgetStatus.SUBMITTED, new BigDecimal("350000"), BigDecimal.ZERO, BigDecimal.ZERO));
            budgets.add(createSeedBudget("2024 Operations Infrastructure", "Server hardware and networking equipment", fy2024, operations, users.get(8), BudgetStatus.DRAFT, new BigDecimal("450000"), BigDecimal.ZERO, BigDecimal.ZERO));
            budgets.add(createSeedBudget("2024 Office Renovation", "Office fit-out and furnishing", fy2024, finance, users.get(0), BudgetStatus.REJECTED, new BigDecimal("200000"), BigDecimal.ZERO, BigDecimal.ZERO));
            budgets.add(createSeedBudget("2024 Enterprise Platform Migration", "Multi-team cloud migration initiative", fy2024, engineering, users.get(2), BudgetStatus.SUBMITTED, new BigDecimal("180000"), BigDecimal.ZERO, BigDecimal.ZERO));
            budgets.add(createSeedBudget("2025 Sales Enablement", "Sales tools and enablement program", fy2025, sales, users.get(10), BudgetStatus.APPROVED, new BigDecimal("320000"), new BigDecimal("142000"), new BigDecimal("35000")));
            budgets.add(createSeedBudget("2025 Product Research", "User research and experimentation", fy2025, product, users.get(12), BudgetStatus.DRAFT, new BigDecimal("240000"), BigDecimal.ZERO, BigDecimal.ZERO));
            budgets.add(createSeedBudget("2025 HR Training", "Employee learning and certification", fy2025, hr, users.get(14), BudgetStatus.APPROVED, new BigDecimal("180000"), new BigDecimal("76000"), new BigDecimal("22000")));
            budgets.add(createSeedBudget("2025 Cloud Expansion", "Additional cloud capacity and resilience", fy2025, operations, users.get(16), BudgetStatus.SUBMITTED, new BigDecimal("260000"), BigDecimal.ZERO, BigDecimal.ZERO));
            budgets.add(createSeedBudget("2025 Travel & Events", "Customer events and regional travel", fy2025, marketing, users.get(18), BudgetStatus.APPROVED, new BigDecimal("140000"), new BigDecimal("91000"), new BigDecimal("12000")));

            String[][] budgetLineItems = {
                    {"Cloud Infrastructure (AWS)", "Cloud migration and backups", "500000", "380000", "50000", "cloud"},
                    {"Developer Tools", "IDE and CI/CD tools", "150000", "92000", "30000", "devTools"},
                    {"Testing Tools", "Test automation platforms", "80000", "55000", "10000", "testing"},
                    {"Security Tools", "Security monitoring", "120000", "85000", "10000", "security"},
                    {"Google Ads & Analytics", "Search ads and analytics", "150000", "0", "0", "marketingTools"},
                    {"HubSpot CRM", "Marketing automation", "120000", "0", "0", "marketingTools"},
                    {"Marketing Events", "Trade shows and events", "80000", "0", "0", "travel"},
                    {"Server Hardware", "New rack servers", "250000", "0", "0", "infrastructure"},
                    {"Networking Equipment", "Switches and firewalls", "120000", "0", "0", "infrastructure"},
                    {"Cloud Backup Services", "Archive and resiliency", "80000", "0", "0", "cloud"},
                    {"Furniture", "Office fit-out", "120000", "0", "0", "office"},
                    {"Relocation Costs", "Move and relocation", "80000", "0", "0", "travel"},
                    {"Cloud Migration Services", "Platform migration", "120000", "0", "0", "cloud"},
                    {"New CI/CD Platform", "Automation platform", "40000", "0", "0", "devTools"},
                    {"Team Training", "Workshops and certifications", "20000", "0", "0", "training"},
                    {"Sales CRM", "Revenue operations tools", "90000", "42000", "10000", "saas"},
                    {"Field Enablement", "Training material and events", "70000", "28000", "8000", "training"},
                    {"User Research", "Research interviews and labs", "100000", "0", "0", "training"},
                    {"LMS Platform", "Learning management tools", "80000", "32000", "12000", "saas"},
                    {"Conference Travel", "Regional events and travel", "60000", "25000", "5000", "travel"}
            };

            int lineItemIndex = 0;
            for (Budget budget : budgets) {
                int itemCount = (budget.getTitle().contains("Engineering") || budget.getTitle().contains("Marketing") || budget.getTitle().contains("Operations")) ? 3 : 2;
                for (int i = 0; i < itemCount; i++) {
                    String[] item = budgetLineItems[lineItemIndex % budgetLineItems.length];
                    Category category = switch (item[5]) {
                        case "cloud" -> cloud;
                        case "devTools" -> devTools;
                        case "testing" -> testing;
                        case "security" -> security;
                        case "marketingTools" -> marketingTools;
                        case "infrastructure" -> infrastructure;
                        case "travel" -> travel;
                        case "office" -> office;
                        case "saas" -> saas;
                        default -> training;
                    };
                    lineItemRepository.save(createLineItem(
                            budget,
                            category,
                            item[0],
                            item[1],
                            new BigDecimal(item[2]),
                            new BigDecimal(item[3]),
                            new BigDecimal(item[4])
                    ));
                    lineItemIndex++;
                }
            }

            for (Budget budget : budgets) {
                List<LineItem> items = lineItemRepository.findAll().stream()
                        .filter(item -> item.getBudget().getId().equals(budget.getId()))
                        .toList();
                if (!items.isEmpty()) {
                    BigDecimal total = items.stream().map(LineItem::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
                    budget.setTotalAmount(total);
                    budget.setSpentAmount(items.stream().map(LineItem::getSpentAmount).reduce(BigDecimal.ZERO, BigDecimal::add));
                    budget.setCommittedAmount(items.stream().map(LineItem::getCommittedAmount).reduce(BigDecimal.ZERO, BigDecimal::add));
                    budgetRepository.save(budget);
                }
            }

            for (Budget budget : budgets) {
                List<LineItem> items = lineItemRepository.findAll().stream()
                        .filter(item -> item.getBudget().getId().equals(budget.getId()))
                        .toList();
                if (items.isEmpty()) {
                    continue;
                }
                LineItem primaryItem = items.get(0);
                for (int i = 0; i < 4 + (budget.getStatus() == BudgetStatus.APPROVED ? 1 : 0); i++) {
                    createSeedExpense(
                            budget,
                            primaryItem,
                            new BigDecimal(12000 + i * 3500),
                            "Quarterly operational expense " + (i + 1),
                            "Vendor " + (i + 1),
                            "INV-" + budget.getId() + "-" + (i + 1),
                            LocalDate.of(2024 + (i % 2), 2 + (i % 10), 10 + (i % 20)),
                            i % 3 == 0 ? ExpenseStatus.PENDING : ExpenseStatus.APPROVED,
                            users.get(i % users.size())
                    );
                }
            }

            for (Budget budget : budgets) {
                if (budget.getStatus() == BudgetStatus.APPROVED || budget.getStatus() == BudgetStatus.SUBMITTED) {
                    ApprovalWorkflow workflow = workflowRepository.save(ApprovalWorkflow.builder()
                            .budget(budget).currentLevel(1).status(WorkflowStatus.IN_PROGRESS).build());
                    stepRepository.save(ApprovalStep.builder().workflow(workflow).level(1).roleRequired(Role.DEPARTMENT_HEAD).build());
                    if (budget.getTotalAmount().compareTo(new BigDecimal("250000")) >= 0) {
                        stepRepository.save(ApprovalStep.builder().workflow(workflow).level(2).roleRequired(Role.REGIONAL_FINANCE_MANAGER).build());
                    }
                    if (budget.getTotalAmount().compareTo(new BigDecimal("500000")) >= 0) {
                        stepRepository.save(ApprovalStep.builder().workflow(workflow).level(3).roleRequired(Role.FINANCE_DIRECTOR).build());
                    }
                }
            }

            for (Budget budget : budgets) {
                if (budget.getStatus() == BudgetStatus.APPROVED) {
                    BigDecimal utilizationPct = budget.getSpentAmount().divide(
                            budget.getTotalAmount().signum() == 0 ? BigDecimal.ONE : budget.getTotalAmount(),
                            4,
                            java.math.RoundingMode.HALF_UP
                    ).multiply(BigDecimal.valueOf(100));
                    alertRepository.save(Alert.builder()
                            .budget(budget)
                            .message("Budget " + budget.getTitle() + " is tracking above the planned threshold")
                            .level(utilizationPct.compareTo(new BigDecimal("70")) >= 0 ? AlertLevel.WARNING : AlertLevel.INFO)
                            .triggeredAt(Instant.now().minusSeconds(3600L * (budget.getId() % 10 + 1)))
                            .build());
                }
            }

            transferRepository.save(BudgetTransfer.builder()
                    .fromBudget(budgets.get(0)).toBudget(budgets.get(1))
                    .amount(new BigDecimal("15000")).status(TransferStatus.PENDING)
                    .requestedBy(users.get(2)).reason("Reallocate remaining cloud budget to marketing campaigns")
                    .build());
            transferRepository.save(BudgetTransfer.builder()
                    .fromBudget(budgets.get(3)).toBudget(budgets.get(6))
                    .amount(new BigDecimal("12000")).status(TransferStatus.APPROVED)
                    .requestedBy(users.get(4)).reason("Move reserve funds for product research")
                    .build());

            for (int i = 0; i < 20; i++) {
                auditLogRepository.save(createAuditLog(
                        users.get(i % users.size()),
                        i % 3 == 0 ? "CREATE_BUDGET" : "UPDATE_BUDGET",
                        "Budget",
                        budgets.get(i % budgets.size()).getId(),
                        "Sample activity entry " + (i + 1)
                ));
            }

            log.info("=== Demo data seeded successfully ===");
            log.info("Demo accounts (password: password):");
            log.info("  Employee:           jane.employee@budget.com");
            log.info("  Budget Analyst:     john.analyst@budget.com");
            log.info("  Department Head:    mike.head@budget.com");
            log.info("  Regional Fin. Mgr:  sarah.regional@budget.com");
            log.info("  Finance Director:    cathy.director@budget.com");
            log.info("  Super Admin:        admin@budget.com");
        };
    }

    private Region getOrCreateRegion(String name, String code, String description) {
        return regionRepository.findAll().stream()
                .filter(region -> code.equals(region.getCode()))
                .findFirst()
                .orElseGet(() -> regionRepository.save(Region.builder().name(name).code(code).description(description).build()));
    }

    private Department getOrCreateDepartment(String name, String code, Region region, String description) {
        return departmentRepository.findAll().stream()
                .filter(department -> code.equals(department.getCode()))
                .findFirst()
                .orElseGet(() -> departmentRepository.save(Department.builder().name(name).code(code).region(region).description(description).build()));
    }

    private Category getOrCreateCategory(String name, String description, String colorHex) {
        return categoryRepository.findAll().stream()
                .filter(category -> name.equals(category.getName()))
                .findFirst()
                .orElseGet(() -> categoryRepository.save(Category.builder().name(name).description(description).colorHex(colorHex).build()));
    }

    private FiscalYear getOrCreateFiscalYear(Integer year, FiscalYearStatus status, BigDecimal companyTarget) {
        return fiscalYearRepository.findAll().stream()
                .filter(fiscalYear -> year.equals(fiscalYear.getYear()))
                .findFirst()
                .orElseGet(() -> fiscalYearRepository.save(FiscalYear.builder().year(year).status(status).companyTarget(companyTarget).build()));
    }

    private void createAllocationIfMissing(FiscalYear fiscalYear, AllocationScope scope, Long refId, BigDecimal amount) {
        boolean exists = allocationRepository.findAll().stream().anyMatch(allocation ->
                fiscalYear.getId().equals(allocation.getFiscalYear().getId())
                        && scope == allocation.getScope()
                        && refId.equals(allocation.getRefId()));
        if (!exists) {
            allocationRepository.save(Allocation.builder().fiscalYear(fiscalYear).scope(scope).refId(refId).amount(amount).build());
        }
    }

    private User createUser(String email, String first, String last, String title, Role role, Region region, Department dept) {
        return userRepository.findByEmail(email)
                .orElseGet(() -> userRepository.save(User.builder()
                        .email(email).passwordHash(passwordEncoder.encode("password"))
                        .firstName(first).lastName(last).jobTitle(title).role(role)
                        .region(region).department(dept).active(true).build()));
    }

    private Budget createSeedBudget(String title, String desc, FiscalYear fy, Department dept, User creator, BudgetStatus status, BigDecimal total, BigDecimal spent, BigDecimal committed) {
        return budgetRepository.save(Budget.builder()
                .title(title).description(desc).fiscalYear(fy).department(dept)
                .status(status).totalAmount(total).spentAmount(spent).committedAmount(committed)
                .createdBy(creator).build());
    }

    private LineItem createLineItem(Budget budget, Category cat, String name, String desc, BigDecimal amount, BigDecimal spent, BigDecimal committed) {
        return lineItemRepository.save(LineItem.builder()
                .budget(budget).category(cat).name(name).description(desc)
                .amount(amount).spentAmount(spent).committedAmount(committed).build());
    }

    private Expense createSeedExpense(Budget budget, LineItem lineItem, BigDecimal amount, String desc, String vendor, String invoice, LocalDate date, ExpenseStatus status, User createdBy) {
        return expenseRepository.save(Expense.builder()
                .budget(budget).lineItem(lineItem).amount(amount)
                .description(desc).vendor(vendor).invoiceNumber(invoice)
                .expenseDate(date).status(status).createdBy(createdBy).build());
    }

    private AuditLog createAuditLog(User user, String action, String entityType, Long entityId, String details) {
        return auditLogRepository.save(AuditLog.builder()
                .user(user).action(action).entityType(entityType).entityId(entityId)
                .details(details).timestamp(Instant.now()).build());
    }
}
