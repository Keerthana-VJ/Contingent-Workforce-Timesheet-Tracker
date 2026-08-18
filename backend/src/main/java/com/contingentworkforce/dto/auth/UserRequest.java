package com.contingentworkforce.dto.auth;

import com.contingentworkforce.enums.Role;
import com.contingentworkforce.enums.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRequest {

    @NotBlank(message = "Full name is required")
    private String name;

    @NotBlank(message = "Email address is required")
    @Email(message = "Invalid email format")
    private String email;

    private String phone;

    @NotNull(message = "Role is required")
    private Role role;

    private String password;

    private UserStatus status;
}
