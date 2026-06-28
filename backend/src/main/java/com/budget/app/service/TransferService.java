package com.budget.app.service;

import com.budget.app.dto.*;
import com.budget.app.entity.*;
import com.budget.app.entity.enums.*;
import com.budget.app.exception.*;
import com.budget.app.repository.*;
import com.budget.app.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransferService {

    private final BudgetTransferRepository transferRepository;
    private final BudgetRepository budgetRepository;
    private final SecurityUtils securityUtils;
    private final AuditLogService auditLogService;

    @Transactional
    public TransferResponse requestTransfer(TransferRequest request) {
        User user = securityUtils.getCurrentUser();

        Budget fromBudget = budgetRepository.findById(request.getFromBudgetId())
                .orElseThrow(() -> new ResourceNotFoundException("Budget", request.getFromBudgetId()));
        Budget toBudget = budgetRepository.findById(request.getToBudgetId())
                .orElseThrow(() -> new ResourceNotFoundException("Budget", request.getToBudgetId()));

        if (fromBudget.getStatus() != BudgetStatus.APPROVED || toBudget.getStatus() != BudgetStatus.APPROVED) {
            throw new BusinessException("Both budgets must be APPROVED");
        }

        if (request.getAmount().compareTo(fromBudget.remainingAmount()) > 0) {
            throw new BusinessException("Transfer amount exceeds remaining budget on source");
        }

        BudgetTransfer transfer = BudgetTransfer.builder()
                .fromBudget(fromBudget)
                .toBudget(toBudget)
                .amount(request.getAmount())
                .status(TransferStatus.PENDING)
                .requestedBy(user)
                .reason(request.getReason())
                .build();

        transfer = transferRepository.save(transfer);

        auditLogService.log("REQUEST_TRANSFER", "BudgetTransfer", transfer.getId(),
                "Transfer $" + request.getAmount() + " from '" + fromBudget.getTitle() +
                "' to '" + toBudget.getTitle() + "'");

        return toResponse(transfer);
    }

    @Transactional
    public TransferResponse approveTransfer(Long transferId) {
        User user = securityUtils.getCurrentUser();
        BudgetTransfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("BudgetTransfer", transferId));

        if (transfer.getStatus() != TransferStatus.PENDING) {
            throw new BusinessException("Transfer is not in PENDING status");
        }

        transfer.setStatus(TransferStatus.APPROVED);

        // Move funds
        Budget from = transfer.getFromBudget();
        from.setTotalAmount(from.getTotalAmount().subtract(transfer.getAmount()));
        budgetRepository.save(from);

        Budget to = transfer.getToBudget();
        to.setTotalAmount(to.getTotalAmount().add(transfer.getAmount()));
        budgetRepository.save(to);

        transfer = transferRepository.save(transfer);

        auditLogService.log("APPROVE_TRANSFER", "BudgetTransfer", transferId,
                "Transfer approved by " + user.fullName());

        return toResponse(transfer);
    }

    @Transactional
    public TransferResponse rejectTransfer(Long transferId) {
        User user = securityUtils.getCurrentUser();
        BudgetTransfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("BudgetTransfer", transferId));

        if (transfer.getStatus() != TransferStatus.PENDING) {
            throw new BusinessException("Transfer is not in PENDING status");
        }

        transfer.setStatus(TransferStatus.REJECTED);
        transfer = transferRepository.save(transfer);

        auditLogService.log("REJECT_TRANSFER", "BudgetTransfer", transferId,
                "Transfer rejected by " + user.fullName());

        return toResponse(transfer);
    }

    public List<TransferResponse> getAllTransfers() {
        return transferRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    private TransferResponse toResponse(BudgetTransfer t) {
        return TransferResponse.builder()
                .id(t.getId())
                .fromBudgetId(t.getFromBudget().getId())
                .fromBudgetTitle(t.getFromBudget().getTitle())
                .toBudgetId(t.getToBudget().getId())
                .toBudgetTitle(t.getToBudget().getTitle())
                .amount(t.getAmount())
                .status(t.getStatus())
                .requestedById(t.getRequestedBy().getId())
                .requestedByFullName(t.getRequestedBy().fullName())
                .reason(t.getReason())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
