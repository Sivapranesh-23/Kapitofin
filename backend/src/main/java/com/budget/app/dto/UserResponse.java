package com.budget.app.dto;

import com.budget.app.entity.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String jobTitle;
    private Role role;
    private Long regionId;
    private String regionName;
    private Long departmentId;
    private String departmentName;
    private Boolean active;
    private Instant createdAt;
}
