package com.contingentworkforce.dto.project;

import com.contingentworkforce.enums.MemberStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectMemberRequest {
    @NotNull(message = "Contractor ID is required")
    private UUID contractorId;

    private LocalDate assignedDate;
    private LocalDate endDate;
    private MemberStatus status;
}
