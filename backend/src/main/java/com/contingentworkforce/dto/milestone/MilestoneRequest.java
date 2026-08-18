package com.contingentworkforce.dto.milestone;

import com.contingentworkforce.enums.MilestoneStatus;
import jakarta.validation.constraints.*;
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
public class MilestoneRequest {
    @NotNull(message = "Project ID is required")
    private UUID projectId;

    @NotBlank(message = "Milestone name is required")
    private String milestoneName;

    private String description;
    private LocalDate dueDate;

    @NotNull(message = "Billing amount is required")
    @PositiveOrZero(message = "Billing amount cannot be negative")
    private BigDecimal billingAmount;

    @Min(value = 0, message = "Completion percentage must be at least 0")
    @Max(value = 100, message = "Completion percentage cannot exceed 100")
    @Builder.Default
    private Integer completionPercentage = 0;

    private MilestoneStatus status;
}
