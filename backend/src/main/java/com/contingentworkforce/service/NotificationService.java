package com.contingentworkforce.service;

import com.contingentworkforce.dto.common.PageResponse;
import com.contingentworkforce.dto.notification.NotificationResponse;
import com.contingentworkforce.entity.User;
import com.contingentworkforce.enums.NotificationType;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface NotificationService {
    void createNotification(User user, String title, String message, NotificationType type);
    void notifyUser(UUID userId, String title, String message, NotificationType type);
    PageResponse<NotificationResponse> getCurrentUserNotifications(Pageable pageable);
    List<NotificationResponse> getCurrentUserNotificationsList();
    NotificationResponse markAsRead(UUID id);
    void markAllAsRead();
    long getUnreadCount();
}
