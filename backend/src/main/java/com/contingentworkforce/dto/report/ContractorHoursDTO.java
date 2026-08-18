package com.contingentworkforce.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractorHoursDTO {
    private UUID contractorId;
    private String contractorName;
    private String vendorName;
    private String projectName;
    private BigDecimal approvedHours;
    private BigDecimal pendingHours;
    private BigDecimal totalBilledAmount;
}
