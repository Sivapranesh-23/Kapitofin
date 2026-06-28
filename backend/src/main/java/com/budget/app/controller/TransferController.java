package com.budget.app.controller;

import com.budget.app.dto.TransferRequest;
import com.budget.app.dto.TransferResponse;
import com.budget.app.service.TransferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transfers")
@RequiredArgsConstructor
public class TransferController {

    private final TransferService transferService;

    @GetMapping
    public ResponseEntity<List<TransferResponse>> getAll() {
        return ResponseEntity.ok(transferService.getAllTransfers());
    }

    @PostMapping
    public ResponseEntity<TransferResponse> request(@Valid @RequestBody TransferRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transferService.requestTransfer(request));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<TransferResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(transferService.approveTransfer(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<TransferResponse> reject(@PathVariable Long id) {
        return ResponseEntity.ok(transferService.rejectTransfer(id));
    }
}
