package com.budget.app.bootstrap;

import com.budget.app.entity.Department;
import com.budget.app.entity.Region;
import com.budget.app.entity.User;
import com.budget.app.entity.enums.Role;
import com.budget.app.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.lang.reflect.Method;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class DataSeederTest {

    @Test
    void createUserReturnsExistingUserWhenEmailAlreadyExists() throws Exception {
        RegionRepository regionRepository = mock(RegionRepository.class);
        DepartmentRepository departmentRepository = mock(DepartmentRepository.class);
        CategoryRepository categoryRepository = mock(CategoryRepository.class);
        FiscalYearRepository fiscalYearRepository = mock(FiscalYearRepository.class);
        AllocationRepository allocationRepository = mock(AllocationRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        BudgetRepository budgetRepository = mock(BudgetRepository.class);
        LineItemRepository lineItemRepository = mock(LineItemRepository.class);
        ExpenseRepository expenseRepository = mock(ExpenseRepository.class);
        ApprovalWorkflowRepository workflowRepository = mock(ApprovalWorkflowRepository.class);
        ApprovalStepRepository stepRepository = mock(ApprovalStepRepository.class);
        AlertRepository alertRepository = mock(AlertRepository.class);
        AuditLogRepository auditLogRepository = mock(AuditLogRepository.class);
        BudgetTransferRepository transferRepository = mock(BudgetTransferRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);

        DataSeeder seeder = new DataSeeder(
                regionRepository,
                departmentRepository,
                categoryRepository,
                fiscalYearRepository,
                allocationRepository,
                userRepository,
                budgetRepository,
                lineItemRepository,
                expenseRepository,
                workflowRepository,
                stepRepository,
                alertRepository,
                auditLogRepository,
                transferRepository,
                passwordEncoder
        );

        String email = "existing@budget.test";
        User existingUser = User.builder()
                .email(email)
                .firstName("Existing")
                .lastName("User")
                .role(Role.EMPLOYEE)
                .active(true)
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");

        Method createUser = DataSeeder.class.getDeclaredMethod(
                "createUser",
                String.class,
                String.class,
                String.class,
                String.class,
                Role.class,
                Region.class,
                Department.class
        );
        createUser.setAccessible(true);

        User result = (User) createUser.invoke(
                seeder,
                email,
                "Jane",
                "Doe",
                "Engineer",
                Role.EMPLOYEE,
                Region.builder().build(),
                Department.builder().build()
        );

        assertSame(existingUser, result);
        verify(userRepository).findByEmail(email);
        verify(userRepository, never()).save(any(User.class));
    }
}
