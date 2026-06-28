package com.budget.app.service;

import com.budget.app.dto.AuthResponse;
import com.budget.app.dto.LoginRequest;
import com.budget.app.entity.User;
import com.budget.app.exception.BusinessException;
import com.budget.app.exception.ResourceNotFoundException;
import com.budget.app.repository.UserRepository;
import com.budget.app.security.JwtUtil;
import com.budget.app.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final SecurityUtils securityUtils;

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException("Invalid email or password");
        }

        if (!user.getActive()) {
            throw new BusinessException("Account is disabled. Contact your administrator.");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .regionId(user.getRegion() != null ? user.getRegion().getId() : null)
                .departmentId(user.getDepartment() != null ? user.getDepartment().getId() : null)
                .regionName(user.getRegion() != null ? user.getRegion().getName() : null)
                .departmentName(user.getDepartment() != null ? user.getDepartment().getName() : null)
                .build();
    }

    public AuthResponse getCurrentUser() {
        User user = securityUtils.getCurrentUser();
        return AuthResponse.builder()
                .token(null) // no new token
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .regionId(user.getRegion() != null ? user.getRegion().getId() : null)
                .departmentId(user.getDepartment() != null ? user.getDepartment().getId() : null)
                .regionName(user.getRegion() != null ? user.getRegion().getName() : null)
                .departmentName(user.getDepartment() != null ? user.getDepartment().getName() : null)
                .build();
    }
}
