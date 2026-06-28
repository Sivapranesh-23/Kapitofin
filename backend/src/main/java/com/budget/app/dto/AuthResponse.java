package com.budget.app.dto;

import com.budget.app.entity.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private Long regionId;
    private Long departmentId;
    private String regionName;
    private String departmentName;
}
