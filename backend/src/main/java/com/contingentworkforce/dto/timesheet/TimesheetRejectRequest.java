package com.contingentworkforce.dto.timesheet;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimesheetRejectRequest {
    @NotBlank(message = "Rejection reason is required")
    private String reason;
}
