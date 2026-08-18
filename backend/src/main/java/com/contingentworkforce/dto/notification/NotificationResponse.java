package com.contingentworkforce.dto.notification;

import com.contingentworkforce.enums.NotificationType;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private UUID id;
    private UUID userId;
    private String title;
    private String message;
    private NotificationType type;

    @JsonProperty("isRead")
    private boolean isRead;

    private LocalDateTime createdAt;
}
