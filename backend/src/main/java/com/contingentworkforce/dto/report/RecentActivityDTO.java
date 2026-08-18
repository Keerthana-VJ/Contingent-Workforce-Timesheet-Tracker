package com.contingentworkforce.dto.report;

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
public class RecentActivityDTO {
    private UUID id;
    private String entityType;
    private String action;
    private String title;
    private String description;
    private String actorName;
    private String actorRole;
    private String status;
    private LocalDateTime timestamp;
}
