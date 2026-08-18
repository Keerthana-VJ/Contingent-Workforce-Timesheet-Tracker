package com.contingentworkforce.dto.timesheet;

import com.contingentworkforce.dto.auth.UserResponse;
import com.contingentworkforce.dto.contractor.ContractorResponse;
import com.contingentworkforce.enums.TimesheetStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimesheetResponse {
    private UUID id;
    private ContractorResponse contractor;
    private UUID projectId;
    private String projectName;
    private UUID milestoneId;
    private String milestoneName;
    private LocalDate workDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private BigDecimal breakHours;
    private BigDecimal totalHours;
    private String description;
    private TimesheetStatus status;
    private String rejectionReason;

    // Risk Tracking
    private Integer riskScore;
    private String riskLevel;
    private String riskReasons;

    private LocalDateTime submittedAt;
    private LocalDateTime approvedAt;
    private UserResponse approvedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}