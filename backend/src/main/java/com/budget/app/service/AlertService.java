package com.budget.app.service;

import com.budget.app.dto.AlertResponse;
import com.budget.app.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;

    public List<AlertResponse> getAllAlerts() {
        return alertRepository.findAllByOrderByTriggeredAtDesc().stream()
                .map(a -> AlertResponse.builder()
                        .id(a.getId())
                        .budgetId(a.getBudget().getId())
                        .budgetTitle(a.getBudget().getTitle())
                        .message(a.getMessage())
                        .level(a.getLevel())
                        .triggeredAt(a.getTriggeredAt())
                        .build())
                .collect(Collectors.toList());
    }

    public List<AlertResponse> getAlertsByBudget(Long budgetId) {
        return alertRepository.findByBudgetId(budgetId).stream()
                .map(a -> AlertResponse.builder()
                        .id(a.getId())
                        .budgetId(a.getBudget().getId())
                        .budgetTitle(a.getBudget().getTitle())
                        .message(a.getMessage())
                        .level(a.getLevel())
                        .triggeredAt(a.getTriggeredAt())
                        .build())
                .collect(Collectors.toList());
    }
}
