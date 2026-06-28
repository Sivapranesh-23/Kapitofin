package com.budget.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {

    private String title;
    private List<DepartmentReportDto> departments;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentReportDto {
        private Long departmentId;
        private String departmentName;
        private String regionName;
        private BigDecimal allocated;
        private BigDecimal spent;
        private BigDecimal committed;
        private BigDecimal remaining;
        private BigDecimal variance;
        private BigDecimal utilizationPct;
        private String status;
    }
}
