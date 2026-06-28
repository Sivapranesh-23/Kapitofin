package com.budget.app.service;

import com.budget.app.dto.AuditLogResponse;
import com.budget.app.entity.AuditLog;
import com.budget.app.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditQueryService {

    private final AuditLogRepository auditLogRepository;

    public Page<AuditLogResponse> getAuditLogs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return auditLogRepository.findAllByOrderByTimestampDesc(pageable).map(this::toResponse);
    }

    public List<AuditLogResponse> getAuditLogsByEntity(String entityType, Long entityId) {
        return auditLogRepository.findByEntityTypeAndEntityId(entityType, entityId, Pageable.unpaged())
                .getContent().stream().map(this::toResponse).collect(Collectors.toList());
    }

    private AuditLogResponse toResponse(AuditLog a) {
        return AuditLogResponse.builder()
                .id(a.getId())
                .userId(a.getUser() != null ? a.getUser().getId() : null)
                .userFullName(a.getUser() != null ? a.getUser().fullName() : "System")
                .action(a.getAction())
                .entityType(a.getEntityType())
                .entityId(a.getEntityId())
                .details(a.getDetails())
                .timestamp(a.getTimestamp())
                .build();
    }
}
