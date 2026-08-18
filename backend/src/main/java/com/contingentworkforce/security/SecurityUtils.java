package com.contingentworkforce.security;

import com.contingentworkforce.enums.Role;
import com.contingentworkforce.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static CustomUserDetails getCurrentUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails)) {
            throw new UnauthorizedException("User is not authenticated");
        }
        return (CustomUserDetails) authentication.getPrincipal();
    }

    public static UUID getCurrentUserId() {
        return getCurrentUserDetails().getId();
    }

    public static String getCurrentUserEmail() {
        return getCurrentUserDetails().getEmail();
    }

    public static Role getCurrentUserRole() {
        return Role.valueOf(getCurrentUserDetails().getRole());
    }

    public static boolean hasRole(Role role) {
        try {
            return getCurrentUserRole() == role;
        } catch (Exception e) {
            return false;
        }
    }

    public static boolean isAdmin() {
        return hasRole(Role.ADMIN);
    }

    public static boolean isManager() {
        return hasRole(Role.MANAGER);
    }

    public static boolean isVendor() {
        return hasRole(Role.VENDOR);
    }

    public static boolean isContractor() {
        return hasRole(Role.CONTRACTOR);
    }
}
