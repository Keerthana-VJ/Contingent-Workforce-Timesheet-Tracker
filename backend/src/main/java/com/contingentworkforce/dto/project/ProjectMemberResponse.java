package com.contingentworkforce.dto.project;

import com.contingentworkforce.dto.contractor.ContractorResponse;
import com.contingentworkforce.enums.MemberStatus;
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
public class ProjectMemberResponse {
    private UUID id;
    private UUID projectId;
    private ContractorResponse contractor;
    private LocalDate assignedDate;
    private LocalDate endDate;
    private MemberStatus status;
}
