package com.contingentworkforce.service;

import com.contingentworkforce.dto.auth.AuthResponse;
import com.contingentworkforce.dto.auth.LoginRequest;
import com.contingentworkforce.dto.auth.RegisterRequest;
import com.contingentworkforce.dto.auth.UserResponse;

import java.util.UUID;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    UserResponse register(RegisterRequest request);
    UserResponse getCurrentUser();
    UserResponse getUserById(UUID id);
}
