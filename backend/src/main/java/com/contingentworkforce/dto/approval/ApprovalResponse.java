package com.contingentworkforce.dto.approval;

import com.contingentworkforce.dto.auth.UserResponse;
import com.contingentworkforce.enums.ApprovalStatus;
import com.contingentworkforce.enums.EntityType;
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
public class ApprovalResponse {
    private UUID id;
    private EntityType entityType;
    private UUID entityId;
    private UserResponse submittedBy;
    private UserResponse approvedBy;
    private ApprovalStatus status;
    private String comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
