package com.contingentworkforce.dto.milestone;

import com.contingentworkforce.dto.auth.UserResponse;
import com.contingentworkforce.enums.MilestoneStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MilestoneResponse {
    private UUID id;
    private UUID projectId;
    private String projectName;
    private String milestoneName;
    private String description;
    private LocalDate dueDate;
    private BigDecimal billingAmount;
    private Integer completionPercentage;
    private MilestoneStatus status;
    private UserResponse approvedBy;
    private LocalDateTime approvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
