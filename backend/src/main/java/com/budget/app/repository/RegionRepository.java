package com.budget.app.repository;

import com.budget.app.entity.Region;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegionRepository extends JpaRepository<Region, Long> {
    boolean existsByCode(String code);
    boolean existsByName(String name);
}
