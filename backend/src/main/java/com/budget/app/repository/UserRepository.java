package com.budget.app.repository;

import com.budget.app.entity.User;
import com.budget.app.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    List<User> findByDepartmentId(Long departmentId);
    List<User> findByRegionId(Long regionId);
    List<User> findByActiveTrue();
}
