package com.contingentworkforce.service;

import com.contingentworkforce.dto.auth.UserRequest;
import com.contingentworkforce.dto.auth.UserResponse;
import com.contingentworkforce.enums.Role;

import java.util.List;
import java.util.UUID;

public interface UserService {
    List<UserResponse> getUsers(Role role, String search);
    UserResponse getUserById(UUID id);
    UserResponse createUser(UserRequest request);
    UserResponse updateUser(UUID id, UserRequest request);
    void deleteUser(UUID id);
}
