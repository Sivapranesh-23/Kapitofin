package com.budget.app.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuditLogResponse {

    private Long id;
    private Long userId;
    private String userFullName;
    private String action;
    private String entityType;
    private Long entityId;
    private String details;
    private Instant timestamp;
}
