package com.budget.app.repository;

import com.budget.app.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findAllByOrderByTimestampDesc(Pageable pageable);

    Page<AuditLog> findByUserId(Long userId, Pageable pageable);

    Page<AuditLog> findByEntityType(String entityType, Pageable pageable);

    Page<AuditLog> findByEntityTypeAndEntityId(String entityType, Long entityId, Pageable pageable);

    @Query("SELECT a FROM AuditLog a WHERE a.timestamp BETWEEN :from AND :to ORDER BY a.timestamp DESC")
    Page<AuditLog> findByTimestampBetween(@Param("from") Instant from, @Param("to") Instant to, Pageable pageable);
}
