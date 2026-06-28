package com.budget.app.controller;

import com.budget.app.dto.AuthResponse;
import com.budget.app.dto.LoginRequest;
import com.budget.app.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(Map.of(
                "token", response.getToken(),
                "user", response
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }
}
