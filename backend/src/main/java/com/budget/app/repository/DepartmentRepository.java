package com.budget.app.repository;

import com.budget.app.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    boolean existsByCode(String code);
    boolean existsByName(String name);
    List<Department> findByRegionId(Long regionId);
}
