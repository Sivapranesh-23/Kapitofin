package com.budget.app.controller;

import com.budget.app.dto.AuditLogResponse;
import com.budget.app.service.AuditQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'FINANCE_DIRECTOR')")
public class AuditLogController {

    private final AuditQueryService auditQueryService;

    @GetMapping
    public ResponseEntity<Page<AuditLogResponse>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return ResponseEntity.ok(auditQueryService.getAuditLogs(page, size));
    }

    @GetMapping("/entity/{type}/{id}")
    public ResponseEntity<java.util.List<AuditLogResponse>> getLogsForEntity(
            @PathVariable String type, @PathVariable Long id
    ) {
        return ResponseEntity.ok(auditQueryService.getAuditLogsByEntity(type, id));
    }
}
