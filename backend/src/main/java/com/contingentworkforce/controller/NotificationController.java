package com.contingentworkforce.controller;

import com.contingentworkforce.dto.common.ApiResponse;
import com.contingentworkforce.dto.common.PageResponse;
import com.contingentworkforce.dto.notification.NotificationResponse;
import com.contingentworkforce.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "In-app notifications and alerts")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get paginated list of notifications for the current authenticated user")
    public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> getNotifications(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        PageResponse<NotificationResponse> response = notificationService.getCurrentUserNotifications(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark single notification as read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(@PathVariable UUID id) {
        NotificationResponse response = notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", response));
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all notifications for the current user as read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get total unread notifications count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        long count = notificationService.getUnreadCount();
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}
