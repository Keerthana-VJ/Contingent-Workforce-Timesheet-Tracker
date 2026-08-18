package com.contingentworkforce.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private long totalVendors;
    private long totalContractors;
    private long activeProjects;
    private long pendingTimesheets;
    private long pendingInvoices;
    private BigDecimal totalBilling;
    private BigDecimal totalPaid;
    private List<MonthlyBillingDTO> monthlyBilling;
    private List<ContractorHoursDTO> contractorHours;
    private List<InvoiceStatusDTO> invoiceStatus;
    private List<VendorPerformanceDTO> vendorPerformance;
    private List<RecentActivityDTO> recentActivities;
}
