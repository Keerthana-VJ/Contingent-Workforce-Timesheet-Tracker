package com.contingentworkforce.dto.timesheet;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimesheetRequest {
    private UUID contractorId; // Optional if submitted by CONTRACTOR role (inferred from token)

    @NotNull(message = "Project ID is required")
    private UUID projectId;

    @NotNull(message = "Work date is required")
    private LocalDate workDate;

    @NotNull(message = "Start time is required")
    @JsonFormat(pattern = "HH:mm[:ss]")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    @JsonFormat(pattern = "HH:mm[:ss]")
    private LocalTime endTime;

    @PositiveOrZero(message = "Break hours cannot be negative")
    @Builder.Default
    private BigDecimal breakHours = BigDecimal.ZERO;

    private UUID milestoneId; // Milestone worked on / reached
    private String description;
}
