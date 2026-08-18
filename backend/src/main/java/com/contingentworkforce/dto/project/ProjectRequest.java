package com.contingentworkforce.dto.project;

import com.contingentworkforce.enums.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectRequest {
    @NotBlank(message = "Project name is required")
    private String projectName;

    private String clientName;
    private String description;
    private UUID vendorId;
    private UUID managerId;
    private LocalDate startDate;
    private LocalDate endDate;

    @NotNull(message = "Budget is required")
    @PositiveOrZero(message = "Budget cannot be negative")
    private BigDecimal budget;

    private ProjectStatus status;
}
