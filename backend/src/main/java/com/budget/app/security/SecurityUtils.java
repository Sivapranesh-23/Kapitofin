package com.budget.app.security;

import com.budget.app.entity.User;
import com.budget.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Helper to obtain the currently authenticated {@link User} entity.
 */
@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }

    public String getCurrentEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
