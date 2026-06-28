package com.budget.app.service;

import com.budget.app.entity.AuditLog;
import com.budget.app.entity.User;
import com.budget.app.repository.AuditLogRepository;
import com.budget.app.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final SecurityUtils securityUtils;

    public void log(String action, String entityType, Long entityId, String details) {
        try {
            User user = securityUtils.getCurrentUser();
            AuditLog entry = AuditLog.builder()
                    .user(user)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .details(details)
                    .timestamp(Instant.now())
                    .build();
            auditLogRepository.save(entry);
        } catch (Exception e) {
            // Don't let audit logging failures break the main flow
            log.warn("Failed to record audit log: {}", e.getMessage());
        }
    }
}
