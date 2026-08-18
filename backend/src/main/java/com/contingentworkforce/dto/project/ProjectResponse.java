package com.contingentworkforce.dto.project;

import com.contingentworkforce.dto.auth.UserResponse;
import com.contingentworkforce.dto.vendor.VendorResponse;
import com.contingentworkforce.enums.ProjectStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {
    private UUID id;
    private String projectName;
    private String clientName;
    private String description;
    private VendorResponse vendor;
    private UserResponse manager;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal budget;
    private ProjectStatus status;
    private List<ProjectMemberResponse> members;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
