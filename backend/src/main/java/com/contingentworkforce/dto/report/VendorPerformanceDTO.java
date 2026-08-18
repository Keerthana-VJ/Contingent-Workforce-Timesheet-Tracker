package com.contingentworkforce.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorPerformanceDTO {
    private UUID vendorId;
    private String vendorName;
    private int score; // 0 - 100
    private String grade; // e.g. "A+", "A", "B", "C"
    private double timesheetAccuracyRate; // %
    private double invoiceAccuracyRate; // %
    private double milestoneCompletionRate; // %
    private int totalContractors;
    private int activeProjects;
}
